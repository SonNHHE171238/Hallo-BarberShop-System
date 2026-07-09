const ProductFeedback = require("../models/product-feedback.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// POST /api/products/:id/feedbacks
exports.createFeedback = async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment, orderCode } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn số sao hợp lệ từ 1 đến 5." });
    }

    if (!orderCode) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp Mã Đơn Hàng để đánh giá." });
    }

    // 1. Kiểm tra Verified Buyer qua Mã Đơn Hàng
    const order = await Order.findOne({
      orderCode: orderCode,
      status: "completed",
      "items.productId": productId
    });

    if (!order) {
      return res.status(403).json({ 
        success: false, 
        message: "Mã đơn hàng không hợp lệ, hoặc đơn hàng chưa hoàn thành, hoặc không chứa sản phẩm này." 
      });
    }

    // 2. Tạo Đánh giá
    try {
      await ProductFeedback.create({
        productId,
        orderId: order._id,
        userId: order.userId || null,
        rating,
        comment
      });
    } catch (err) {
      // 11000 là mã lỗi duplicate key của MongoDB (Unique Index)
      if (err.code === 11000) {
        return res.status(400).json({ 
          success: false, 
          message: "Sản phẩm trong đơn hàng này đã được bạn đánh giá rồi." 
        });
      }
      throw err;
    }

    // 3. Tính toán lại sao trung bình cho Sản phẩm
    const stats = await ProductFeedback.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    }

    // 4. Tặng điểm Loyalty và Sinh Voucher (Chỉ dành cho User có tài khoản)
    let pointsEarned = 0;
    let totalPoints = 0;
    let rewardVoucherCode = null;
    
    if (order.userId) {
      pointsEarned = 50;
      const user = await User.findByIdAndUpdate(
        order.userId,
        { $inc: { loyaltyPoints: pointsEarned } },
        { new: true }
      );
      if (user) totalPoints = user.loyaltyPoints;

      // Sinh Voucher thưởng
      const Voucher = require('../models/voucher.model');
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      rewardVoucherCode = `GIFT-PR-${randomStr}`;
      
      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 ngày
      
      await Voucher.create({
        code: rewardVoucherCode,
        discountType: 'fixed_amount',
        discountValue: 20000,
        minOrderValue: 100000,
        validFrom,
        validUntil,
        usageLimit: 1,
        usageLimitPerUser: 1,
        applicableUsers: [order.userId],
        isActive: true
      });
    }

    return res.status(201).json({
      success: true,
      message: pointsEarned > 0 
        ? "Gửi đánh giá thành công! Bạn được cộng 50 điểm và 1 Voucher quà tặng." 
        : "Gửi đánh giá thành công! Cảm ơn bạn.",
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

// GET /api/products/:id/feedbacks
exports.getFeedbacksByProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { productId };

    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    const feedbacks = await ProductFeedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar"); // Sẽ là null với khách Guest

    const total = await ProductFeedback.countDocuments(query);

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
