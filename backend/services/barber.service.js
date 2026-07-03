const Barber = require('../models/barber.model');
const Booking = require('../models/booking.model');
const BarberAbsence = require('../models/barber-absence.model');

class BarberService {
  async autoAssignBarberService({ date, timeSlot, durationMinutes }) {
    // 1. Get all eligible barbers
    const barbers = await Barber.find({
      $or: [{ isAvailable: true }, { isAvailable: { $exists: false } }],
      autoAssignmentEligible: { $ne: false } // Default is true if missing
    });

    if (barbers.length === 0) {
      const error = new Error("Không có thợ cắt tóc nào đang hoạt động");
      error.statusCode = 404;
      throw error;
    }

    const startDateTime = new Date(`${date}T${timeSlot}:00+07:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
    
    // Check if startDateTime is valid
    if (isNaN(startDateTime.getTime())) {
      const error = new Error("Ngày hoặc giờ không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const startStr = startDateTime.toISOString().split("T")[0];

    const availableBarbers = [];

    for (const barber of barbers) {
      const barberId = barber._id;

      // 2. Check if barber is absent
      const isAbsent = await BarberAbsence.isBarberAbsent(barberId, startDateTime);
      if (isAbsent) continue;

      // 3. Check for conflicting bookings
      const conflictingBookings = await Booking.find({
        barberId,
        bookingDate: {
          $gte: new Date(startStr + "T00:00:00.000Z"),
          $lt: new Date(startStr + "T23:59:59.999Z"),
        },
        status: { $in: ["pending", "confirmed"] },
      });

      const hasConflict = conflictingBookings.some((booking) => {
        const bStart = new Date(booking.bookingDate).getTime();
        const bEnd = bStart + booking.durationMinutes * 60000;
        return startDateTime.getTime() < bEnd && endDateTime.getTime() > bStart;
      });

      if (hasConflict) continue;

      // 4. Check daily limits
      if (conflictingBookings.length >= (barber.maxDailyBookings || 12)) continue;

      availableBarbers.push({
        barber,
        bookingCount: conflictingBookings.length
      });
    }

    if (availableBarbers.length === 0) {
      const error = new Error("Không tìm thấy thợ cắt tóc nào trống vào khung giờ này");
      error.statusCode = 404;
      throw error;
    }

    // Sort by booking count (asc) to distribute load evenly, then by rating (desc)
    availableBarbers.sort((a, b) => {
      if (a.bookingCount !== b.bookingCount) return a.bookingCount - b.bookingCount;
      return (b.barber.averageRating || 0) - (a.barber.averageRating || 0);
    });

    return availableBarbers[0].barber;
  }
}

module.exports = new BarberService();
