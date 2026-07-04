const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response.helper');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Admin
exports.getDashboardData = async (req, res, next) => {
  try {
    const { timeframe = '7days' } = req.query; // 'today', '7days', 'thisMonth'
    const dashboardData = await analyticsService.getDashboardData(timeframe);
    
    return sendSuccess(res, 200, 'Analytics retrieved successfully', dashboardData);
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    next(error);
  }
};
