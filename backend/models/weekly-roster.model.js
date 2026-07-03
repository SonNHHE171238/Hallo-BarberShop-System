const mongoose = require('mongoose');
const { Schema } = mongoose;

const weeklyRosterSchema = new Schema({
  weekStartDate: { type: Date, required: true },     // Thứ 2
  weekEndDate: { type: Date, required: true },        // Chủ Nhật
  status: {
    type: String,
    enum: ['draft', 'open_for_registration', 'reviewing', 'published'],
    default: 'draft'
  },
  registrationDeadline: Date,                          // Hạn chót đăng ký
  shiftRequirements: [{
    dayOfWeek: Number,                                 // 0=CN, 1=T2, ..., 6=T7
    morning: { staff: Number },                        // VD: { staff: 1 }
    afternoon: { staff: Number },
  }],
  closedDays: [{
    date: { type: Date },                              // Ngày đóng cửa (ví dụ: '2026-07-05')
    reason: { type: String }                           // Lý do đóng cửa (ví dụ: 'Sửa đường ống nước')
  }],
  minShiftsPerStaff: { type: Number, default: 5 },     // Thuật toán đếm số ca tối thiểu

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('WeeklyRoster', weeklyRosterSchema);
