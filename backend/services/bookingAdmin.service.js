const Booking = require('../models/booking.model');
const BarberSchedule = require('../models/barber-schedule.model');
const BarberAbsence = require('../models/barber-absence.model');
const Barber = require('../models/barber.model');

// Utilities and validation can be imported if they are shared
const validateBookingConfirmation = (booking) => {
  if (!booking) return { valid: false, error: 'Booking not found' };
  if (booking.status === 'confirmed') return { valid: false, error: 'Booking is already confirmed' };
  if (booking.status === 'completed') return { valid: false, error: 'Cannot confirm a completed booking' };
  if (booking.status === 'cancelled') return { valid: false, error: 'Cannot confirm a cancelled booking' };
  if (booking.status === 'rejected') return { valid: false, error: 'Cannot confirm a rejected booking' };
  if (booking.status === 'no_show') return { valid: false, error: 'Cannot confirm a no-show booking' };
  return { valid: true };
};

const validateBookingRejection = (booking) => {
  if (!booking) return { valid: false, error: 'Booking not found' };
  if (booking.status === 'rejected') return { valid: false, error: 'Booking is already rejected' };
  if (booking.status === 'completed') return { valid: false, error: 'Cannot reject a completed booking' };
  if (booking.status === 'cancelled') return { valid: false, error: 'Cannot reject a cancelled booking' };
  return { valid: true };
};

class BookingAdminService {
  async getPendingBookings(filter, skip, limit) {
    const bookings = await Booking.find(filter)
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('serviceId', 'name price durationMinutes')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Booking.countDocuments(filter);
    return { bookings, total };
  }

  async confirmBooking(bookingId, adminId) {
    const booking = await Booking.findById(bookingId);
    
    const validation = validateBookingConfirmation(booking);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();

    return await Booking.findById(bookingId)
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('serviceId', 'name price durationMinutes')
      .populate('customerId', 'name email phone');
  }

  async rejectBooking(bookingId, adminId, reason, note) {
    const booking = await Booking.findById(bookingId);
    
    const validation = validateBookingRejection(booking);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    booking.status = 'rejected';
    booking.rejectedAt = new Date();
    booking.rejectionReason = reason || 'other';
    if (note) booking.rejectionNote = note;
    
    await booking.save();

    // Free up schedule slots if assigned
    if (booking.barberId && booking.bookingDate) {
      const dateStr = new Date(booking.bookingDate).toISOString().split('T')[0];
      const startHour = new Date(booking.bookingDate).getHours();
      const startMinute = new Date(booking.bookingDate).getMinutes();
      const timeStr = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      
      const schedule = await BarberSchedule.findOne({
        barberId: booking.barberId,
        date: dateStr
      });
      
      if (schedule) {
        let slotFound = false;
        let updateCount = 0;
        
        for (let i = 0; i < schedule.slots.length; i++) {
          if (schedule.slots[i].startTime === timeStr) {
            slotFound = true;
          }
          
          if (slotFound && updateCount < (booking.durationMinutes / 30)) {
            schedule.slots[i].isBooked = false;
            schedule.slots[i].bookingId = null;
            updateCount++;
          }
        }
        
        await schedule.save();
      }
    }

    return await Booking.findById(bookingId)
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('serviceId', 'name price durationMinutes')
      .populate('customerId', 'name email phone');
  }

  async markNoShow(bookingId, adminId, note) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    
    if (booking.status === 'completed') throw new Error('Cannot mark a completed booking as no-show');
    if (booking.status === 'cancelled') throw new Error('Cannot mark a cancelled booking as no-show');
    if (booking.status === 'rejected') throw new Error('Cannot mark a rejected booking as no-show');
    if (booking.status === 'no_show') throw new Error('Booking is already marked as no-show');

    booking.status = 'no_show';
    booking.noShowAt = new Date();
    if (note) booking.noShowNote = note;
    
    await booking.save();

    // Create NoShow record for tracking and penalty logic
    const NoShow = require('../models/no-show.model');
    try {
      if (booking.customerId) {
        await NoShow.create({
          customerId: booking.customerId,
          bookingId: booking._id,
          barberId: booking.barberId,
          serviceId: booking.services && booking.services.length > 0 
            ? (booking.services[0]._id || booking.services[0]) 
            : null,
          originalBookingDate: booking.bookingDate,
          markedBy: adminId,
          reason: 'no_show',
          description: note
        });
      }
    } catch (noShowError) {
      console.error('Error creating no-show record by admin:', noShowError);
      // Don't fail the entire admin action if this fails, but it should succeed
    }

    if (booking.barberId && booking.bookingDate) {
      const dateStr = new Date(booking.bookingDate).toISOString().split('T')[0];
      const startHour = new Date(booking.bookingDate).getHours();
      const startMinute = new Date(booking.bookingDate).getMinutes();
      const timeStr = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      
      const schedule = await BarberSchedule.findOne({
        barberId: booking.barberId,
        date: dateStr
      });
      
      if (schedule) {
        let slotFound = false;
        let updateCount = 0;
        
        for (let i = 0; i < schedule.slots.length; i++) {
          if (schedule.slots[i].startTime === timeStr) {
            slotFound = true;
          }
          if (slotFound && updateCount < (booking.durationMinutes / 30)) {
            schedule.slots[i].isBooked = false;
            schedule.slots[i].bookingId = null;
            updateCount++;
          }
        }
        await schedule.save();
      }
    }

    return await Booking.findById(bookingId)
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('serviceId', 'name price durationMinutes')
      .populate('customerId', 'name email phone');
  }
}

module.exports = new BookingAdminService();
