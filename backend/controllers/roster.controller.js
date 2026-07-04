const WeeklyRoster = require('../models/weekly-roster.model');
const ShiftRegistration = require('../models/shift-registration.model');
const BarberSchedule = require('../models/barber-schedule.model');
const Barber = require('../models/barber.model');
const User = require('../models/user.model');

exports.createRoster = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, registrationDeadline, closedDays } = req.body;
    
    // Auto-fill requirements for staff only
    const shiftRequirements = [];
    for (let i = 0; i < 7; i++) {
      shiftRequirements.push({
        dayOfWeek: i,
        morning: { staff: 1 },
        afternoon: { staff: 1 }
      });
    }

    const staffCount = await User.countDocuments({ role: 'staff' });
    const activeStaffCount = staffCount > 0 ? staffCount : 1; // Prevent division by zero
    const numClosedDays = closedDays ? closedDays.length : 0;
    
    // 7 days * 2 shifts/day = 14 shifts max. Subtract closedDays shifts.
    const totalShiftsNeeded = (7 - numClosedDays) * 2;
    const minShiftsPerStaff = Math.ceil(totalShiftsNeeded / activeStaffCount);

    const roster = new WeeklyRoster({
      weekStartDate,
      weekEndDate,
      registrationDeadline,
      shiftRequirements,
      closedDays: closedDays || [],
      minShiftsPerStaff,
      status: 'open_for_registration',
      createdBy: req.userId
    });

    await roster.save();
    res.status(201).json({ success: true, roster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRosters = async (req, res) => {
  try {
    const rosters = await WeeklyRoster.find().sort({ weekStartDate: -1 });
    res.json({ success: true, rosters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRosterDetails = async (req, res) => {
  try {
    const roster = await WeeklyRoster.findById(req.params.id);
    if (!roster) return res.status(404).json({ message: 'Roster not found' });
    
    const registrations = await ShiftRegistration.find({ rosterId: roster._id })
      .populate('userId', 'name email role');
      
    // Build summary logic here (Optional for now, Frontend can aggregate, but doing it in backend is better)
    const summary = {}; // ...
    
    res.json({ success: true, roster, registrations, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRosterStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const roster = await WeeklyRoster.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json({ success: true, roster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.publishRoster = async (req, res) => {
  try {
    const roster = await WeeklyRoster.findById(req.params.id);
    if (!roster) return res.status(404).json({ message: 'Roster not found' });
    
    // Find all active barbers to generate 7-day schedule
    const barbers = await Barber.find({});
    
    for (const barber of barbers) {
      let currentDate = new Date(roster.weekStartDate);
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // 1. Check if this day is a closedDay
        const closedDay = roster.closedDays.find(d => {
            if (!d.date) return false;
            return new Date(d.date).toISOString().split('T')[0] === dateStr;
        });

        if (closedDay) {
            let schedule = await BarberSchedule.findOne({ barberId: barber._id, date: dateStr });
            if (!schedule) {
                schedule = new BarberSchedule({
                    barberId: barber._id,
                    date: dateStr,
                    isOffDay: true,
                    offReason: closedDay.reason || 'closed'
                });
            } else {
                schedule.isOffDay = true;
                schedule.offReason = closedDay.reason || 'closed';
            }
            await schedule.save();
        } else {
            // 2. Not closed, check if Barber has an absence request
            let schedule = await BarberSchedule.findOne({ barberId: barber._id, date: dateStr });
            
            // If schedule exists and is off due to absence, DO NOT overwrite it
            if (schedule && schedule.isOffDay && schedule.absenceId) {
                // Skip overwriting, preserve absence
            } else {
                // 3. Generate normal working schedule
                if (!schedule) {
                    schedule = new BarberSchedule({
                        barberId: barber._id,
                        date: dateStr,
                        workingHours: { start: "09:00", end: "19:00" },
                        isOffDay: false
                    });
                    schedule.generateDefaultSlots();
                    await schedule.save();
                } else {
                    schedule.isOffDay = false;
                    schedule.workingHours = { start: "09:00", end: "19:00" };
                    if (!schedule.availableSlots || schedule.availableSlots.length === 0) {
                        schedule.generateDefaultSlots();
                    }
                    await schedule.save();
                }
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    roster.status = 'published';
    roster.publishedAt = new Date();
    await roster.save();
    
    res.json({ success: true, message: 'Roster published and schedules synced' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminAdjustShift = async (req, res) => {
  try {
    const { registeredShifts, adjustmentNote } = req.body;
    
    // Check if user is staff
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'staff') {
        return res.status(400).json({ success: false, message: 'Can only adjust shifts for staff' });
    }

    const roster = await WeeklyRoster.findById(req.params.id);
    if (!roster) return res.status(404).json({ success: false, message: 'Roster not found' });

    // Validate closedDays
    for (const day of registeredShifts) {
        if (day.shifts.length > 0) {
            const dateStr = new Date(day.date).toISOString().split('T')[0];
            const isClosed = roster.closedDays.some(cd => new Date(cd.date).toISOString().split('T')[0] === dateStr);
            if (isClosed) {
                return res.status(400).json({ success: false, message: `Cannot assign shift on closed day: ${dateStr}` });
            }
        }
    }

    // Calculate total shifts
    let totalShifts = 0;
    registeredShifts.forEach(day => totalShifts += day.shifts.length);

    const registration = await ShiftRegistration.findOneAndUpdate(
      { rosterId: req.params.id, userId: req.params.userId },
      { registeredShifts, adminAdjusted: true, adjustmentNote, status: 'adjusted', totalShifts, role: 'staff' },
      { new: true, upsert: true }
    );
    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Staff/Barber Endpoints ---

exports.getCurrentRoster = async (req, res) => {
  try {
    const roster = await WeeklyRoster.findOne({ status: 'open_for_registration' }).sort({ weekStartDate: 1 });
    res.json({ success: true, roster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyRegistration = async (req, res) => {
  try {
    const registration = await ShiftRegistration.findOne({ rosterId: req.params.id, userId: req.userId });
    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerShifts = async (req, res) => {
  try {
    const { registeredShifts } = req.body;
    
    if (req.role === 'barber') {
        return res.status(403).json({ success: false, message: 'Barbers do not need to register shifts' });
    }

    const roster = await WeeklyRoster.findById(req.params.id);
    if (!roster || roster.status !== 'open_for_registration') {
      return res.status(400).json({ success: false, message: 'Roster is not open for registration' });
    }

    // Calculate total shifts and check closedDays
    let totalShifts = 0;
    for (const day of registeredShifts) {
        totalShifts += day.shifts.length;
        if (day.shifts.length > 0) {
            const dateStr = new Date(day.date).toISOString().split('T')[0];
            const isClosed = roster.closedDays.some(cd => new Date(cd.date).toISOString().split('T')[0] === dateStr);
            if (isClosed) {
                return res.status(400).json({ success: false, message: `Cannot register on closed day: ${dateStr}` });
            }
        }
    }

    if (totalShifts < roster.minShiftsPerStaff) {
        return res.status(400).json({ success: false, message: `You must register for at least ${roster.minShiftsPerStaff} shifts this week.` });
    }

    let registration = await ShiftRegistration.findOne({ rosterId: roster._id, userId: req.userId });
    if (registration) {
      registration.registeredShifts = registeredShifts;
      registration.totalShifts = totalShifts;
      registration.adminAdjusted = false; // Reset if they re-submit
      registration.status = 'pending';
    } else {
      registration = new ShiftRegistration({
        rosterId: roster._id,
        userId: req.userId,
        role: req.role,
        registeredShifts,
        totalShifts
      });
    }

    await registration.save();
    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
