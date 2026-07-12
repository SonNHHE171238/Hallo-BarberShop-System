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
      if (!["barber", "admin", "manager"].includes(userRole)) {
        return res
          .status(403)
          .json({ message: "Only barbers or admins can mark no-shows" });
      }

      // Record the no-show only if the customer is a registered user
      if (booking.customerId) {
        const noShow = new NoShow({
          customerId: booking.customerId,
          bookingId: booking._id,
          barberId: booking.barberId,
          serviceId:
            booking.services && booking.services.length > 0
              ? booking.services[0]._id || booking.services[0]
              : null,
          originalBookingDate: booking.bookingDate,
          markedBy: userId,
          reason: "no_show",
        });
        await noShow.save();
      }
    }

    // Handle completion
    if (status === "completed") {
      const completionTime = new Date();

      // Create service history record
      const serviceHistory = new CustomerServiceHistory({
        customerId: booking.customerId,
        serviceId:
          booking.services && booking.services.length > 0
            ? booking.services[0]._id
            : null,
        bookingId: booking._id,
        barberId: booking.barberId,
        completedAt: completionTime,
      });
      await serviceHistory.save();

      // Update service popularity
      const Service = require("../models/service.model");
      await Service.findByIdAndUpdate(
        booking.services && booking.services.length > 0
          ? booking.services[0]._id
          : null,
        {
          $inc: { popularity: 1 },
        },
      );

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

        // Store completion time in booking for future reference
        booking.completedAt = completionTime;
      } catch (scheduleError) {
        console.error(
          "Error updating dynamic availability for completed booking:",
          scheduleError,
        );
        // Don't fail the status update if schedule update fails, but log the error
      }

      // Redeem voucher lock if booking is completed (for cash/offline payments)
      if (booking.voucherLockId) {
        try {
          const voucherController = require("./voucher.controller");
          await voucherController.redeemVoucherLock(booking.voucherLockId);
        } catch (err) {
          console.error(
            "Failed to redeem voucher lock for completed booking:",
            err,
          );
        }
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
      } catch (scheduleError) {
        console.error(
          "Error unmarking schedule slots for cancelled booking:",
          scheduleError,
        );
        // Don't fail the status update if schedule update fails, but log the error
      }

      // Release voucher lock if booking is cancelled
      if (booking.voucherLockId) {
        try {
          const voucherController = require("./voucher.controller");
          await voucherController.releaseVoucherLock(booking.voucherLockId);
        } catch (err) {
          console.error(
            "Failed to release voucher lock for cancelled booking:",
            err,
          );
        }
      }
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate("services", "name price")
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
      .populate("services", "name price durationMinutes")
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

    // Fetch customer info
    const User = require("../models/user.model");
    let customerNameForEmail = booking.customerName || "Quý khách";
    let customerEmailForEmail = booking.customerEmail;
    if (booking.customerId) {
      const customer = await User.findById(booking.customerId).select(
        "name email",
      );
      if (customer) {
        customerNameForEmail = customer.name;
        customerEmailForEmail = customer.email;
      }
    }

    // Fetch service info
    const Service = require("../models/service.model");
    let serviceNameForEmail = "Dịch vụ";
    let firstServiceId =
      booking.services && booking.services.length > 0
        ? booking.services[0]._id || booking.services[0]
        : null;
    if (firstServiceId) {
      const service = await Service.findById(firstServiceId).select("name");
      if (service) {
        serviceNameForEmail = service.name;
      }
    }

    // Store old barber info for logging and email
    const oldBarberId = booking.barberId;
    const oldBarber = await Barber.findById(oldBarberId).populate(
      "userId",
      "name",
    );
    const oldBarberName = oldBarber?.userId?.name || "Unknown";

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
      const serviceForDuration = await Service.findById(firstServiceId);
      const durationMinutes = serviceForDuration
        ? serviceForDuration.durationMinutes
        : 30; // Default 30 minutes

      // 1. Free up slots for the old barber (if exists)
      if (oldBarberId) {
        try {
          await BarberSchedule.unmarkSlotsAsBooked(
            oldBarberId,
            dateStr,
            booking._id,
            null, // No session for standalone operation
          );
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

      // Recalculate available slots for both barbers after successful assignment
      try {
        // Recalculate for old barber (if exists)
        if (oldBarberId) {
          await BarberSchedule.recalculateAvailableSlots(oldBarberId, dateStr);
        }

        // Recalculate for new barber
        await BarberSchedule.recalculateAvailableSlots(newBarberId, dateStr);
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

    // Send email notification to customer
    try {
      if (customerEmailForEmail) {
        const bookingDate = new Date(booking.bookingDate);
        const timeSlot = bookingDate.toTimeString().substring(0, 5);

        await emailService.sendBookingReassignmentEmail(customerEmailForEmail, {
          customerName: customerNameForEmail,
          serviceName: serviceNameForEmail,
          newBarberName: newBarber.userId.name,
          oldBarberName,
          bookingDate,
          timeSlot,
        });
      }
    } catch (emailError) {
      console.error("Error sending reassignment email:", emailError);
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
    if (!booking.customerId || booking.customerId.toString() !== userId) {
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
      if (booking.customerId) {
        await NoShow.create({
          customerId: booking.customerId,
          bookingId: booking._id,
          barberId: booking.barberId,
          serviceId:
            booking.services && booking.services.length > 0
              ? booking.services[0]._id || booking.services[0]
              : null,
          originalBookingDate: booking.bookingDate,
          markedBy: userId,
          reason: isLateCancellation
            ? "late_cancellation"
            : "customer_cancelled",
          description: reason,
          isWithinPolicy: !isLateCancellation,
        });
      }
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
exports.testBookingFlowAutoAssign = async (req, res) => {
  try {
    const { date, timeSlot, serviceId, customerId } = req.body;

    if (!date || !timeSlot || !customerId) {
      return res.status(400).json({
        success: false,
        message: "Date, timeSlot, and customerId are required",
      });
    }

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

    for (const barber of barbers) {
      const realTimeCount = await Booking.countDocuments({
        barberId: barber._id,
        status: { $in: ["pending", "confirmed", "completed"] },
      });
    }

    // Step 2: Simulate auto-assign logic

    let finalBarberId = null;
    let autoAssignBarber = true; // Force auto-assign

    // Handle auto-assignment logic (same as createBookingSinglePage)
    if (autoAssignBarber) {
      try {
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
        await barberController.autoAssignBarberForSlot(mockReq, mockRes);

        if (
          autoAssignResult &&
          autoAssignResult.success &&
          autoAssignResult.assignedBarber
        ) {
          finalBarberId = autoAssignResult.assignedBarber._id;
        } else {
          console.error("❌ [TEST] Auto-assignment failed:", autoAssignResult);
        }
      } catch (autoAssignError) {
        console.error("❌ [TEST] Error in auto-assignment:", autoAssignError);
      }
    }

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
