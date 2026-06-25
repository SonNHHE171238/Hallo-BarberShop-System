const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    // 1. THÊM TRƯỜNG BOOKING TYPE Ở ĐÂY
    bookingType: {
      type: String,
      enum: ["user", "guest"],
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // 2. SỬA LẠI REQUIRED: Chỉ bắt buộc nếu là 'user'
      required: function () {
        return this.bookingType === "user";
      },
      default: null,
    },
    barberId: {
      type: Schema.Types.ObjectId,
      ref: "Barber",
      required: true,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],
    bookingDate: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    orderCode: {
      type: Number, // Dùng cho PayOS
      unique: true,
      sparse: true, // Cho phép null và đảm bảo unique với những cái khác null
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'bank_transfer', 'e_wallet'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial_paid', 'paid', 'refunded'],
      default: 'pending'
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
        "rejected",
      ],
      default: "pending",
    },
    notificationMethods: [
      {
        type: String,
        enum: ["email", "sms", "push"],
      },
    ],
    autoAssignedBarber: {
      type: Boolean,
      default: false,
    },

    // 3. RÀNG BUỘC THÔNG TIN GUEST
    customerName: {
      type: String,
      trim: true,
      // Bắt buộc nhập tên nếu là khách vãng lai
      required: function () {
        return this.bookingType === "guest";
      },
    },
    customerEmail: {
      type: String,
      trim: true,
      // Email có thể không bắt buộc với guest, tuỳ logic của bạn
    },
    customerPhone: {
      type: String,
      trim: true,
      // Bắt buộc để lại SĐT nếu là khách vãng lai
      required: function () {
        return this.bookingType === "guest";
      },
    },

    // --- CÁC TRƯỜNG AUDIT ---
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: {
      type: String,
      enum: [
        "barber_unavailable",
        "service_not_available",
        "customer_request",
        "other",
      ],
      default: null,
    },
    rejectionNote: { type: String, trim: true, default: null },
    noShowAt: { type: Date, default: null },
    noShowNote: { type: String, trim: true, default: null },
    reassignedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Barber",
      default: null,
    },
    reassignedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// --- INDEXES ---
bookingSchema.index({ customerId: 1, bookingDate: -1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

// LƯU Ý QUAN TRỌNG VỀ UNIQUE INDEX CHỐNG TRÙNG LỊCH:
// Dùng partial index để chỉ chặn trùng lịch đối với các booking chưa bị huỷ/từ chối.
// Lưu ý: index này chỉ chặn được 2 booking bắt đầu CÙNG MỘT THỜI ĐIỂM (chính xác đến mili-giây).
// Việc chống overlap (chồng lấn thời gian) cần được xử lý trong logic code (Controller).
bookingSchema.index(
  { barberId: 1, bookingDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed", "completed"] },
    },
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
