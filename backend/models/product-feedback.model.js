const mongoose = require("mongoose");
const { Schema } = mongoose;

const productFeedbackSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // Khách Guest sẽ không có userId
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Anti-spam: Mỗi sản phẩm trong 1 đơn hàng chỉ được đánh giá 1 lần
productFeedbackSchema.index({ productId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model("ProductFeedback", productFeedbackSchema);
