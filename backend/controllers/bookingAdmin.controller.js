const bookingAdminService = require('../services/bookingAdmin.service');
const Booking = require('../models/booking.model');

exports.getPendingBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      barberId,
      serviceId,
      startDate,
      endDate,
    } = req.query;

    if (req.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can view pending bookings" });
    }

    const filter = {
      status: {
        $in: ["pending", "cancelled", "confirmed", "completed", "rejected"],
      },
    };

    if (barberId) filter.barberId = barberId;
    if (serviceId) filter.serviceId = serviceId;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const { bookings, total } = await bookingAdminService.getPendingBookings(filter, skip, limit);

    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error in getPendingBookings:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const adminId = req.userId;

    if (req.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can confirm bookings" });
    }

    const confirmedBooking = await bookingAdminService.confirmBooking(bookingId, adminId);

    res.json({
      booking: confirmedBooking,
      message: "Booking confirmed successfully",
    });
  } catch (err) {
    console.error("Error in confirmBooking:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const adminId = req.userId;
    const { reason, note } = req.body;

    if (req.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can reject bookings" });
    }

    const rejectedBooking = await bookingAdminService.rejectBooking(bookingId, adminId, reason, note);

    res.json({
      booking: rejectedBooking,
      message: "Booking rejected successfully",
    });
  } catch (err) {
    console.error("Error in rejectBooking:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.markNoShow = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const adminId = req.userId;
    const { note } = req.body;

    if (req.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can mark bookings as no-show" });
    }

    const noShowBooking = await bookingAdminService.markNoShow(bookingId, adminId, note);

    res.json({
      booking: noShowBooking,
      message: "Booking marked as no-show successfully",
    });
  } catch (err) {
    console.error("Error in markNoShow:", err);
    res.status(500).json({ message: err.message });
  }
};

// Implement bulkConfirmBookings manually here since it just iterates over confirmBooking
exports.bulkConfirmBookings = async (req, res) => {
  try {
    const { bookingIds } = req.body;
    const adminId = req.userId;

    if (req.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can confirm bookings" });
    }

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ message: "Please provide an array of bookingIds" });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const bookingId of bookingIds) {
      try {
        const confirmedBooking = await bookingAdminService.confirmBooking(bookingId, adminId);
        results.successful.push(confirmedBooking);
      } catch (err) {
        results.failed.push({
          bookingId,
          error: err.message
        });
      }
    }

    res.json({
      message: `Successfully confirmed ${results.successful.length} bookings. Failed: ${results.failed.length}`,
      results
    });
  } catch (err) {
    console.error("Error in bulkConfirmBookings:", err);
    res.status(500).json({ message: err.message });
  }
};
