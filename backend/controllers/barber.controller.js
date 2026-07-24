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
    
    if (id === 'auto' || id === 'random') {
      return sendSuccess(res, 200, 'Barber absences retrieved', { absentDates: [] });
    }

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

exports.getMeBarber = async (req, res, next) => {
  try {
    let barber = await Barber.findOne({ userId: req.userId })
      .populate('userId', 'name email phone avatarUrl')
      .lean();
    
    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    return sendSuccess(res, 200, 'Barber profile retrieved', { barber });
  } catch (error) {
    next(error);
  }
};

exports.updateMyAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    
    const barber = await Barber.findOneAndUpdate(
      { userId: req.userId },
      { $set: { isAvailable: Boolean(isAvailable) } },
      { returnDocument: "after" }
    );

    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    return sendSuccess(res, 200, 'Availability updated', { isAvailable: barber.isAvailable });
  } catch (error) {
    next(error);
  }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    const { bio, experienceYears, workingSince } = req.body;
    
    let updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (experienceYears !== undefined) updateFields.experienceYears = Number(experienceYears);
    if (workingSince !== undefined) updateFields.workingSince = new Date(workingSince);
    if (req.body.specialties !== undefined) updateFields.specialties = req.body.specialties;

    const barber = await Barber.findOneAndUpdate(
      { userId: req.userId },
      { $set: updateFields },
      { new: true }
    );

    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    return sendSuccess(res, 200, 'Profile updated successfully', { barber });
  } catch (error) {
    next(error);
  }
};

exports.uploadGalleryImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const currentBarber = await Barber.findOne({ userId: req.userId });
    if (!currentBarber) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    if (currentBarber.gallery && currentBarber.gallery.length + req.files.length > 4) {
      return res.status(400).json({ success: false, message: 'Maximum 4 gallery images allowed' });
    }

    const imageUrls = req.files.map(file => file.path);
    
    const barber = await Barber.findOneAndUpdate(
      { userId: req.userId },
      { $push: { gallery: { $each: imageUrls } } },
      { new: true }
    );

    return sendSuccess(res, 200, 'Images uploaded successfully', { gallery: barber.gallery });
  } catch (error) {
    next(error);
  }
};

exports.removeGalleryImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    const barber = await Barber.findOneAndUpdate(
      { userId: req.userId },
      { $pull: { gallery: imageUrl } },
      { new: true }
    );

    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    // Tùy chọn: Gọi Cloudinary API để xoá ảnh thực sự trên mây (cần public_id)
    // Ở đây ta đơn giản xoá khỏi DB

    return sendSuccess(res, 200, 'Image removed successfully', { gallery: barber.gallery });
  } catch (error) {
    next(error);
  }
};