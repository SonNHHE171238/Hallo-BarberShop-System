const { PayOS } = require("@payos/node");
const Booking = require("../models/booking.model");
const { sendSuccess } = require("../utils/response.helper");

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

// Tạo link thanh toán
exports.createPaymentLink = async (req, res, next) => {
  try {
    const { bookingId, returnUrl, cancelUrl } = req.body;

    const booking = await Booking.findById(bookingId).populate("services");
    if (!booking) {
      const error = new Error("Không tìm thấy lịch hẹn");
      error.statusCode = 404;
      throw error;
    }

    // Nếu đã thanh toán rồi thì không cho tạo lại
    if (booking.paymentStatus === "paid") {
      const error = new Error("Lịch hẹn này đã được thanh toán");
      error.statusCode = 400;
      throw error;
    }

    // Tạo mã orderCode ngẫu nhiên (chỉ được là số, tối đa 53 bit nguyên)
    // Tốt nhất dùng Date.now() kết hợp random để không trùng
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
    
    // Lưu orderCode vào booking để map
    booking.orderCode = orderCode;
    booking.paymentMethod = "bank_transfer";
    await booking.save();

    // Chuẩn bị dữ liệu tạo link thanh toán PayOS
    const isGuest = booking.bookingType === "guest";
    const amountToPay = isGuest ? Math.round(booking.totalPrice / 2) : booking.totalPrice;

    const body = {
      orderCode: orderCode,
      amount: amountToPay,
      description: `Thanh toan #${booking._id.toString().slice(-6).toUpperCase()}`,
      returnUrl: returnUrl || process.env.PAYOS_RETURN_URL || "http://localhost:3000/booking/success",
      cancelUrl: cancelUrl || process.env.PAYOS_CANCEL_URL || "http://localhost:3000/booking/success",
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);

    return sendSuccess(res, 200, "Tạo link thanh toán thành công", {
      checkoutUrl: paymentLinkRes.checkoutUrl,
      paymentLinkId: paymentLinkRes.paymentLinkId,
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    next(error);
  }
};

// Đón webhook từ PayOS
exports.payosWebhook = async (req, res, next) => {
  console.log("PayOS Webhook received:", req.body);
  try {
    const webhookData = payos.webhooks.verify(req.body);

    if (
      webhookData.description === "Thành công" ||
      webhookData.code === "00"
    ) {
      // Tìm booking bằng orderCode
      const booking = await Booking.findOne({ orderCode: webhookData.orderCode });
      if (booking) {
        booking.amountPaid = webhookData.amount;
        
        if (webhookData.amount >= booking.totalPrice) {
          booking.paymentStatus = "paid";
        } else if (webhookData.amount > 0) {
          booking.paymentStatus = "partial_paid";
        }
        
        booking.status = "confirmed"; // Cập nhật luôn trạng thái lịch hẹn
        await booking.save();
      }
    }

    return res.json({
      success: true,
      error: 0,
      message: "Ok",
    });
  } catch (error) {
    console.error("Webhook Verification Error:", error.message);
    // Luôn trả về 200 để PayOS chấp nhận URL này, dù xác thực thất bại (có thể là test webhook)
    return res.status(200).json({
      success: true,
      error: 0,
      message: "Webhook setup check passed",
    });
  }
};
