const WeeklyRoster = require('../models/weekly-roster.model');
const ShiftRegistration = require('../models/shift-registration.model');
const BarberSchedule = require('../models/barber-schedule.model');
const Barber = require('../models/barber.model');

exports.createRoster = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, registrationDeadline, shiftRequirements } = req.body;
    
    // Auto-fill requirements if not provided
    const defaultRequirements = [];
    for (let i = 0; i < 7; i++) {
      const isWeekend = (i === 0 || i >= 3); // Wed-Sun (0=Sun, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      const barbersNeeded = isWeekend ? 6 : 5; // Mon=1, Tue=2 -> 5 barbers
      defaultRequirements.push({
        dayOfWeek: i,
        morning: { barbers: barbersNeeded, staff: 1 },
        afternoon: { barbers: barbersNeeded, staff: 1 }
      });
    }

    const roster = new WeeklyRoster({
      weekStartDate,
      weekEndDate,
      registrationDeadline,
      shiftRequirements: shiftRequirements || defaultRequirements,
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
    
    // Get all approved/pending registrations
    const registrations = await ShiftRegistration.find({ rosterId: roster._id }).populate('userId');
    
    // Sync to BarberSchedule
    for (const reg of registrations) {
      if (reg.role !== 'barber') continue; // Staff scheduling is outside BarberSchedule scope
      
      const barber = await Barber.findOne({ userId: reg.userId._id });
      if (!barber) continue;

      // Create BarberSchedules for the 7 days
      let currentDate = new Date(roster.weekStartDate);
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Find if barber registered for this day
        const dayReg = reg.registeredShifts.find(s => {
          const sDate = new Date(s.date);
          return sDate.toISOString().split('T')[0] === dateStr;
        });

        if (dayReg && dayReg.shifts.length > 0) {
          // Working day
          let schedule = await BarberSchedule.findOne({ barberId: barber._id, date: dateStr });
          if (!schedule) {
            schedule = new BarberSchedule({
              barberId: barber._id,
              date: dateStr,
              workingHours: { start: "09:00", end: "19:00" }, // Option B: Full Day
              isOffDay: false
            });
            schedule.generateDefaultSlots();
            await schedule.save();
          } else {
            schedule.isOffDay = false;
            schedule.workingHours = { start: "09:00", end: "19:00" };
            await schedule.save();
          }
        } else {
          // Off day
          let schedule = await BarberSchedule.findOne({ barberId: barber._id, date: dateStr });
          if (!schedule) {
            schedule = new BarberSchedule({
              barberId: barber._id,
              date: dateStr,
              isOffDay: true,
              offReason: 'weekend'
            });
            await schedule.save();
          } else {
            schedule.isOffDay = true;
            await schedule.save();
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
    const registration = await ShiftRegistration.findOneAndUpdate(
      { rosterId: req.params.id, userId: req.params.userId },
      { registeredShifts, adminAdjusted: true, adjustmentNote, status: 'adjusted' },
      { new: true, upsert: true } // Upsert in case admin is creating it for them
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
    const { registeredShifts } = req.body; // Array of { date, shifts: ['morning', 'afternoon'] }
    
    if (!registeredShifts || registeredShifts.length !== 5) {
      return res.status(400).json({ success: false, message: 'You must select exactly 5 days' });
    }

    const roster = await WeeklyRoster.findById(req.params.id);
    if (!roster || roster.status !== 'open_for_registration') {
      return res.status(400).json({ success: false, message: 'Roster is not open for registration' });
    }

    const userRole = req.role; // 'barber' or 'staff'
    
    // Enforce Option B for Barber: If they select a day, they must work both shifts (Full Day)
    if (userRole === 'barber') {
      registeredShifts.forEach(day => {
        day.shifts = ['morning', 'afternoon'];
      });
    }

    // Calculate total shifts
    let totalShifts = 0;
    registeredShifts.forEach(day => totalShifts += day.shifts.length);

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
        role: userRole,
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
