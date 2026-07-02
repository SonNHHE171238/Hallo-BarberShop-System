const mongoose = require('mongoose');
const { Schema } = mongoose;

const shiftRegistrationSchema = new Schema({
  rosterId: { type: Schema.Types.ObjectId, ref: 'WeeklyRoster', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['barber', 'staff'], required: true },
  registeredShifts: [{
    date: { type: Date, required: true },
    shifts: [{
      type: String,
      enum: ['morning', 'afternoon']
    }]
  }],
  totalShifts: Number,                                  // Tổng số ca đăng ký
  adminAdjusted: { type: Boolean, default: false },     // Admin đã chỉnh sửa?
  adjustmentNote: String,                               // Lý do admin chỉnh
  status: {
    type: String,
    enum: ['pending', 'approved', 'adjusted'],
    default: 'pending'
  },
}, { timestamps: true });

shiftRegistrationSchema.index({ rosterId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ShiftRegistration', shiftRegistrationSchema);
