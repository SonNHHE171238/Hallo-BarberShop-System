const Barber = require('../models/barber.model');
const { sendSuccess } = require('../utils/response.helper');

exports.getActiveBarbers = async (req, res, next) => {
  try {
    // Find barbers where isAvailable is true OR isAvailable doesn't exist
    const barbers = await Barber.find({ 
      $or: [{ isAvailable: true }, { isAvailable: { $exists: false } }] 
    })
      .populate('userId', 'name email phone avatarUrl')
      .sort({ averageRating: -1, totalBookings: -1 })
      .lean();

    return sendSuccess(res, 200, 'Barbers retrieved successfully', { barbers });
  } catch (error) {
    next(error);
  }
};

exports.getBarberAbsences = async (req, res, next) => {
  try {
    const { id } = req.params;
    const BarberAbsence = require('../models/barber-absence.model');
    
    // Get all approved absences for this barber
    const absences = await BarberAbsence.find({ 
      barberId: id,
      isApproved: true
    }).select('startDate endDate').lean();

    // Convert them to an array of string dates (YYYY-MM-DD)
    const absentDates = new Set();
    for (const absence of absences) {
      const start = new Date(absence.startDate);
      const end = new Date(absence.endDate);
      
      const current = new Date(start);
      while (current <= end) {
        absentDates.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    return sendSuccess(res, 200, 'Barber absences retrieved', { 
      absentDates: Array.from(absentDates)
    });
  } catch (error) {
    next(error);
  }
};
