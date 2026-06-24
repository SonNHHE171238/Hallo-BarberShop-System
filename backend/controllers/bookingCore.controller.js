const Booking = require("../models/booking.model");
const mongoose = require("mongoose");
const BarberSchedule = require("../models/barber-schedule.model");
const BarberAbsence = require("../models/barber-absence.model");
const CustomerServiceHistory = require("../models/customer-service-history.model");
const NoShow = require("../models/no-show.model");
const {
  validateBookingConfirmation,
  validateBookingStatusUpdate,
  validateBookingCancellation,
  validateBookingModification,
  shouldApplyTimeRestrictions,
  getBulkConfirmationError,
} = require("../utils/bookingValidation");
const {
  canCompleteBooking,
  getCompletionUIState,
  getTimeUntilCompletion,
} = require("../utils/timeWindowValidation");

const bookingService = require("../services/booking.service");
const emailService = require("../services/email.service");
const { sendSuccess } = require("../utils/response.helper");

exports.createBooking = async (req, res, next) => {
  try {
    const {
      barberId,
      services,
      bookingDate,
      timeSlot, // "HH:MM" format
      note,
      notificationMethods,
      autoAssignedBarber,
      customerName,
      customerEmail,
      customerPhone,
      bookingType,
    } = req.body;

    if (!["user", "guest"].includes(bookingType)) {
      const error = new Error('bookingType phải là "user" hoặc "guest"');
      error.statusCode = 400;
      throw error;
    }

    let customerId = null;
    if (bookingType === "user") {
      customerId = req.userId;
    } else if (bookingType === "guest") {
      if (!customerName || !customerPhone) {
        const error = new Error(
          "Khách vãng lai bắt buộc phải cung cấp Tên và Số điện thoại",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const populatedBooking = await bookingService.processCreateBooking({
      bookingType,
      customerId,
      barberId,
      services,
      bookingDate,
      timeSlot,
      note,
      notificationMethods,
      autoAssignedBarber,
      customerName,
      customerEmail,
      customerPhone,
    });

    const emailToSend = customerEmail || populatedBooking.customerId?.email;
    if (emailToSend) {
      emailService
        .sendBookingConfirmationEmail(emailToSend, {
          customerName:
            customerName || populatedBooking.customerId?.name || "Quý khách",
          serviceName:
            populatedBooking.services && populatedBooking.services.length > 0
              ? populatedBooking.services.map((s) => s.name).join(", ")
              : "Dịch vụ",
          barberName: populatedBooking.barberId?.userId?.name || "Thợ cắt",
          bookingDate: populatedBooking.bookingDate,
          timeSlot: timeSlot,
        })
        .catch((err) =>
          console.error("Failed to send confirmation email", err),
        );
    }

    return sendSuccess(res, 201, "Booking created successfully", {
      booking: populatedBooking,
    });
  } catch (err) {
    if (err.code === 11000) {
      err.message =
        "Tiếc quá! Khung giờ này vừa có người nhanh tay đặt mất rồi. Vui lòng chọn giờ khác nhé!";
      err.errorCode = "RACE_CONDITION_CONFLICT";
      err.statusCode = 409;
    }
    next(err);
  }
};

exports.createBookingSinglePage = async (req, res, next) => {
  try {
    const {
      serviceId, // For backward compatibility
      services: reqServices,
      barberId,
      bookingDate,
      timeSlot,
      date,
      note,
      notificationMethods,
      customerName,
      customerEmail,
      customerPhone,
      autoAssignBarber = false,
      isAutoAssign = false,
      bookingType,
    } = req.body;

    const services = reqServices && reqServices.length > 0 ? reqServices : (serviceId ? [serviceId] : []);
    let customerId = req.userId || null;

    if (!["user", "guest"].includes(bookingType)) {
      const error = new Error('bookingType phải là "user" hoặc "guest"');
      error.statusCode = 400;
      throw error;
    }

    if (bookingType === "guest") {
      if (!customerName || !customerPhone) {
        const error = new Error("Khách vãng lai cần cung cấp Tên và Số điện thoại");
        error.statusCode = 400;
        throw error;
      }
      customerId = null;
    } else if (bookingType === "user") {
      if (!customerId && !["staff", "admin", "manager"].includes(req.role)) {
        const error = new Error("Bạn cần đăng nhập để đặt lịch với tư cách thành viên");
        error.statusCode = 401;
        throw error;
      }
    }

    if (["staff", "admin", "manager"].includes(req.role)) {
      if (req.body.customerId) {
        customerId = req.body.customerId;
      } else if (bookingType === "guest") {
        customerId = null;
      }
    }

    if (services.length === 0 || !bookingDate || !date || !timeSlot) {
      const error = new Error("Services, booking date, date, and time slot are required");
      error.statusCode = 400;
      throw error;
    }

    const shouldAutoAssign = !barberId || barberId === "random" || barberId === "auto" || autoAssignBarber || isAutoAssign;

    const { populatedBooking, shouldAutoAssign: wasAutoAssigned } = await bookingService.processCreateSinglePageBooking({
      services,
      barberId,
      bookingDate,
      timeSlot,
      date,
      note,
      notificationMethods,
      customerName,
      customerEmail,
      customerPhone,
      bookingType,
      customerId,
      autoAssignBarber: shouldAutoAssign
    });

    const emailToSend = customerEmail || populatedBooking.customerId?.email;
    if (emailToSend) {
      const emailService = require("../services/email.service");
      emailService.sendBookingConfirmationEmail(emailToSend, {
        customerName: customerName || populatedBooking.customerId?.name || "Quý khách",
        serviceName: populatedBooking.services && populatedBooking.services.length > 0
            ? populatedBooking.services.map((s) => s.name).join(", ")
            : "Dịch vụ",
        barberName: populatedBooking.barberId?.userId?.name || "Thợ cắt",
        bookingDate: populatedBooking.bookingDate,
        timeSlot: timeSlot,
      }).catch((err) => console.error("Failed to send confirmation email", err));
    }

    return require("../utils/response.helper").sendSuccess(res, 201, "Booking created successfully", {
      booking: populatedBooking,
      isAutoAssigned: wasAutoAssigned
    });
  } catch (err) {
    if (err.code === 11000) {
      err.message = "Tiếc quá! Khung giờ này vừa có người nhanh tay đặt mất rồi. Vui lòng chọn giờ khác nhé!";
      err.errorCode = "RACE_CONDITION_CONFLICT";
      err.statusCode = 409;
    }
    next(err);
  }
};

// Lấy danh sách booking của user hiện tại với filtering và pagination
exports.getMyBookings = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "bookingDate",
      sortOrder = "desc",
    } = req.query;

    // Start with role-based filter from middleware
    const filter = { ...req.bookingFilter };

    // Apply additional filters
    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate("services", "name price durationMinutes category")
      .populate({
        path: "barberId",
        select: "userId specialties averageRating",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      userRole: req.role, // Include user role for frontend logic
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending bookings for admin review


// Confirm a pending booking (admin only)


// Bulk confirm multiple bookings (admin only)


// Assign barber to booking (Admin only)
exports.assignBarberToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newBarberId } = req.body;
    const adminId = req.userId;

    // Only admins can assign barbers
    if (req.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can assign barbers to bookings",
      });
    }

    // Validate input
    if (!newBarberId) {
      return res.status(400).json({ message: "New barber ID is required" });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if booking can be reassigned
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot assign barber to ${booking.status} booking`,
      });
    }

    // Verify the new barber exists
    const Barber = require("../models/barber.model");
    const newBarber = await Barber.findById(newBarberId).populate(
      "userId",
      "name email",
    );
    if (!newBarber) {
      return res.status(404).json({ message: "New barber not found" });
    }

    // Store old barber info for logging
    const oldBarberId = booking.barberId;

    // Update the booking
    booking.barberId = newBarberId;
    booking.reassignedFrom = oldBarberId;
    booking.reassignedAt = new Date();
    booking.reassignedBy = adminId;
    await booking.save();

    // Update barber schedules using the same logic as confirm booking
    try {
      const BarberSchedule = require("../models/barber-schedule.model");
      const bookingDate = new Date(booking.bookingDate);
      const dateStr = bookingDate.toISOString().split("T")[0];
      const startTimeStr = bookingDate.toTimeString().substring(0, 5);

      // Get service duration for proper slot marking
      const Service = require("../models/service.model");
      const service = await Service.findById(booking.serviceId);
      const durationMinutes = service ? service.durationMinutes : 30; // Default 30 minutes

      // 1. Free up slots for the old barber (if exists)
      if (oldBarberId) {
        try {
          await BarberSchedule.unmarkSlotsAsBooked(
            oldBarberId,
            dateStr,
            booking._id,
            null, // No session for standalone operation
          );
          console.log(`Freed up slots for old barber ${oldBarberId}`);
        } catch (unmaskError) {
          console.error("Error freeing slots for old barber:", unmaskError);
          // Continue even if this fails
        }
      }

      // 2. Mark slots as booked for the new barber using the same method as confirm booking
      const scheduleResult = await BarberSchedule.markSlotsAsBooked(
        newBarberId,
        dateStr,
        startTimeStr,
        durationMinutes,
        booking._id,
        null, // No session for standalone operation
      );

      console.log(
        `Successfully marked ${scheduleResult.totalSlotsBooked} slots as booked for new barber ${newBarberId}:`,
        scheduleResult.bookedSlots,
      );

      // Recalculate available slots for both barbers after successful assignment
      try {
        // Recalculate for old barber (if exists)
        if (oldBarberId) {
          await BarberSchedule.recalculateAvailableSlots(oldBarberId, dateStr);
          console.log(
            `Recalculated available slots for old barber ${oldBarberId} on ${dateStr}`,
          );
        }

        // Recalculate for new barber
        await BarberSchedule.recalculateAvailableSlots(newBarberId, dateStr);
        console.log(
          `Recalculated available slots for new barber ${newBarberId} on ${dateStr}`,
        );
      } catch (recalcError) {
        console.error(
          "Error recalculating available slots after assignment:",
          recalcError,
        );
        // Don't fail the assignment if recalculation fails, but log the error
      }
    } catch (scheduleError) {
      console.error("Error updating barber schedules:", scheduleError);
      // Continue with the assignment even if schedule update fails
      // But log the error for debugging
    }

    // Return simple response without complex populate
    res.json({
      success: true,
      message: "Barber assigned successfully",
      bookingId: booking._id,
      oldBarberId,
      newBarberId,
      newBarberName: newBarber.userId.name,
      customerName: booking.customerName || "Unknown",
      bookingDate: booking.bookingDate,
    });
  } catch (err) {
    console.error("Error in assignBarberToBooking:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update booking status (with enhanced role-based permissions)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    // Use booking from middleware if available
    const booking = req.booking || (await Booking.findById(bookingId));
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Role-based status transition validation with date-based rules for barbers
    const validTransitions = {
      admin: {
        pending: ["confirmed", "cancelled", "no_show"],
        confirmed: ["pending", "completed", "cancelled", "no_show"],
        cancelled: [],
        completed: [],
        no_show: [],
      },
      barber: {
        pending: ["confirmed", "no_show"],
        confirmed: ["pending", "completed", "no_show"],
        cancelled: [],
        completed: [],
        no_show: [],
      },
      customer: {
        pending: ["cancelled"],
        confirmed: [],
        cancelled: [],
        completed: [],
        no_show: [],
      },
    };

    // Validate status update using utility function
    const validation = validateBookingStatusUpdate(booking, status, userRole);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // Enhanced time-based validation for barbers
    if (userRole === "barber" && booking.status === "confirmed") {
      // Time window validation for completion
      if (status === "completed") {
        const completionCheck = canCompleteBooking(booking, userRole, 15); // 15-minute grace period

        if (!completionCheck.canComplete) {
          return res.status(400).json({
            message: completionCheck.reason,
            timeInfo: completionCheck.timeInfo,
            errorType: "TIME_WINDOW_VIOLATION",
          });
        }

        // Log successful time window validation
        console.log("Booking completion within time window:", {
          bookingId: booking._id,
          barberId: booking.barberId,
          timeInfo: completionCheck.timeInfo,
        });
      }

      // Date-based validation for no-show status
      if (status === "no_show") {
        const bookingDate = new Date(booking.bookingDate);
        const today = new Date();

        // Set time to start of day for accurate comparison
        bookingDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const isToday = bookingDate.getTime() === today.getTime();
        const isPast = bookingDate.getTime() < today.getTime();

        if (!isPast && !isToday) {
          return res.status(400).json({
            message:
              'Chỉ có thể đánh dấu "Không đến" cho booking trong quá khứ hoặc hôm nay',
          });
        }
      }
    }

    // Handle no-show status
    if (status === "no_show") {
      if (!isBarber && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Only barbers or admins can mark no-shows" });
      }

      // Record the no-show
      const noShow = new NoShow({
        customerId: booking.customerId,
        bookingId: booking._id,
        markedBy: userId,
        reason: reason || "Customer did not show up",
      });
      await noShow.save();
    }

    // Handle completion
    if (status === "completed") {
      const completionTime = new Date();

      // Create service history record
      const serviceHistory = new CustomerServiceHistory({
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        bookingId: booking._id,
        barberId: booking.barberId,
        completedAt: completionTime,
      });
      await serviceHistory.save();

      // Update service popularity
      const Service = require("../models/service.model");
      await Service.findByIdAndUpdate(booking.serviceId, {
        $inc: { popularity: 1 },
      });

      // DYNAMIC AVAILABILITY: Release barber slots from completion time onwards
      const BarberSchedule = require("../models/barber-schedule.model");
      const bookingDate = new Date(booking.bookingDate);
      const dateStr = bookingDate.toISOString().split("T")[0];

      try {
        const scheduleResult =
          await BarberSchedule.releaseCompletedBookingSlots(
            booking.barberId,
            dateStr,
            booking._id,
            completionTime,
            null, // No session for this operation
          );

        console.log(`Dynamic availability update: ${scheduleResult.message}`, {
          bookingId: booking._id,
          barberId: booking.barberId,
          completionTime: completionTime.toISOString(),
          releasedSlots: scheduleResult.releasedSlots,
          keptBookedSlots: scheduleResult.keptBookedSlots,
        });

        // Store completion time in booking for future reference
        booking.completedAt = completionTime;
      } catch (scheduleError) {
        console.error(
          "Error updating dynamic availability for completed booking:",
          scheduleError,
        );
        // Don't fail the status update if schedule update fails, but log the error
      }
    }

    // Handle schedule updates for status changes
    if (status === "cancelled") {
      // Unmark time slots in the barber schedule
      const BarberSchedule = require("../models/barber-schedule.model");
      const bookingDate = new Date(booking.bookingDate);
      const dateStr = bookingDate.toISOString().split("T")[0];

      try {
        const scheduleResult = await BarberSchedule.unmarkSlotsAsBooked(
          booking.barberId,
          dateStr,
          booking._id,
          null, // No session for this operation
        );

        console.log(
          `Successfully unmarked ${scheduleResult.totalSlotsUnbooked} slots for cancelled booking:`,
          scheduleResult.unbookedSlots,
        );
      } catch (scheduleError) {
        console.error(
          "Error unmarking schedule slots for cancelled booking:",
          scheduleError,
        );
        // Don't fail the status update if schedule update fails, but log the error
      }
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate("serviceId", "name price")
      .populate({
        path: "barberId",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    res.json({
      booking: updatedBooking,
      message: `Booking status updated to ${status}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user can cancel this booking
    if (booking.customerId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this booking" });
    }

    // Use validation utility to check if booking can be cancelled
    const cancellationValidation = validateBookingCancellation(booking);
    if (!cancellationValidation.valid) {
      return res.status(400).json({ message: cancellationValidation.error });
    }

    // Apply time restrictions only if the booking is not completed
    if (shouldApplyTimeRestrictions(booking)) {
      const now = new Date();
      const bookingTime = new Date(booking.bookingDate);
      const timeDifference = bookingTime.getTime() - now.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference < 2) {
        return res.status(400).json({
          message:
            "Cannot cancel booking less than 2 hours before appointment time",
        });
      }
    }

    // CRITICAL: Unmark time slots in the barber schedule
    const BarberSchedule = require("../models/barber-schedule.model");
    const bookingDate = new Date(booking.bookingDate);
    const dateStr = bookingDate.toISOString().split("T")[0];

    try {
      const scheduleResult = await BarberSchedule.unmarkSlotsAsBooked(
        booking.barberId,
        dateStr,
        booking._id,
        null, // No session for standalone MongoDB
      );

      console.log(
        `Successfully unmarked ${scheduleResult.totalSlotsUnbooked} slots:`,
        scheduleResult.unbookedSlots,
      );
    } catch (scheduleError) {
      console.error("Error unmarking schedule slots:", scheduleError);
      return res.status(500).json({
        message:
          "Failed to free time slots in schedule: " + scheduleError.message,
        errorCode: "SCHEDULE_UPDATE_FAILED",
      });
    }

    booking.status = "cancelled";
    booking.note = booking.note
      ? `${booking.note}\nCancellation reason: ${reason}`
      : `Cancellation reason: ${reason}`;
    await booking.save();

    // CRITICAL: Decrease barber's totalBookings count when booking is cancelled
    try {
      await Barber.findByIdAndUpdate(booking.barberId, {
        $inc: { totalBookings: -1 },
      });
      console.log(
        `✅ Decreased totalBookings for barber ${booking.barberId} due to cancellation`,
      );
    } catch (updateError) {
      console.error(
        "Error updating barber totalBookings on cancellation:",
        updateError,
      );
      // Don't fail the cancellation if this update fails, but log it
    }

    // Track cancellation as no-show record
    const NoShow = require("../models/no-show.model");

    // Determine if this is a late cancellation (less than 2 hours before appointment)
    const isLateCancellation = hoursDifference < 2;

    try {
      await NoShow.create({
        customerId: booking.customerId,
        bookingId: booking._id,
        barberId: booking.barberId,
        serviceId: booking.serviceId,
        originalBookingDate: booking.bookingDate,
        markedBy: userId,
        reason: isLateCancellation ? "late_cancellation" : "customer_cancelled",
        description: reason,
        isWithinPolicy: !isLateCancellation,
      });

      console.log(
        `No-show record created for booking ${booking._id}, customer ${booking.customerId}`,
      );
    } catch (noShowError) {
      console.error("Error creating no-show record:", noShowError);
      // Don't fail the cancellation if no-show tracking fails
    }

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (err) {
    console.error("Error in cancelBooking:", err);
    res.status(500).json({ message: err.message });
  }
};

