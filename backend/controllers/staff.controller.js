const staffDashboardService = require('../services/staffDashboard.service');

const staffController = {
  getDashboardMetrics: async (req, res, next) => {
    try {
      const metrics = await staffDashboardService.getDashboardMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  },

  getUpcomingBookings: async (req, res, next) => {
    try {
      const bookings = await staffDashboardService.getUpcomingBookings();
      return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  },

  getBarbersStatus: async (req, res, next) => {
    try {
      const statuses = await staffDashboardService.getBarbersStatus();
      return res.status(200).json({ success: true, data: statuses });
    } catch (error) {
      next(error);
    }
  },

  toggleCheckIn: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isCheckedIn } = req.body;
      if (typeof isCheckedIn !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isCheckedIn must be a boolean' });
      }
      const updatedBooking = await staffDashboardService.updateCheckIn(id, isCheckedIn);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: updatedBooking
      });
    } catch (error) {
      next(error);
    }
  },

  getAppointments: async (req, res, next) => {
    try {
      const { date, barberId, status } = req.query;
      const data = await staffDashboardService.getAppointmentsList({ date, barberId, status });
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = staffController;
