const Booking = require("../models/booking.model");
const BookingFeedback = require("../models/bookingfeedback.model");
const FeedbackBarber = require("../models/feedbackbarber.model");
const User = require("../models/user.model");
const Barber = require("../models/barber.model");
const Service = require("../models/service.model");

// Hàm mã hoá số điện thoại cho Guest
const maskPhone = (phone) => {
  if (!phone || phone.length < 10) return phone;
  // Ví dụ: 0987654321 -> 0xxx654xxx
  const middle = phone.slice(4, 7);
  return `0xxx${middle}xxx`;
};

// GET /api/bookingfeedbacks/lookup/:phone
exports.lookupByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Tìm User có sđt này (nếu là Customer)
    const user = await User.findOne({ phone });

    // Lấy tất cả các chuyến cắt đã completed của sđt này
    const query = {
      status: "completed",
      $or: [{ customerPhone: phone }]
    };
    if (user) {
      query.$or.push({ customerId: user._id });
    }

    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1 })
      .populate("barberId")
      .populate("services");

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch sử cắt tóc nào đã hoàn thành." });
    }

    // Tìm chuyến cắt gần nhất CHƯA ĐƯỢC ĐÁNH GIÁ
    let targetBooking = null;
    for (const b of bookings) {
      const existingFeedback = await BookingFeedback.exists({ bookingId: b._id });
      if (!existingFeedback) {
        targetBooking = b;
        break;
      }
    }

    if (!targetBooking) {
      return res.status(400).json({ success: false, message: "Tất cả lịch sử cắt tóc của bạn đều đã được đánh giá. Cảm ơn bạn!" });
    }

    // Lấy thông tin hiển thị Customer
    let customerDisplay = "";
    if (targetBooking.bookingType === "guest") {
      customerDisplay = maskPhone(targetBooking.customerPhone || phone);
    } else {
      // Customer
      const custName = targetBooking.customerName || (user ? user.name : "Khách hàng");
      customerDisplay = `Anh: ${custName}`;
    }

    // Lấy thông tin Barber và Service
    const barberUser = await User.findById(targetBooking.barberId.userId);
    const barberName = barberUser ? barberUser.name : "Thợ cắt";
    const barberImage = barberUser ? barberUser.avatar : "https://via.placeholder.com/150";

    const serviceName = targetBooking.services && targetBooking.services.length > 0 
      ? targetBooking.services[0].name 
      : "Dịch vụ cắt tóc";

    // Format thời gian: HH:mm - DD/MM/YYYY
    const d = new Date(targetBooking.bookingDate);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

    return res.status(200).json({
      success: true,
      data: {
        bookingId: targetBooking._id,
        barberName: barberName,
        barberImage: barberImage,
        serviceName: serviceName,
        time: timeStr,
        customerDisplay: customerDisplay
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// POST /api/bookingfeedbacks
exports.createFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đánh giá." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chuyến cắt tóc." });
    }

    // Kiểm tra xem đã đánh giá chưa
    const existingFeedback = await BookingFeedback.exists({ bookingId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: "Chuyến cắt tóc này đã được đánh giá." });
    }

    // 1. Tạo bản ghi cho Booking (bookingfeedbacks)
    await BookingFeedback.create({
      bookingId,
      rating,
      comment
    });

    // 2. Tạo bản ghi cho Barber (feedbackbarbers)
    await FeedbackBarber.create({
      barberId: booking.barberId,
      userId: booking.bookingType === "user" ? booking.customerId : null,
      rating
    });

    // 3. Xử lý cộng điểm Loyalty nếu là Customer
    let pointsEarned = 0;
    let totalPoints = 0;

    if (booking.bookingType === "user" && booking.customerId) {
      pointsEarned = 50; // Tặng 50 điểm
      const user = await User.findByIdAndUpdate(
        booking.customerId,
        { $inc: { loyaltyPoints: pointsEarned } },
        { new: true }
      );
      if (user) {
        totalPoints = user.loyaltyPoints;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Gửi đánh giá thành công!",
      data: {
        pointsEarned,
        totalPoints
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
