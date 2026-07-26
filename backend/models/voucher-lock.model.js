const mongoose = require('mongoose');
const { Schema } = mongoose;

const voucherLockSchema = new Schema(
  {
    voucherId: {
      type: Schema.Types.ObjectId,
      ref: 'Voucher',
      required: true,
    },
    // Lưu lại user hoặc số điện thoại khách vãng lai để đối chiếu giới hạn
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerPhone: {
      type: String,
      default: null,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    status: {
      type: String,
      enum: ['holding', 'redeemed', 'released'],
      default: 'holding',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Index để dọn dẹp các bản ghi hết hạn nhanh hơn
voucherLockSchema.index({ status: 1, expiresAt: 1 });
voucherLockSchema.index({ voucherId: 1, status: 1 });

module.exports = mongoose.model('VoucherLock', voucherLockSchema);
