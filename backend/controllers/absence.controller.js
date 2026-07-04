const BarberAbsence = require('../models/barber-absence.model');
const BarberSchedule = require('../models/barber-schedule.model');
const Booking = require('../models/booking.model');
const Barber = require('../models/barber.model');

// Normalize date to YYYY-MM-DD
const normalizeDateStr = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

exports.createAbsenceRequest = async (req, res) => {
    try {
        const { barberId, startDate, endDate, reason, description } = req.body;
        
        // Validate dates
        if (endDate < startDate) {
            return res.status(400).json({ success: false, message: 'End date must be on or after start date.' });
        }

        // Check if there is already an overlapping absence
        const overlappingAbsence = await BarberAbsence.findOne({
            barberId,
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlappingAbsence) {
            return res.status(400).json({ success: false, message: 'You already have an absence request during this period.' });
        }

        // Check for existing bookings during this period
        const startDateTime = new Date(`${startDate}T00:00:00+07:00`);
        const endDateTime = new Date(`${endDate}T23:59:59+07:00`);

        const affectedBookings = await Booking.find({
            barberId,
            bookingDate: { $gte: startDateTime, $lte: endDateTime },
            status: { $in: ['pending', 'confirmed'] }
        });

        const mappedAffectedBookings = affectedBookings.map(b => ({
            bookingId: b._id,
            originalDate: b.bookingDate,
            status: 'pending_reschedule'
        }));

        const newAbsence = new BarberAbsence({
            barberId,
            startDate,
            endDate,
            reason,
            description,
            affectedBookings: mappedAffectedBookings,
            createdBy: req.userId
        });

        await newAbsence.save();

        res.status(201).json({
            success: true,
            message: 'Absence request submitted successfully.',
            absence: newAbsence,
            affectedBookingsCount: affectedBookings.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAbsenceRequests = async (req, res) => {
    try {
        let query = {};
        
        // If barber, only see own requests
        if (req.role === 'barber') {
            const barber = await Barber.findOne({ userId: req.userId });
            if (!barber) {
                return res.status(404).json({ success: false, message: 'Barber profile not found' });
            }
            query.barberId = barber._id;
        }

        // Status filter
        if (req.query.status) {
            if (req.query.status === 'pending') query.isApproved = null;
            else if (req.query.status === 'approved') query.isApproved = true;
            else if (req.query.status === 'rejected') query.isApproved = false;
        }

        const absences = await BarberAbsence.find(query)
            .populate({
                path: 'barberId',
                populate: { path: 'userId', select: 'name email phone' }
            })
            .populate({
                path: 'affectedBookings.bookingId',
                populate: { path: 'customerId', select: 'name phone' }
            })
            .populate({
                path: 'affectedBookings.newBarberId',
                populate: { path: 'userId', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, absences });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.resolveAffectedBooking = async (req, res) => {
    try {
        const { absenceId, affectedBookingId } = req.params;
        const { action, newBarberId } = req.body; // action: 'reassigned', 'cancelled'

        const absence = await BarberAbsence.findById(absenceId);
        if (!absence) return res.status(404).json({ success: false, message: 'Absence request not found' });

        const affectedIndex = absence.affectedBookings.findIndex(b => b._id.toString() === affectedBookingId);
        if (affectedIndex === -1) return res.status(404).json({ success: false, message: 'Affected booking not found in this request' });

        const actualBookingId = absence.affectedBookings[affectedIndex].bookingId;
        const booking = await Booking.findById(actualBookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking document not found in DB' });

        const bookingDate = new Date(booking.bookingDate);
        const dateStr = bookingDate.toISOString().split("T")[0];
        const oldBarberId = booking.barberId;
        const durationMinutes = booking.durationMinutes || 30;

        if (action === 'reassigned') {
            if (!newBarberId) return res.status(400).json({ success: false, message: 'newBarberId is required for reassignment' });
            
            // Check if new barber exists
            const newBarber = await Barber.findById(newBarberId);
            if (!newBarber) return res.status(404).json({ success: false, message: 'New barber not found' });

            // 1. Mark slots for the new barber
            const startTimeStr = bookingDate.toTimeString().substring(0, 5);
            try {
                await BarberSchedule.markSlotsAsBooked(
                    newBarberId,
                    dateStr,
                    startTimeStr,
                    durationMinutes,
                    booking._id,
                    null
                );
            } catch (err) {
                return res.status(400).json({ success: false, message: 'New barber is not available at this time: ' + err.message });
            }

            // 2. Unmark slots for the old barber
            try {
                await BarberSchedule.unmarkSlotsAsBooked(oldBarberId, dateStr, booking._id, null);
            } catch (e) {
                console.error("Error unmarking old barber slots:", e);
            }

            // 3. Update the booking
            booking.barberId = newBarberId;
            booking.reassignedFrom = oldBarberId;
            booking.reassignedAt = new Date();
            booking.reassignedBy = req.userId;
            await booking.save();

            // 4. Update the absence record
            absence.affectedBookings[affectedIndex].status = 'reassigned';
            absence.affectedBookings[affectedIndex].newBarberId = newBarberId;
            await absence.save();

        } else if (action === 'cancelled') {
            // 1. Update the booking
            booking.status = 'cancelled';
            booking.rejectionReason = 'barber_unavailable';
            booking.rejectionNote = 'Thợ cắt tóc báo vắng mặt.';
            await booking.save();

            // 2. Unmark slots for the old barber
            try {
                await BarberSchedule.unmarkSlotsAsBooked(oldBarberId, dateStr, booking._id, null);
            } catch (e) {
                console.error("Error unmarking old barber slots:", e);
            }

            // 3. Update the absence record
            absence.affectedBookings[affectedIndex].status = 'cancelled';
            await absence.save();
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action. Use reassigned or cancelled.' });
        }

        res.json({ success: true, absence, booking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveAbsence = async (req, res) => {
    try {
        const { absenceId } = req.params;
        const absence = await BarberAbsence.findById(absenceId);
        
        if (!absence) return res.status(404).json({ success: false, message: 'Absence request not found' });

        // Validate all affected bookings are resolved
        const hasPending = absence.affectedBookings.some(b => b.status === 'pending_reschedule');
        if (hasPending) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot approve absence. There are still affected bookings pending resolution.' 
            });
        }

        absence.isApproved = true;
        absence.approvedBy = req.userId;
        await absence.save();

        // Update BarberSchedule
        let currentDate = new Date(absence.startDate);
        const endDate = new Date(absence.endDate);

        while (currentDate <= endDate) {
            const dateStr = normalizeDateStr(currentDate);
            
            let schedule = await BarberSchedule.findOne({ barberId: absence.barberId, date: dateStr });
            if (!schedule) {
                schedule = new BarberSchedule({
                    barberId: absence.barberId,
                    date: dateStr,
                    isOffDay: true,
                    offReason: 'absence',
                    absenceId: absence._id
                });
            } else {
                schedule.isOffDay = true;
                schedule.offReason = 'absence';
                schedule.absenceId = absence._id;
                
                // Block all existing slots
                if (schedule.availableSlots) {
                    schedule.availableSlots.forEach(slot => {
                        slot.isBlocked = true;
                        slot.blockReason = 'barber_absent';
                    });
                }
            }
            await schedule.save();
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json({ success: true, message: 'Absence approved and schedule updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.rejectAbsence = async (req, res) => {
    try {
        const { absenceId } = req.params;
        const absence = await BarberAbsence.findById(absenceId);
        
        if (!absence) return res.status(404).json({ success: false, message: 'Absence request not found' });

        absence.isApproved = false;
        absence.approvedBy = req.userId;
        await absence.save();

        res.json({ success: true, message: 'Absence rejected.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};
