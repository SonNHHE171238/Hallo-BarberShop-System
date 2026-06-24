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

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const Booking = require('../models/booking.model');
      
      let updateData = { status };
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'no_show') {
        updateData.noShowAt = new Date();
      } else if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      }

      const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
      
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
  },

  searchCustomerByPhone: async (req, res, next) => {
    try {
      const { phone } = req.query;
      if (!phone) {
        const error = new Error('Vui lòng cung cấp số điện thoại');
        error.statusCode = 400;
        throw error;
      }
      const User = require('../models/user.model');
      const customer = await User.findOne({ phone: phone, role: 'customer' }).select('name phone email loyaltyPoints');
      
      if (!customer) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'Không tìm thấy khách hàng'
        });
      }

      return res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = staffController;
