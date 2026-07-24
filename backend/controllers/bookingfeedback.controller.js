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

// GET /api/bookingfeedbacks/testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    // Lấy các đánh giá từ 3 sao trở lên, có comment, mới nhất
    const feedbacks = await BookingFeedback.find({
      rating: { $gte: 3 },
      comment: { $exists: true, $ne: "" }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: "bookingId",
        select: "customerName customerType customerId customerPhone bookingDate bookingType",
        populate: {
          path: "customerId",
          select: "name avatarUrl createdAt"
        }
      });

    const formattedFeedbacks = feedbacks.map(f => {
      let cName = "Khách hàng";
      let cRole = "Khách hàng Hallo";
      let cAvatar = "https://ui-avatars.com/api/?name=K&background=random";

      if (f.bookingId) {
        cName = f.bookingId.customerName || "Khách hàng";
        
        if (f.bookingId.bookingType === "guest") {
          const bDate = new Date(f.bookingId.bookingDate);
          const dateStr = `${bDate.getDate().toString().padStart(2, '0')}/${(bDate.getMonth() + 1).toString().padStart(2, '0')}/${bDate.getFullYear()}`;
          cRole = `Khách đã sử dụng dịch vụ tại ngày ${dateStr}`;
        } else if (f.bookingId.customerId) {
          const createdDate = new Date(f.bookingId.customerId.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now - createdDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          cRole = `Thành viên Hallo (${diffDays} ngày)`;
        }

        if (f.bookingId.customerId) {
          cName = f.bookingId.customerId.name || cName;
          if (f.bookingId.customerId.avatarUrl) {
            cAvatar = f.bookingId.customerId.avatarUrl;
          } else {
            cAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cName)}&background=random`;
          }
        } else {
          cAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cName)}&background=random`;
        }
      }

      return {
        _id: f._id,
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt,
        customerName: cName,
        customerRole: cRole,
        customerAvatar: cAvatar
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedFeedbacks
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
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
    const barberImage = barberUser ? barberUser.avatarUrl : "https://via.placeholder.com/150";

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

    // Cập nhật lại số sao trung bình cho Barber
    const mongoose = require("mongoose");
    const stats = await FeedbackBarber.aggregate([
      { $match: { barberId: new mongoose.Types.ObjectId(booking.barberId) } },
      { $group: {
          _id: "$barberId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Barber.findByIdAndUpdate(booking.barberId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        ratingCount: stats[0].count
      });
    }

    // 3. Xử lý cộng điểm Loyalty và Sinh Voucher nếu là Customer
    let pointsEarned = 0;
    let totalPoints = 0;
    let rewardVoucherCode = null;

    if (booking.bookingType === "user" && booking.customerId) {
      pointsEarned = 50; // Tặng 50 điểm
      const user = await User.findByIdAndUpdate(
        booking.customerId,
        { $inc: { loyaltyPoints: pointsEarned } },
        { returnDocument: "after" }
      );
      if (user) {
        totalPoints = user.loyaltyPoints;
      }

      // Sinh Voucher thưởng
      const Voucher = require('../models/voucher.model');
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      rewardVoucherCode = `GIFT-BK-${randomStr}`;
      
      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 ngày
      
      await Voucher.create({
        code: rewardVoucherCode,
        voucherType: 'booking_only',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 50000,
        minOrderValue: 0,
        validFrom,
        validUntil,
        usageLimit: 1,
        usageLimitPerUser: 1,
        applicableUsers: [booking.customerId],
        isActive: true
      });
    }

    return res.status(201).json({
      success: true,
      message: "Gửi đánh giá thành công!",
      data: {
        pointsEarned,
        totalPoints,
        rewardVoucherCode
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// ADMIN: GET /api/bookingfeedbacks/all
exports.getAllBookingFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    const feedbacks = await BookingFeedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "bookingId",
        select: "customerName customerPhone barberId services bookingDate",
        populate: [
          { path: "barberId", select: "userId" }, // Need to populate barberId to get the barber name later if needed
          { path: "services", select: "name" }
        ]
      });

    const total = await BookingFeedback.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// ADMIN: DELETE /api/bookingfeedbacks/:id
exports.deleteBookingFeedback = async (req, res) => {
  try {
    const feedback = await BookingFeedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    }

    // Xóa liên kết hoặc cập nhật lại điểm nếu cần. Ở đây đơn giản chỉ cần xóa bình luận
    return res.status(200).json({ success: true, message: "Xóa đánh giá thành công." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
