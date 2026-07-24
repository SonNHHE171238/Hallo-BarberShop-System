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

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung đánh giá." });
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

    // Kiểm tra giới hạn 7 ngày từ khi đơn hàng completed
    // Lấy log cuối cùng hoặc dùng order.updatedAt
    const completedLog = order.historyLog && order.historyLog.length > 0 
      ? order.historyLog[order.historyLog.length - 1] 
      : null;
    
    const completedDate = completedLog ? new Date(completedLog.timestamp) : new Date(order.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - completedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return res.status(403).json({ 
        success: false, 
        message: "Đơn hàng này đã vượt quá thời hạn 7 ngày để đánh giá." 
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

    // 4. Sinh Voucher (Chỉ dành cho User có tài khoản)
    let rewardVoucherCode = null;
    
    if (order.userId) {
      const Voucher = require('../models/voucher.model');
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      rewardVoucherCode = `GIFT-PR-${randomStr}`;
      
      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 ngày
      
      await Voucher.create({
        code: rewardVoucherCode,
        voucherType: 'product_only',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 50000,
        minOrderValue: 0,
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
      message: rewardVoucherCode 
        ? "Gửi đánh giá thành công! Bạn được tặng 1 Voucher quà tặng." 
        : "Gửi đánh giá thành công! Cảm ơn bạn.",
      data: {
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

    // Xử lý ẩn danh hoặc format guest name nếu cần, tạm thời để tự nhiên
    const formattedFeedbacks = await Promise.all(feedbacks.map(async (fb) => {
      let userName = "Khách Hàng Hallo";
      let userAvatar = `https://ui-avatars.com/api/?name=KH&background=random`;
      
      if (fb.userId) {
        userName = fb.userId.name;
        userAvatar = fb.userId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.userId.name)}&background=random`;
      } else {
         // Thử lấy thông tin Guest từ Order
         const orderInfo = await Order.findById(fb.orderId).select("customerName");
         if (orderInfo && orderInfo.customerName) {
           userName = orderInfo.customerName;
           userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(orderInfo.customerName)}&background=random`;
         }
      }

      return {
        _id: fb._id,
        productId: fb.productId,
        orderId: fb.orderId,
        userId: fb.userId ? fb.userId._id : null,
        rating: fb.rating,
        comment: fb.comment,
        createdAt: fb.createdAt,
        userName,
        userAvatar
      };
    }));

    return res.status(200).json({
      success: true,
      data: formattedFeedbacks,
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

// ADMIN: GET /api/products/feedbacks/all
exports.getAllProductFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    // Nếu muốn search theo tên SP, phải lookup Product, nhưng cho đơn giản tạm bỏ qua search text

    const feedbacks = await ProductFeedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("productId", "name image")
      .populate("userId", "name email");

    const total = await ProductFeedback.countDocuments(query);

    // Format cho Guest
    const formattedFeedbacks = await Promise.all(feedbacks.map(async (fb) => {
      let customerInfo = null;
      if (fb.userId) {
        customerInfo = { name: fb.userId.name, email: fb.userId.email, isMember: true };
      } else {
        const orderInfo = await Order.findById(fb.orderId).select("customerName customerPhone");
        if (orderInfo) {
          customerInfo = { name: orderInfo.customerName, phone: orderInfo.customerPhone, isMember: false };
        } else {
          customerInfo = { name: "Guest", isMember: false };
        }
      }

      return {
        ...fb.toObject(),
        customerInfo
      };
    }));

    return res.status(200).json({
      success: true,
      data: formattedFeedbacks,
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

// DELETE /api/products/feedbacks/:id
exports.deleteFeedback = async (req, res) => {
  try {
    // 1. Chỉ cho phép role 'customer' gỡ đánh giá
    if (req.role !== 'customer') {
      return res.status(403).json({ success: false, message: "Quyền bị từ chối. Chỉ khách hàng mới có thể gỡ đánh giá." });
    }

    // 2. Tìm đánh giá trước để kiểm tra tính sở hữu
    const feedback = await ProductFeedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    }

    // 3. Kiểm tra xem có đúng là chủ sở hữu đánh giá không (so khớp userId)
    if (!feedback.userId || feedback.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Quyền bị từ chối. Bạn không thể gỡ đánh giá của người khác." });
    }

    // 4. Thực hiện xóa
    await ProductFeedback.findByIdAndDelete(req.params.id);

    // Cập nhật lại số sao
    const stats = await ProductFeedback.aggregate([
      { $match: { productId: feedback.productId } },
      { $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(feedback.productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await Product.findByIdAndUpdate(feedback.productId, {
        averageRating: 0,
        totalReviews: 0
      });
    }

    return res.status(200).json({ success: true, message: "Xóa đánh giá thành công." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