// Sinh danh sách khung giờ động (Dynamic Gap Packing)
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { barberId, date, durationMinutes = 30 } = req.body;

    if (!barberId || !date) {
      const error = new Error("Barber ID and date are required");
      error.statusCode = 400;
      throw error;
    }

    const bookingService = require("../services/booking.service");
    const resultSlots = await bookingService.generateDynamicSlots(
      barberId,
      date,
      durationMinutes,
    );

    res.json({ success: true, slots: resultSlots });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const {
      search,
      status,
      barberId,
      serviceId,
      page = 1,
      limit = 20,
    } = req.query;
    const userRole = req.role;

    // Start with role-based filter from middleware
    const filter = { ...req.bookingFilter };

    // Apply additional filters
    if (status) filter.status = status;
    if (barberId) filter.barberId = barberId;
    if (serviceId) filter.serviceId = serviceId;
    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.customerName = regex;
    }

    // For barbers, ensure they only see confirmed bookings (enforced by middleware)
    // For admins, no additional restrictions

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate({
        path: "barberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("serviceId", "name price durationMinutes")
      .populate("customerId", "name email phone")
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      userRole, // Include user role for frontend logic
    });
  } catch (err) {
    console.error("Error in getAllBookings:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBarberTodayBookings = async (req, res, next) => {
  try {
    const Barber = require('../models/barber.model');
    const barber = await Barber.findOne({ userId: req.userId });
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Get today's start and end date string "YYYY-MM-DD"
    const today = new Date();
    // Use local time for Vietnam if needed, or just let DB string match if bookingDate is YYYY-MM-DD
    // Assuming bookingDate is stored as "YYYY-MM-DD"
    // To be safe, just get the local YYYY-MM-DD
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];

    const bookings = await Booking.find({
      barberId: barber._id,
      bookingDate: localISOTime
    })
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name price durationMinutes type')
      .sort({ timeSlot: 1 })
      .lean();

    res.status(200).json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.getBookingDetail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("serviceId", "name")
      .populate({
        path: "barberId",
        populate: { path: "userId", select: "name" },
      })
      .populate("customerId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if a booking can be completed based on time window
// Admin reject booking


// Barber mark booking as no-show






// Use for chatbot ai
exports.createBookingFromBot = async (payload, userId) => {
  try {
    const {
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
    } = payload;

    // Validate 30 phút trước lịch hẹn
    const now = new Date();
    const requestedDateTime = new Date(bookingDate);
    const minutesDiff = (requestedDateTime - now) / (1000 * 60);
    if (minutesDiff < 30) {
      return {
        statusCode: 400,
        message: "Lịch đặt phải cách thời điểm hiện tại ít nhất 30 phút.",
      };
    }

    // Enhanced no-show checking with detailed blocking logic
    const NoShow = require("../models/no-show.model");
    const isBlocked = await NoShow.isCustomerBlocked(userId, 3);
    if (isBlocked) {
      const noShowCount = await NoShow.getCustomerNoShowCount(userId);
      return {
        statusCode: 403,
        message: `Tài khoản của bạn bị chặn đặt lịch do có ${noShowCount} lần hủy/không đến. Vui lòng liên hệ hỗ trợ để giải quyết vấn đề này.`,
        errorCode: "CUSTOMER_BLOCKED",
        details: {
          noShowCount,
          limit: 3,
          contactSupport: true,
        },
      };
    }

    // Check nghỉ
    const BarberAbsence = require("../models/barber-absence.model");
    const isAbsent = await BarberAbsence.isBarberAbsent(
      barberId,
      requestedDateTime,
    );
    if (isAbsent) {
      return {
        statusCode: 400,
        message: "Thợ được chọn không làm việc vào ngày này.",
      };
    }

    // Check trùng lịch
    const Booking = require("../models/booking.model");
    const dateStr = requestedDateTime.toISOString().split("T")[0];
    const barberBookings = await Booking.find({
      barberId,
      bookingDate: {
        $gte: new Date(`${dateStr}T00:00:00.000Z`),
        $lt: new Date(`${dateStr}T23:59:59.999Z`),
      },
      status: { $in: ["pending", "confirmed"] },
    });

    const newStart = new Date(bookingDate);
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);
    const hasConflict = barberBookings.some((b) => {
      const start = new Date(b.bookingDate);
      const end = new Date(start.getTime() + b.durationMinutes * 60000);
      return newStart < end && newEnd > start;
    });

    if (hasConflict) {
      return {
        statusCode: 409,
        message: "Khung giờ bạn chọn đã bị trùng với lịch đặt trước đó.",
      };
    }

    // Check giới hạn booking mỗi ngày
    const Barber = require("../models/barber.model");
    const barber = await Barber.findById(barberId);
    if (!barber) {
      return { statusCode: 404, message: "Không tìm thấy thợ." };
    }

    if (barberBookings.length >= barber.maxDailyBookings) {
      return {
        statusCode: 400,
        message: "Thợ đã đạt giới hạn số lượng đặt lịch trong ngày.",
      };
    }

    // Tạo booking
    const booking = new Booking({
      customerId: userId,
      barberId,
      serviceId,
      bookingDate: new Date(bookingDate),
      durationMinutes,
      note,
      notificationMethods,
      autoAssignedBarber,
      customerName,
      customerEmail,
      customerPhone,
    });

    await booking.save();

    // Cập nhật totalBookings
    await Barber.findByIdAndUpdate(barberId, { $inc: { totalBookings: 1 } });

    return {
      statusCode: 201,
      booking,
    };
  } catch (err) {
    console.error("Lỗi trong createBookingFromBot:", err.message);
    return {
      statusCode: 500,
      message: "Đã xảy ra lỗi nội bộ khi tạo booking.",
    };
  }
};

// Update booking details (edit booking)
exports.updateBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { serviceId, barberId, bookingDate, note, durationMinutes } =
      req.body;
    const userId = req.userId;
    const userRole = req.role;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user can edit this booking
    if (userRole === "customer" && booking.customerId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own bookings" });
    }

    // Use validation utility to check if booking can be modified
    const modificationValidation = validateBookingModification(booking);
    if (!modificationValidation.valid) {
      return res.status(400).json({ message: modificationValidation.error });
    }

    // Apply time restrictions only if the booking is not completed
    if (shouldApplyTimeRestrictions(booking)) {
      const bookingTime = new Date(bookingDate || booking.bookingDate);
      const now = new Date();

      if (bookingTime < now) {
        return res.status(400).json({
          message: "Cannot edit past bookings",
        });
      }

      // Check if booking is within 24 hours (for customers)
      if (userRole === "customer") {
        const hoursDifference = (bookingTime - now) / (1000 * 60 * 60);
        if (hoursDifference < 24) {
          return res.status(400).json({
            message: "Cannot edit bookings within 24 hours of appointment time",
          });
        }
      }
    }

    // If changing time slot, validate availability (skip for completed bookings)
    if (
      bookingDate &&
      bookingDate !== booking.bookingDate.toISOString() &&
      shouldApplyTimeRestrictions(booking)
    ) {
      try {
        const targetBarberId = barberId || booking.barberId;
        const targetDuration = durationMinutes || booking.durationMinutes;
        const requestedStart = new Date(bookingDate);
        const requestedEnd = new Date(
          requestedStart.getTime() + targetDuration * 60000,
        );
        const dateStr = requestedStart.toISOString().split("T")[0];

        // Check for barber conflicts (excluding current booking and completed bookings)
        const barberBookings = await Booking.find({
          barberId: targetBarberId,
          _id: { $ne: bookingId }, // Exclude current booking
          bookingDate: {
            $gte: new Date(dateStr + "T00:00:00.000Z"),
            $lt: new Date(dateStr + "T23:59:59.999Z"),
          },
          status: { $in: ["pending", "confirmed"] }, // Only check active bookings, exclude completed
        });

        // Check for customer conflicts (excluding current booking and completed bookings)
        const customerBookings = await Booking.find({
          customerId: booking.customerId,
          _id: { $ne: bookingId }, // Exclude current booking
          bookingDate: {
            $gte: new Date(dateStr + "T00:00:00.000Z"),
            $lt: new Date(dateStr + "T23:59:59.999Z"),
          },
          status: { $in: ["pending", "confirmed"] }, // Only check active bookings, exclude completed
        });

        // Check for time conflicts
        const allConflictingBookings = [...barberBookings, ...customerBookings];
        for (const conflictBooking of allConflictingBookings) {
          const conflictStart = new Date(conflictBooking.bookingDate);
          const conflictEnd = new Date(
            conflictStart.getTime() +
              (conflictBooking.durationMinutes || 30) * 60000,
          );

          if (
            (requestedStart >= conflictStart && requestedStart < conflictEnd) ||
            (requestedEnd > conflictStart && requestedEnd <= conflictEnd) ||
            (requestedStart <= conflictStart && requestedEnd >= conflictEnd)
          ) {
            const isCustomerConflict =
              conflictBooking.customerId.toString() ===
              booking.customerId.toString();
            return res.status(409).json({
              message: isCustomerConflict
                ? "You already have a booking at this time"
                : "Selected time slot is not available",
              conflictType: isCustomerConflict
                ? "CUSTOMER_CONFLICT"
                : "BARBER_CONFLICT",
              conflictDetails: {
                conflictingTime: conflictBooking.bookingDate,
                conflictingBarber: isCustomerConflict ? null : targetBarberId,
              },
            });
          }
        }

        // Check if barber is available (not absent)
        const BarberAbsence = require("../models/barber-absence.model");
        const isBarberAbsent = await BarberAbsence.isBarberAbsent(
          targetBarberId,
          requestedStart,
        );
        if (isBarberAbsent) {
          return res.status(409).json({
            message: "Barber is not available on this date",
            conflictType: "BARBER_ABSENCE",
          });
        }
      } catch (validationError) {
        console.error("Time slot validation failed:", validationError);
        // Continue with update but log the error
      }
    }

    // Update booking fields
    const updateFields = {};
    if (serviceId) updateFields.serviceId = serviceId;
    if (barberId) updateFields.barberId = barberId;
    if (bookingDate) updateFields.bookingDate = new Date(bookingDate);
    if (note !== undefined) updateFields.note = note;
    if (durationMinutes) updateFields.durationMinutes = durationMinutes;

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateFields,
      { new: true },
    )
      .populate("serviceId", "name price durationMinutes")
      .populate({
        path: "barberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("customerId", "name email phone");

    // If time slot changed, update barber schedule
    if (bookingDate && bookingDate !== booking.bookingDate.toISOString()) {
      const BarberSchedule = require("../models/barber-schedule.model");

      try {
        // Unmark old time slot
        const oldDate = booking.bookingDate;
        const oldDateStr = oldDate.toISOString().split("T")[0];

        await BarberSchedule.unmarkSlotsAsBooked(
          booking.barberId,
          oldDateStr,
          bookingId,
        );

        // Mark new time slot
        const newDate = new Date(bookingDate);
        const newDateStr = newDate.toISOString().split("T")[0];
        const newStartTime = newDate.toTimeString().substring(0, 5);

        await BarberSchedule.markSlotsAsBooked(
          barberId || booking.barberId,
          newDateStr,
          [newStartTime],
          bookingId,
        );

        console.log(
          `Updated schedule: unmarked old slot on ${oldDateStr}, marked ${newStartTime} on ${newDateStr}`,
        );
      } catch (scheduleError) {
        console.error("Error updating barber schedule:", scheduleError);
        // Don't fail the booking update if schedule update fails
      }
    }

    res.json({
      booking: updatedBooking,
      message: "Booking updated successfully",
    });
  } catch (err) {
    console.error("Error in updateBookingDetails:", err);
    res.status(500).json({ message: err.message });
  }
};

// Test booking flow with auto-assign (without actually creating booking)
exports.testBookingFlowAutoAssign = async (req, res) => {
  try {
    const { date, timeSlot, serviceId, customerId } = req.body;

    if (!date || !timeSlot || !customerId) {
      return res.status(400).json({
        success: false,
        message: "Date, timeSlot, and customerId are required",
      });
    }

    console.log(
      `\n🧪 [TEST BOOKING FLOW] Testing auto-assign for ${date} at ${timeSlot}`,
    );
    console.log("=".repeat(80));

    // Step 1: Check current barber data
    const Booking = require("../models/booking.model");
    const Barber = require("../models/barber.model");

    const barbers = await Barber.find({
      isAvailable: true,
      autoAssignmentEligible: true,
    })
      .populate("userId", "name")
      .select("userId totalBookings")
      .lean();

    console.log("📊 [TEST] Current barber data:");
    for (const barber of barbers) {
      const realTimeCount = await Booking.countDocuments({
        barberId: barber._id,
        status: { $in: ["pending", "confirmed", "completed"] },
      });

      console.log(
        `  - ${barber.userId?.name}: stored=${barber.totalBookings || 0}, realTime=${realTimeCount}`,
      );
    }

    // Step 2: Simulate auto-assign logic
    console.log("\n🎯 [TEST] Simulating auto-assign...");

    let finalBarberId = null;
    let autoAssignBarber = true; // Force auto-assign

    // Handle auto-assignment logic (same as createBookingSinglePage)
    if (autoAssignBarber) {
      try {
        console.log(
          `🎯 [TEST] Auto-assignment requested for ${date} at ${timeSlot}`,
        );

        // Use the NEW auto-assignment logic (same as autoAssignBarberForSlot)
        const barberController = require("./barber.controller");

        // Create a mock request/response to call the auto-assign function
        const mockReq = {
          body: { date, timeSlot, serviceId },
        };

        let autoAssignResult = null;
        const mockRes = {
          json: (data) => {
            autoAssignResult = data;
            return data;
          },
          status: (code) => ({
            json: (data) => {
              autoAssignResult = { ...data, statusCode: code };
              return autoAssignResult;
            },
          }),
        };

        // Call the auto-assign function
        console.log(
          `🔍 [TEST] Calling autoAssignBarberForSlot with:`,
          mockReq.body,
        );
        await barberController.autoAssignBarberForSlot(mockReq, mockRes);
        console.log(`🔍 [TEST] Auto-assign result:`, autoAssignResult);

        if (
          autoAssignResult &&
          autoAssignResult.success &&
          autoAssignResult.assignedBarber
        ) {
          finalBarberId = autoAssignResult.assignedBarber._id;

          console.log(
            `✅ [TEST] Auto-assigned barber: ${autoAssignResult.assignedBarber.name} (${autoAssignResult.assignedBarber.totalBookings} total bookings)`,
          );
          console.log(
            `📊 [TEST] Assignment reason: ${autoAssignResult.assignmentDetails.reason}`,
          );
          console.log(`🎯 [TEST] Final barber ID: ${finalBarberId}`);
        } else {
          console.error("❌ [TEST] Auto-assignment failed:", autoAssignResult);
        }
      } catch (autoAssignError) {
        console.error("❌ [TEST] Error in auto-assignment:", autoAssignError);
      }
    }

    console.log("\n✅ [TEST] Booking flow test completed");
    console.log("=".repeat(80));

    res.json({
      success: true,
      message: "Test completed - check console logs for detailed analysis",
      result: {
        finalBarberId,
        selectedBarberName: finalBarberId
          ? barbers.find((b) => b._id.toString() === finalBarberId.toString())
              ?.userId?.name
          : null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in test booking flow:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to test booking flow",
    });
  }
};

// Create a new walk-in booking (Admin/Staff only)
exports.createWalkInBooking = async (req, res) => {
  try {
    const {
      services,
      barberId,
      bookingDate,
      timeSlot,
      date,
      customerName,
      customerPhone,
      customerEmail,
      note,
      notificationMethods,
    } = req.body;

    // Validate required fields
    if (
      !services ||
      services.length === 0 ||
      !bookingDate ||
      !date ||
      !timeSlot ||
      !customerName ||
      !customerPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Service, booking date, date, time slot, customer name, and phone are required",
        errorCode: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Validate service exists
    const Service = require("../models/service.model");
    const foundServices = await Service.find({ _id: { $in: services } });
    if (foundServices.length !== services.length || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "One or more services not found",
        errorCode: "SERVICE_NOT_FOUND",
      });
    }

    let finalDurationMinutes = 0;
    foundServices.forEach((service) => {
      finalDurationMinutes += service.durationMinutes || service.duration || 30;
    });

    const requestedDateTime = new Date(bookingDate);
    requestedDateTime.setSeconds(0, 0);

    let finalBarberId = barberId;
    let isAutoAssigned = false;

    // Handle auto-assignment logic
    const shouldAutoAssign =
      !barberId || barberId === "random" || barberId === "auto";

    if (shouldAutoAssign) {
      try {
        console.log(
          `🎯 [WALK-IN BOOKING] Auto-assignment triggered for ${date} at ${timeSlot}`,
        );
        const barberController = require("./barber.controller");

        // Create a mock request/response to call the auto-assign function
        const mockReq = {
          body: { date, timeSlot, services },
        };

        let autoAssignResult = null;
        const mockRes = {
          json: (data) => {
            autoAssignResult = data;
            return data;
          },
          status: (code) => ({
            json: (data) => {
              autoAssignResult = { ...data, statusCode: code };
              return autoAssignResult;
            },
          }),
        };

        await barberController.autoAssignBarberForSlot(mockReq, mockRes);

        if (
          autoAssignResult &&
          autoAssignResult.success &&
          autoAssignResult.assignedBarber
        ) {
          finalBarberId = autoAssignResult.assignedBarber._id;
          isAutoAssigned = true;
        } else {
          console.error(
            "❌ [WALK-IN BOOKING] Auto-assignment failed:",
            autoAssignResult,
          );
          return res.status(404).json({
            success: false,
            message:
              autoAssignResult?.message ||
              "No barbers available for auto-assignment",
            errorCode: "AUTO_ASSIGNMENT_FAILED",
          });
        }
      } catch (autoAssignError) {
        console.error("Error in auto-assignment:", autoAssignError);
        return res.status(500).json({
          success: false,
          message: "Failed to auto-assign barber",
          errorCode: "AUTO_ASSIGNMENT_FAILED",
        });
      }
    }

    // Validate barber exists
    const Barber = require("../models/barber.model");
    const finalBarber = await Barber.findById(finalBarberId);
    if (!finalBarber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
        errorCode: "BARBER_NOT_FOUND",
      });
    }

    // Check if barber is absent on the requested date
    const isBarberAbsent = await BarberAbsence.isBarberAbsent(
      finalBarberId,
      requestedDateTime,
    );
    if (isBarberAbsent) {
      return res.status(400).json({
        success: false,
        message: "Selected barber is not available on this date",
        errorCode: "BARBER_ABSENT",
      });
    }

    const dateStr = requestedDateTime.toISOString().split("T")[0];

    // Get all existing bookings for the barber on this date
    const barberBookings = await Booking.find({
      barberId: finalBarberId,
      bookingDate: {
        $gte: new Date(dateStr + "T00:00:00.000Z"),
        $lt: new Date(dateStr + "T23:59:59.999Z"),
      },
      status: { $in: ["pending", "confirmed"] },
    }).sort({ bookingDate: 1 });

    const newStart = new Date(bookingDate);
    const newEnd = new Date(newStart.getTime() + finalDurationMinutes * 60000);

    // Check for barber conflicts (same barber, overlapping time)
    const barberConflict = barberBookings.find((booking) => {
      const existingStart = new Date(booking.bookingDate);
      const existingEnd = new Date(
        existingStart.getTime() + booking.durationMinutes * 60000,
      );
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (barberConflict) {
      return res.status(409).json({
        success: false,
        message: `Time slot conflict detected. The selected time overlaps with an existing booking.`,
        errorCode: "BOOKING_CONFLICT",
        conflictDetails: {
          conflictType: "BARBER_CONFLICT",
          conflictingTime: barberConflict.bookingDate,
          conflictingDuration: barberConflict.durationMinutes,
          requestedTime: bookingDate,
          requestedDuration: finalDurationMinutes,
        },
      });
    }

    // Check barber's daily booking limit
    if (barberBookings.length >= finalBarber.maxDailyBookings) {
      return res.status(400).json({
        success: false,
        message: "Barber has reached maximum bookings for this date",
        errorCode: "DAILY_LIMIT_EXCEEDED",
      });
    }

    // Create the booking
    const booking = new Booking({
      bookingType: "guest",
      customerId: null,
      barberId: finalBarberId,
      services,
      bookingDate: requestedDateTime,
      note,
      notificationMethods,
      autoAssignedBarber: isAutoAssigned,
      customerName,
      customerEmail,
      customerPhone,
      status: "confirmed",
      confirmedAt: new Date(),
    });

    await booking.save();

    // Update barber's totalBookings count
    try {
      await Barber.findByIdAndUpdate(finalBarberId, {
        $inc: { totalBookings: 1 },
      });
      console.log(`✅ Updated totalBookings for barber ${finalBarberId}`);
    } catch (updateError) {
      console.error("Error updating barber totalBookings:", updateError);
    }

    // Mark time slots as booked in the barber schedule
    const startTimeStr = timeSlot;

    try {
      const scheduleResult = await BarberSchedule.markSlotsAsBooked(
        finalBarberId,
        dateStr,
        startTimeStr,
        finalDurationMinutes,
        booking._id,
        null,
      );
      console.log("Successfully marked slots booked:", scheduleResult);
    } catch (scheduleError) {
      console.error("Error marking schedule slots as booked:", scheduleError);
      // Clean up booking if schedule update fails
      await Booking.findByIdAndDelete(booking._id);
      return res.status(409).json({
        success: false,
        message:
          "Failed to reserve time slots in schedule: " + scheduleError.message,
        errorCode: "SCHEDULE_UPDATE_FAILED",
      });
    }

    // Populate the response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("serviceId", "name price durationMinutes category")
      .populate(
        "barberId",
        "userId specialties averageRating experienceYears profileImageUrl",
      )
      .populate({
        path: "barberId",
        populate: {
          path: "userId",
          select: "name email profileImageUrl",
        },
      });

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: isAutoAssigned
        ? `Walk-in booking created successfully with auto-assigned barber: ${populatedBooking.barberId?.userId?.name || "Unknown"}`
        : "Walk-in booking created successfully",
    });
  } catch (err) {
    console.error("Error in createWalkInBooking:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      errorCode: "INTERNAL_ERROR",
    });
  }
};
