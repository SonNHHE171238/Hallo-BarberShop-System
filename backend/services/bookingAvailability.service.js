const Booking = require("../models/booking.model");
const BarberAbsence = require("../models/barber-absence.model");
const BarberSchedule = require("../models/barber-schedule.model");
const Barber = require("../models/barber.model");
const Service = require("../models/service.model");
const {
  canCompleteBooking,
  getCompletionUIState,
  getTimeUntilCompletion,
} = require("../utils/booking-time.utils");

class BookingAvailabilityService {
  async checkAvailability(barberId, bookingDate, durationMinutes) {
    if (!barberId || !bookingDate || !durationMinutes) {
      const error = new Error("Barber ID, booking date, and duration are required");
      error.statusCode = 400;
      throw error;
    }

    const requestedDateTime = new Date(bookingDate);

    // Check if barber is absent
    const isAbsent = await BarberAbsence.isBarberAbsent(barberId, requestedDateTime);
    if (isAbsent) {
      return { available: false, reason: "Barber is absent on this date" };
    }

    // Check for conflicts
    const dateStr = requestedDateTime.toISOString().split("T")[0];
    const conflictingBookings = await Booking.find({
      barberId,
      bookingDate: {
        $gte: new Date(dateStr + "T00:00:00.000Z"),
        $lt: new Date(dateStr + "T23:59:59.999Z"),
      },
      status: { $in: ["pending", "confirmed"] },
    });

    // Check for time overlaps
    const newStart = new Date(bookingDate);
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

    const hasConflict = conflictingBookings.some((booking) => {
      const existingStart = new Date(booking.bookingDate);
      const existingEnd = new Date(existingStart.getTime() + booking.durationMinutes * 60000);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      return {
        available: false,
        reason: "Time slot conflicts with existing booking",
        conflictingBookings: conflictingBookings.map((booking) => ({
          id: booking._id,
          date: booking.bookingDate,
          duration: booking.durationMinutes,
        })),
      };
    }

    // Check daily booking limit
    const barber = await Barber.findById(barberId);
    if (conflictingBookings.length >= barber.maxDailyBookings) {
      return {
        available: false,
        reason: "Barber has reached maximum bookings for this date",
      };
    }

    return {
      available: true,
      message: "Time slot is available",
    };
  }

  async getBookingConflicts(startDate, endDate) {
    const filter = {
      status: { $in: ["pending", "confirmed"] },
    };

    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate("barberId", "userId")
      .populate("serviceId", "name")
      .populate("customerId", "name email")
      .sort({ bookingDate: 1 });

    const conflicts = [];
    const barberBookings = {};

    bookings.forEach((booking) => {
      const barberId = booking.barberId._id.toString();
      const dateStr = booking.bookingDate.toISOString().split("T")[0];
      const key = `${barberId}-${dateStr}`;

      if (!barberBookings[key]) {
        barberBookings[key] = [];
      }
      barberBookings[key].push(booking);
    });

    Object.values(barberBookings).forEach((dayBookings) => {
      if (dayBookings.length > 1) {
        for (let i = 0; i < dayBookings.length; i++) {
          for (let j = i + 1; j < dayBookings.length; j++) {
            const booking1 = dayBookings[i];
            const booking2 = dayBookings[j];

            const start1 = new Date(booking1.bookingDate);
            const end1 = new Date(start1.getTime() + booking1.durationMinutes * 60000);
            const start2 = new Date(booking2.bookingDate);
            const end2 = new Date(start2.getTime() + booking2.durationMinutes * 60000);

            if (start1 < end2 && start2 < end1) {
              conflicts.push({
                type: "time_overlap",
                bookings: [booking1, booking2],
                barber: booking1.barberId,
                date: start1.toISOString().split("T")[0],
              });
            }
          }
        }
      }
    });

    return {
      conflicts,
      totalConflicts: conflicts.length,
    };
  }

  async checkCompletionEligibility(bookingId, userId, userRole) {
    const booking = await Booking.findById(bookingId)
      .populate("serviceId", "name durationMinutes")
      .populate("customerId", "name")
      .populate("barberId", "name");

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    const isBarber = userRole === "barber" && booking.barberId.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isBarber && !isAdmin) {
      const error = new Error("You can only check completion eligibility for your own bookings");
      error.statusCode = 403;
      throw error;
    }

    const completionCheck = canCompleteBooking(booking, userRole, 15);
    const uiState = getCompletionUIState(booking, userRole, 15);
    const timeUntilCompletion = getTimeUntilCompletion(booking);

    return {
      bookingId: booking._id,
      canComplete: completionCheck.canComplete,
      reason: completionCheck.reason,
      timeInfo: completionCheck.timeInfo,
      uiState: uiState,
      timeUntilCompletion: timeUntilCompletion,
      booking: {
        id: booking._id,
        customerName: booking.customerId?.name || "Unknown",
        serviceName: booking.serviceId?.name || "Unknown",
        bookingDate: booking.bookingDate,
        durationMinutes: booking.durationMinutes,
        status: booking.status,
      },
    };
  }

