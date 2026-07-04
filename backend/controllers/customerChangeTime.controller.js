const Booking = require("../models/booking.model");
const BarberSchedule = require("../models/barber-schedule.model");
const BarberAbsence = require("../models/barber-absence.model");

/**
 * Handle booking reschedule for customers.
 * Constraints:
 * - Can only reschedule at least 2 hours before the existing appointment time.
 * - Customer can only change time (date and time slot), not barber or services.
 * - Old schedule will be unmarked, new schedule will be marked.
 */
exports.rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newDate, newTimeSlot, note } = req.body;
    const userId = req.userId; // From authenticate middleware

    // 1. Validate inputs
    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ 
        message: "Ngày mới (newDate) và giờ mới (newTimeSlot) là bắt buộc." 
      });
    }

    // 2. Find booking
    const booking = await Booking.findById(bookingId).populate("services");
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn." });
    }

    // 3. Verify ownership
    if (booking.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn chỉ có thể đổi lịch của chính mình." });
    }

    // 4. Verify state (Only pending or confirmed can be rescheduled)
    if (!['pending', 'confirmed'].includes(booking.status)) {
       return res.status(400).json({ message: "Chỉ có thể đổi lịch khi trạng thái là Chờ xác nhận hoặc Đã xác nhận." });
    }

    // 5. Apply time restriction (2 hours prior)
    const currentBookingDate = new Date(booking.bookingDate);
    const now = new Date();
    
    const hoursDifference = (currentBookingDate - now) / (1000 * 60 * 60);
    if (hoursDifference < 2) {
      return res.status(400).json({
        message: "Bạn chỉ có thể đổi lịch trước giờ hẹn tối thiểu 2 tiếng."
      });
    }

    // 6. Check new time validity
    const requestedDateTime = new Date(`${newDate}T${newTimeSlot}:00.000+07:00`);
    if (requestedDateTime < now) {
      return res.status(400).json({ message: "Không thể đổi lịch về thời gian trong quá khứ." });
    }

    // 7. Check availability for the new time slot (Barber absence)
    const isBarberAbsent = await BarberAbsence.isBarberAbsent(booking.barberId, requestedDateTime);
    if (isBarberAbsent) {
      return res.status(409).json({ message: "Thợ cắt tóc không làm việc vào ngày này." });
    }

    // 8. Check overlap conflict for barber (excluding this booking)
    const dateStr = requestedDateTime.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }); // YYYY-MM-DD
    const newStart = requestedDateTime;
    const newEnd = new Date(newStart.getTime() + booking.durationMinutes * 60000);

    const barberBookings = await Booking.find({
      barberId: booking.barberId,
      _id: { $ne: booking._id },
      bookingDate: {
        $gte: new Date(dateStr + "T00:00:00.000+07:00"),
        $lt: new Date(dateStr + "T23:59:59.999+07:00"),
      },
      status: { $in: ["pending", "confirmed"] },
    });

    const barberConflict = barberBookings.find((b) => {
      const existingStart = new Date(b.bookingDate);
      const existingEnd = new Date(existingStart.getTime() + b.durationMinutes * 60000);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (barberConflict) {
      return res.status(409).json({ message: "Khung giờ này thợ cắt tóc đã có khách đặt." });
    }
    
    // Check overlap conflict for customer (excluding this booking)
    const customerBookings = await Booking.find({
      customerId: booking.customerId,
      _id: { $ne: booking._id },
      bookingDate: {
        $gte: new Date(dateStr + "T00:00:00.000+07:00"),
        $lt: new Date(dateStr + "T23:59:59.999+07:00"),
      },
      status: { $in: ["pending", "confirmed"] },
    });

    const customerConflict = customerBookings.find((b) => {
      const existingStart = new Date(b.bookingDate);
      const existingEnd = new Date(existingStart.getTime() + b.durationMinutes * 60000);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (customerConflict) {
       return res.status(409).json({ message: "Bạn đã có một lịch hẹn khác trùng vào thời gian này." });
    }

    // 9. Update the booking and BarberSchedule
    const localOldDateStr = currentBookingDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); // YYYY-MM-DD
    const localNewDateStr = newDate;

    // Unmark old slots
    try {
       await BarberSchedule.unmarkSlotsAsBooked(booking.barberId, localOldDateStr, booking._id);
    } catch(err) {
       console.error("Error unmarking old schedule:", err);
    }

    // Update booking
    booking.bookingDate = requestedDateTime;
    if (note !== undefined) {
      booking.note = note;
    }
    await booking.save();

    // Mark new slots
    try {
      await BarberSchedule.markSlotsAsBooked(
         booking.barberId, 
         localNewDateStr, 
         newTimeSlot, 
         booking.durationMinutes, 
         booking._id
      );
    } catch(err) {
       console.error("Error marking new schedule:", err);
    }

    // Re-populate to send back complete data
    const updatedBooking = await Booking.findById(booking._id)
      .populate("services", "name price durationMinutes")
      .populate({
        path: "barberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("customerId", "name email phone");

    return res.status(200).json({
      message: "Đổi lịch thành công",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi hệ thống khi đổi lịch." });
  }
};
