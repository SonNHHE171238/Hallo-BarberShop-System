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
    const { bookingId, returnUrl, cancelUrl, amount } = req.body;

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
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
    
    // Lưu orderCode vào booking để map
    booking.orderCode = orderCode;
    booking.paymentMethod = "bank_transfer";
    await booking.save();

    // Chuẩn bị dữ liệu tạo link thanh toán PayOS
    const isGuest = booking.bookingType === "guest";
    // Nếu client truyền lên amount, ưu tiên dùng amount đó (ví dụ tính tiền thu thêm). Ngược lại dùng mặc định
    const defaultAmountToPay = isGuest ? Math.round(booking.totalPrice / 2) : booking.totalPrice;
    const amountToPay = amount ? Number(amount) : defaultAmountToPay;

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
      qrCode: paymentLinkRes.qrCode // Chuỗi text QR để gen ảnh tại client
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    next(error);
  }
};

// Đón webhook từ PayOS
exports.payosWebhook = async (req, res, next) => {

  try {
    // SDK @payos/node v2.0.5 dùng payos.webhooks.verify và trả về Promise
    const webhookData = await payos.webhooks.verify(req.body);


    if (
      webhookData.desc === "success" ||
      webhookData.description === "Thành công" ||
      webhookData.description === "success" ||
      webhookData.code === "00" ||
      req.body.desc === "success" ||
      req.body.code === "00"
    ) {
      // Tìm booking bằng orderCode
      const booking = await Booking.findOne({ orderCode: webhookData.orderCode });
      if (booking) {
        booking.amountPaid = (booking.amountPaid || 0) + webhookData.amount;
        
        if (booking.amountPaid >= booking.totalPrice) {
          booking.paymentStatus = "paid";
        } else if (booking.amountPaid > 0) {
          booking.paymentStatus = "partial_paid";
        }
        
        booking.status = "completed"; 
        booking.completedAt = new Date();
        await booking.save();


        // Tạo Record Sổ cái
        const Payment = require("../models/payment.model");
        const paymentRecord = await Payment.create({
          target_type: 'booking',
          target_id: booking._id,
          amount: webhookData.amount,
          method: 'bank_transfer',
          status: 'success',
          transactionId: webhookData.reference || webhookData.transactionDateTime || Date.now().toString()
        });

      } else {
        console.warn("Webhook valid but Booking not found for orderCode:", webhookData.orderCode);
      }
    } else {

    }

    return res.json({
      success: true,
      error: 0,
      message: "Ok",
    });
  } catch (error) {
    console.error("Webhook Verification Error:", error.message);
    // Luôn trả về 200 để PayOS chấp nhận URL này, dù xác thực thất bại
    return res.status(200).json({
      success: true,
      error: 0,
      message: "Webhook setup check passed or ignored error",
    });
  }
};
