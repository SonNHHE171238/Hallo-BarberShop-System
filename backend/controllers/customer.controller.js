const Booking = require('../models/booking.model');
const { sendSuccess } = require('../utils/response.helper');

exports.getDashboardData = async (req, res, next) => {
  try {
    const customerId = req.userId;

    // Find the next upcoming booking (pending or confirmed)
    const nextAppointment = await Booking.findOne({
      customerId: customerId,
      status: { $in: ['pending', 'confirmed'] },
      bookingDate: { $gte: new Date() }
    })
      .sort({ bookingDate: 1 })
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name avatarUrl' }
      })
      .populate('services', 'name price durationMinutes')
      .lean();

    // Mock loyalty data as requested
    const loyaltyStats = {
      points: 1250,
      membershipLevel: 'THÀNH VIÊN CẤP CAO'
    };

    return sendSuccess(res, 200, 'Customer dashboard data retrieved successfully', {
      nextAppointment: nextAppointment || null,
      loyaltyStats
    });
  } catch (error) {
    next(error);
  }
};
