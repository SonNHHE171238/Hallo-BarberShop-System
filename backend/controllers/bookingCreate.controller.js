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

exports.preCheckBooking = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Số điện thoại là bắt buộc" });
    }

    const count = await NoShow.getNoShowCountByPhone(phone);
    let requiresDeposit = false;
    let depositRatio = 0;
    let isBanned = false;

    if (count >= 3) {
      isBanned = true;
    } else if (count === 2) {
      requiresDeposit = true;
      depositRatio = 1.0;
    } else if (count === 1) {
      requiresDeposit = true;
      depositRatio = 0.5;
    }

    const latestBooking = await Booking.findOne({ customerPhone: phone })
      .sort({ bookingDate: -1 })
      .select('customerName customerEmail customerPhone');

    const latestUser = await mongoose.model('User').findOne({ phone }).select('name email phone');

    return res.json({
      noShowCount: count,
      isBanned,
      requiresDeposit,
      depositRatio,
      customerInfo: latestUser || latestBooking || null
    });
  } catch (err) {
    next(err);
  }
};

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

    const { populatedBooking, noShowCount } = await bookingService.processCreateBooking({
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
      voucherCode: req.body.voucherCode,
    });

    let paymentLinkData = null;
    if (noShowCount === 1 || noShowCount === 2) {
      const paymentController = require("./payment.controller");
      const depositAmount = noShowCount === 1 ? populatedBooking.totalPrice / 2 : populatedBooking.totalPrice;
      paymentLinkData = await paymentController.createPaymentLinkHelper({
        bookingId: populatedBooking._id,
        amount: depositAmount
      });
    }

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
      paymentLinkData
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
      discountType,
      pointsToUse,
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

    const { populatedBooking, shouldAutoAssign: wasAutoAssigned, noShowCount } = await bookingService.processCreateSinglePageBooking({
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
      autoAssignBarber: shouldAutoAssign,
      voucherCode: req.body.voucherCode,
      discountType,
      pointsToUse,
    });

    let paymentLinkData = null;
    if (noShowCount === 1 || noShowCount === 2) {
      const paymentController = require("./payment.controller");
      const depositAmount = noShowCount === 1 ? populatedBooking.totalPrice / 2 : populatedBooking.totalPrice;
      paymentLinkData = await paymentController.createPaymentLinkHelper({
        bookingId: populatedBooking._id,
        amount: depositAmount
      });
    }

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
      isAutoAssigned: wasAutoAssigned,
      paymentLinkData
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
      .populate("services", "name price durationMinutes category")
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
