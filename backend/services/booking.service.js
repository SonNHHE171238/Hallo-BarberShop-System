const Booking = require('../models/booking.model');
const Barber = require('../models/barber.model');
const Service = require('../models/service.model');
const NoShow = require('../models/no-show.model');
const BarberAbsence = require('../models/barber-absence.model');
const BarberSchedule = require('../models/barber-schedule.model');

/**
 * Handle business logic for creating a new booking
 */
exports.processCreateBooking = async ({
  bookingType,
  customerId,
  barberId,
  serviceId,
  bookingDate,
  timeSlot,
  durationMinutes,
  note,
  notificationMethods,
  autoAssignedBarber,
  customerName,
  customerEmail,
  customerPhone,
}) => {
  // Normalize Date to prevent race conditions
  const requestedDateTime = new Date(bookingDate);
  requestedDateTime.setSeconds(0, 0);

  // Time Buffer Validation (30 mins advance)
  const now = new Date();
  const minutesDifference = (requestedDateTime.getTime() - now.getTime()) / (1000 * 60);

  if (minutesDifference < 30) {
    const error = new Error('Bookings must be made at least 30 minutes in advance');
    error.statusCode = 400;
    error.errorCode = 'BOOKING_TOO_SOON';
    throw error;
  }

  // No-show validation for User
  if (bookingType === 'user' && customerId) {
    const isBlocked = await NoShow.isCustomerBlocked(customerId, 3);
    if (isBlocked) {
      const noShowCount = await NoShow.getCustomerNoShowCount(customerId);
      const error = new Error(`Booking blocked due to ${noShowCount} cancellations/no-shows.`);
      error.statusCode = 403;
      error.errorCode = 'CUSTOMER_BLOCKED';
      throw error;
    }
  }

  // Barber Absence
  const isBarberAbsent = await BarberAbsence.isBarberAbsent(barberId, requestedDateTime);
  if (isBarberAbsent) {
    const error = new Error('Selected barber is not available on this date');
    error.statusCode = 400;
    error.errorCode = 'BARBER_ABSENT';
    throw error;
  }

  // Conflict Checking (Overlap)
  const dateStr = requestedDateTime.toISOString().split('T')[0];
  const barberBookings = await Booking.find({
    barberId,
    bookingDate: {
      $gte: new Date(dateStr + 'T00:00:00.000Z'),
      $lt: new Date(dateStr + 'T23:59:59.999Z'),
    },
    status: { $in: ['pending', 'confirmed'] },
  }).sort({ bookingDate: 1 });

  const newStart = new Date(requestedDateTime);
  const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

  // 1. Barber Conflict
  const barberConflict = barberBookings.find((booking) => {
    const existingStart = new Date(booking.bookingDate);
    const existingEnd = new Date(existingStart.getTime() + booking.durationMinutes * 60000);
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (barberConflict) {
    const error = new Error(`Time slot conflict detected. Your ${durationMinutes}-minute service overlaps with an existing booking.`);
    error.statusCode = 409;
    error.errorCode = 'BOOKING_CONFLICT';
    throw error;
  }

  // 2. Customer Conflict
  if (bookingType === 'user' && customerId) {
    const customerBookings = await Booking.find({
      customerId,
      bookingDate: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lt: new Date(dateStr + 'T23:59:59.999Z'),
      },
      status: { $in: ['pending', 'confirmed'] },
    });

    const customerConflict = customerBookings.find((booking) => {
      const existingStart = new Date(booking.bookingDate);
      const existingEnd = new Date(existingStart.getTime() + booking.durationMinutes * 60000);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (customerConflict) {
      const error = new Error(`You already have a booking during this time period.`);
      error.statusCode = 409;
      error.errorCode = 'CUSTOMER_DOUBLE_BOOKING';
      throw error;
    }
  }

  // Barber Daily Limit
  const barber = await Barber.findById(barberId);
  if (!barber) {
    const error = new Error('Barber not found');
    error.statusCode = 404;
    throw error;
  }

  if (barberBookings.length >= barber.maxDailyBookings) {
    const error = new Error('Barber has reached maximum bookings for this date');
    error.statusCode = 400;
    error.errorCode = 'DAILY_LIMIT_EXCEEDED';
    throw error;
  }

  // Service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Save Booking
  const booking = new Booking({
    bookingType,
    customerId,
    barberId,
    serviceId,
    bookingDate: requestedDateTime,
    durationMinutes,
    note,
    notificationMethods,
    autoAssignedBarber,
    customerName,
    customerEmail,
    customerPhone,
  });

  await booking.save();

  // Update totalBookings (non-blocking)
  try {
    await Barber.findByIdAndUpdate(barberId, { $inc: { totalBookings: 1 } });
  } catch (updateError) {
    console.error('Error updating barber totalBookings:', updateError);
  }

  // Lock Schedule
  try {
    await BarberSchedule.markSlotsAsBooked(
      barberId,
      dateStr,
      timeSlot,
      durationMinutes,
      booking._id,
      null
    );
  } catch (scheduleError) {
    await Booking.findByIdAndDelete(booking._id);
    const error = new Error('Failed to reserve time slots in schedule: ' + scheduleError.message);
    error.statusCode = 409;
    error.errorCode = 'SCHEDULE_UPDATE_FAILED';
    throw error;
  }

  // Return populated
  const populatedBooking = await Booking.findById(booking._id)
    .populate('serviceId', 'name price durationMinutes')
    .populate('barberId', 'userId specialties averageRating')
    .populate({
      path: 'barberId',
      populate: { path: 'userId', select: 'name email' },
    });

  return populatedBooking;
};