  async getWalkInAvailableSlots(serviceId, date) {
    if (!serviceId || !date) {
      const error = new Error("Service ID and date are required");
      error.statusCode = 400;
      throw error;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      const error = new Error("Invalid date format. Use YYYY-MM-DD");
      error.statusCode = 400;
      throw error;
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      const error = new Error("Service not found");
      error.statusCode = 404;
      throw error;
    }

    const durationMinutes = service.durationMinutes || 30;
    const barbers = await Barber.find({ isAvailable: true }).populate("userId", "name profileImageUrl");

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const isToday = date === todayStr;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const availableSlotsMap = {};

    for (const barber of barbers) {
      const dateObj = new Date(`${date}T00:00:00.000Z`);
      const isAbsent = await BarberAbsence.isBarberAbsent(barber._id, dateObj);
      if (isAbsent) continue;

      await BarberSchedule.getAvailableSlots(barber._id, date);
      const schedule = await BarberSchedule.findOne({ barberId: barber._id, date });
      if (!schedule || schedule.isOffDay) continue;

      const slotDuration = schedule.slotDuration || 30;
      const slotsNeeded = Math.ceil(durationMinutes / slotDuration);

      const slotsByTime = {};
      schedule.availableSlots.forEach((slot) => {
        slotsByTime[slot.time] = slot;
      });

      for (const slot of schedule.availableSlots) {
        if (slot.isBooked || slot.isBlocked) continue;

        if (isToday) {
          const [slotHour, slotMin] = slot.time.split(":").map(Number);
          if (slotHour < currentHour || (slotHour === currentHour && slotMin < currentMinute)) {
            continue;
          }
        }

        let isConsecutiveAvailable = true;
        let tempHour = parseInt(slot.time.split(":")[0]);
        let tempMinute = parseInt(slot.time.split(":")[1]);

        for (let i = 0; i < slotsNeeded; i++) {
          const checkTimeStr = `${tempHour.toString().padStart(2, "0")}:${tempMinute.toString().padStart(2, "0")}`;
          const currentSlot = slotsByTime[checkTimeStr];

          if (!currentSlot || currentSlot.isBooked || currentSlot.isBlocked) {
            isConsecutiveAvailable = false;
            break;
          }

          tempMinute += slotDuration;
          if (tempMinute >= 60) {
            tempHour += Math.floor(tempMinute / 60);
            tempMinute = tempMinute % 60;
          }
        }

        if (isConsecutiveAvailable) {
          if (!availableSlotsMap[slot.time]) {
            availableSlotsMap[slot.time] = [];
          }
          availableSlotsMap[slot.time].push({
            _id: barber._id,
            name: barber.userId?.name || "Unknown",
            profileImageUrl: barber.profileImageUrl || barber.userId?.profileImageUrl,
            specialties: barber.specialties || [],
            experienceYears: barber.experienceYears || 0,
            averageRating: barber.averageRating || 0,
          });
        }
      }
    }

    const sortedSlots = Object.keys(availableSlotsMap)
      .sort((a, b) => a.localeCompare(b))
      .map((time) => ({
        timeSlot: time,
        barbers: availableSlotsMap[time],
      }));

    return {
      service: {
        _id: service._id,
        name: service.name,
        durationMinutes,
        price: service.price,
      },
      date,
      availableSlots: sortedSlots,
    };
  }
}

module.exports = new BookingAvailabilityService();
