const bookingAvailabilityService = require('../services/bookingAvailability.service');

exports.checkAvailability = async (req, res) => {
  try {
    const { barberId, bookingDate, durationMinutes } = req.body;
    const result = await bookingAvailabilityService.checkAvailability(barberId, bookingDate, durationMinutes);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.getBookingConflicts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await bookingAvailabilityService.getBookingConflicts(startDate, endDate);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkCompletionEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId, role: userRole } = req.user;

    const result = await bookingAvailabilityService.checkCompletionEligibility(bookingId, userId, userRole);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.getWalkInAvailableSlots = async (req, res) => {
  try {
    const { serviceId, service_id, date } = req.query;
    const finalServiceId = serviceId || service_id;

    const result = await bookingAvailabilityService.getWalkInAvailableSlots(finalServiceId, date);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
