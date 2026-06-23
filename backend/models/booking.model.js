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

    // --- CÁC TRƯỜNG AUDIT GIỮ NGUYÊN ---
    confirmedAt: { type: Date, default: null },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    completedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
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
    noShowBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reassignedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Barber",
      default: null,
    },
    reassignedAt: { type: Date, default: null },
    reassignedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    noShowNote: { type: String, trim: true, default: null },
  },
  {
    timestamps: true,
  },
);

// --- INDEXES ---
bookingSchema.index({ customerId: 1, bookingDate: -1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

// LƯU Ý QUAN TRỌNG VỀ UNIQUE INDEX CHỐNG TRÙNG LỊCH:
// Ở schema cũ bạn để: bookingSchema.index({ barberId: 1, bookingDate: 1 });
// Nếu 'bookingDate' của bạn là một Date object lưu CẢ NGÀY VÀ GIỜ (VD: 2026-06-15T09:00:00.000Z)
// Thì bạn PHẢI thêm { unique: true } vào để chống 2 người book cùng lúc như bài toán ta vừa bàn.
bookingSchema.index({ barberId: 1, bookingDate: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);
