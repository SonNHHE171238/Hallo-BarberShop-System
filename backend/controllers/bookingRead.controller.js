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

    const BookingFeedback = require('../models/bookingfeedback.model');
    const bookingIds = bookings.map(b => b._id);
    const feedbacks = await BookingFeedback.find({ bookingId: { $in: bookingIds } }).select('bookingId');
    const reviewedBookingIds = new Set(feedbacks.map(f => f.bookingId.toString()));

    const bookingsWithReviewStatus = bookings.map(b => {
      const bObj = b.toObject();
      bObj.isReviewed = reviewedBookingIds.has(b._id.toString());
      return bObj;
    });

    res.json({
      bookings: bookingsWithReviewStatus,
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
exports.getAvailableSlots = async (req, res, next) => {
  try {
    let { barberId, date, durationMinutes } = req.body;
    durationMinutes = parseInt(durationMinutes);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      durationMinutes = 30;
    }

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
    if (serviceId) filter.services = serviceId;
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
      .populate("services", "name price durationMinutes")
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

exports.getBarberHistoryBookings = async (req, res, next) => {
  try {
    const { date, page = 1, limit = 20 } = req.query;

    const Barber = require('../models/barber.model');
    let barber = await Barber.findOne({ userId: req.userId });
    if (!barber) {
      const User = require('../models/user.model');
      const user = await User.findById(req.userId);
      if (user && user.role === 'barber') {
          barber = await Barber.create({
              userId: user._id,
              bio: 'Thợ cắt tóc mới tại Hallo Barber',
              experienceYears: 0,
              specialties: ['Cắt tóc nam'],
              workingSince: new Date()
          });
      } else {
          return res.status(404).json({ message: 'Barber not found' });
      }
    }

    const filter = {
      barberId: barber._id,
      status: 'completed'
    };

    if (date) {
      const dateObj = new Date(date);
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().split('T')[0];

      filter.bookingDate = {
        $gte: new Date(`${localISOTime}T00:00:00.000Z`),
        $lte: new Date(`${localISOTime}T23:59:59.999Z`)
      };
    }

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate("services", "name price durationMinutes category")
      .populate("customerId", "name phone")
      .sort({ completedAt: -1, bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    // Calculate simple stats
    const totalCompleted = total;

    res.status(200).json({
      success: true,
      data: {
        appointments: bookings.map(b => ({
          _id: b._id,
          customerName: b.customerId?.name || b.customerName || "Khách vãng lai",
          customerType: b.customerId ? "Thành viên" : "Vãng lai",
          time: b.timeSlot || (b.bookingDate ? new Date(b.bookingDate).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit", hour12:false}) : "N/A"),
          date: b.bookingDate,
          serviceName: b.services?.map(s => s.name).join(", ") || "Dịch vụ",
          uiStatus: "Hoàn thành",
          statusClass: "bg-green-100 text-green-700", // Will be styled by frontend anyway
          rawStatus: b.status
        })),
        stats: { total: totalCompleted, serving: 0, emptyChairs: 0 },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getBarberTodayBookings = async (req, res, next) => {
  try {
    const Barber = require('../models/barber.model');
    let barber = await Barber.findOne({ userId: req.userId });
    if (!barber) {
      const User = require('../models/user.model');
      const user = await User.findById(req.userId);
      if (user && user.role === 'barber') {
          barber = await Barber.create({
              userId: user._id,
              bio: 'Thợ cắt tóc mới tại Hallo Barber',
              experienceYears: 0,
              specialties: ['Cắt tóc nam'],
              workingSince: new Date()
          });
      } else {
          return res.status(404).json({ message: 'Barber not found' });
      }
    }

    const { date } = req.query;
    
    // Get requested date's start and end string "YYYY-MM-DD"
    const targetDate = date ? new Date(date) : new Date();
    const tzOffset = targetDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(targetDate.getTime() - tzOffset)).toISOString().split('T')[0];

    // Search between start of day and end of day
    const startOfDay = new Date(`${localISOTime}T00:00:00.000Z`);
    const endOfDay = new Date(`${localISOTime}T23:59:59.999Z`);

    const bookings = await Booking.find({
      barberId: barber._id,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .populate('customerId', 'name email phone')
      .populate("services", 'name price durationMinutes type')
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
      .populate("services", "name")
      .populate({
        path: "barberId",
        populate: { path: "userId", select: "name" },
      })
      .populate("customerId");
      
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Authorization check
    if (req.role === 'customer') {
      const User = require('../models/user.model');
      const user = await User.findById(req.userId);
      let isAuthorized = false;
      
      const customerIdStr = booking.customerId ? booking.customerId._id.toString() : null;
      if (customerIdStr === req.userId) {
        isAuthorized = true;
      } else if (!customerIdStr && booking.customerPhone && user && booking.customerPhone === user.phone) {
        isAuthorized = true;
      }
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized to view this booking" });
      }
    } else if (req.role === 'barber') {
      const Barber = require('../models/barber.model');
      const barber = await Barber.findOne({ userId: req.userId });
      const barberIdStr = booking.barberId ? booking.barberId._id.toString() : null;
      
      if (!barber || barberIdStr !== barber._id.toString()) {
        return res.status(403).json({ message: "Not authorized to view this booking" });
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).select("paymentStatus status");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGuestBookingDetail = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp số điện thoại để xác thực." });
    }

    const mongoose = require("mongoose");
    let bookingQuery = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      bookingQuery = Booking.findById(req.params.id);
    } else {
      bookingQuery = Booking.findOne({ bookingCode: req.params.id.toUpperCase() });
    }

    const booking = await bookingQuery
      .populate("services", "name price durationMinutes")
      .populate({
        path: "barberId",
        populate: { path: "userId", select: "name avatarUrl" },
      })
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    // Verify phone
    let bookingPhone = booking.customerPhone;
    if (!bookingPhone && booking.customerId) {
      const User = require("../models/user.model");
      const user = await User.findById(booking.customerId).select("phone");
      if (user) bookingPhone = user.phone;
    }

    if (bookingPhone !== phone) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem chi tiết lịch hẹn này." });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check if a booking can be completed based on time window
// Admin reject booking


// Barber mark booking as no-show






// Use for chatbot ai
exports.lookupBookingsByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const User = require('../models/user.model');
    const Booking = require('../models/booking.model');
    
    // Tìm các user có sđt này
    const users = await User.find({ phone });
    const userIds = users.map(u => u._id);

    // Tìm booking qua sđt nhập trực tiếp hoặc qua user id
    const bookings = await Booking.find({
      $or: [
        { customerPhone: phone },
        { customerId: { $in: userIds } }
      ]
    })
      .select('bookingDate durationMinutes status totalPrice services barberId')
      .populate('services', 'name')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ bookingDate: -1 })
      .limit(20);

    const BookingFeedback = require('../models/bookingfeedback.model');
    const bookingIds = bookings.map(b => b._id);
    const feedbacks = await BookingFeedback.find({ bookingId: { $in: bookingIds } }).select('bookingId');
    const reviewedBookingIds = new Set(feedbacks.map(f => f.bookingId.toString()));

    const bookingsWithReviewStatus = bookings.map(b => {
      const bObj = b.toObject();
      bObj.isReviewed = reviewedBookingIds.has(b._id.toString());
      return bObj;
    });

    res.json({ success: true, data: bookingsWithReviewStatus });
  } catch (error) {
    next(error);
  }
};
