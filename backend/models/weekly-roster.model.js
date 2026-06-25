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
    morning: { barbers: Number, staff: Number },       // VD: { barbers: 5, staff: 1 }
    afternoon: { barbers: Number, staff: Number },
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('WeeklyRoster', weeklyRosterSchema);
