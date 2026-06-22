const bookingStatsService = require('../services/bookingStats.service');

exports.getBookingStats = async (req, res) => {
  try {
    const stats = await bookingStatsService.getBookingStats();
    res.json(stats);
  } catch (err) {
    console.error("Error in getBookingStats:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingChartStats = async (req, res) => {
  try {
    const { from, to, mode = "day" } = req.query;
    const data = await bookingStatsService.getBookingChartStats(from, to, mode);
    res.json({ data });
  } catch (err) {
    console.error("Error in getBookingChartStats:", err);
    res.status(500).json({ message: err.message });
  }
};
