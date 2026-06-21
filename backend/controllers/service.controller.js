const Service = require('../models/service.model');
const { sendSuccess } = require('../utils/response.helper');

exports.getActiveServices = async (req, res, next) => {
  try {
    // Find services where isActive is true OR isActive doesn't exist (for raw imported data)
    const services = await Service.find({ 
      $or: [{ isActive: true }, { isActive: { $exists: false } }] 
    })
      .sort({ popularity: -1, createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Services retrieved successfully', { services });
  } catch (error) {
    next(error);
  }
};
