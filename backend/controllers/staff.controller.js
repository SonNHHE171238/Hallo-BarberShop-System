const staffDashboardService = require('../services/staffDashboard.service');
const Booking = require('../models/booking.model');

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
      const { status, paymentMethod, amountPaid } = req.body;
      
      const Booking = require('../models/booking.model');
      const Payment = require('../models/payment.model');
      
      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Check if booking is in the future (allow 30 minutes early)
      const now = new Date();
      const allowedTime = new Date(now.getTime() + 30 * 60000);
      if (new Date(booking.bookingDate) > allowedTime) {
        if (status !== 'cancelled' && status !== 'rejected') {
          return res.status(400).json({ success: false, message: 'Không thể thay đổi trạng thái của lịch hẹn trong tương lai' });
        }
      }

      booking.status = status;
      if (status === 'completed') {
        booking.completedAt = new Date();
        
        // Tự động update amountPaid khớp với số tiền tổng dịch vụ
        const currentAmountPaid = booking.amountPaid || 0;
        const total = booking.totalPrice || 0;
        
        if (currentAmountPaid < total) {
          const remainingToPay = total - currentAmountPaid;
          booking.amountPaid = total;
          booking.paymentStatus = 'paid';
          
          if (paymentMethod) {
            booking.paymentMethod = paymentMethod;
          }
          
          // Ghi nhận số tiền còn thiếu vào sổ cái Payment
          await Payment.create({
            target_type: 'booking',
            target_id: booking._id,
            amount: remainingToPay,
            method: paymentMethod || 'cash',
            status: 'success'
          });
        } else if (currentAmountPaid >= total) {
          booking.amountPaid = currentAmountPaid;
          booking.paymentStatus = 'paid';
        }
      } else if (status === 'no_show') {
        booking.noShowAt = new Date();
      } else if (status === 'confirmed') {
        booking.confirmedAt = new Date();
      }

      await booking.save();
      const updatedBooking = booking;
      
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

  getBookingById: async (req, res, next) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('customerId', 'name phone')
        .populate({
          path: 'barberId',
          populate: { path: 'userId', select: 'name' }
        })
        .populate('services', 'name price durationMinutes')
        .populate('products.productId', 'name price image');
      
      if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
      }

      const formattedBooking = {
        _id: booking._id,
        customerName: booking.bookingType === 'guest' ? booking.customerName : booking.customerId?.name,
        customerPhone: booking.bookingType === 'guest' ? booking.customerPhone : booking.customerId?.phone,
        customerType: booking.bookingType === 'guest' ? 'Khách Vãng Lai' : 'Thành Viên',
        barberName: booking.barberId?.userId?.name || 'Auto',
        serviceName: booking.services?.map(s => s.name).join(', ') || 'Chưa chọn',
        services: booking.services,
        products: booking.products,
        totalPrice: booking.totalPrice,
        amountPaid: booking.amountPaid || 0,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        note: booking.note,
        date: booking.bookingDate.toLocaleDateString('vi-VN'),
        time: booking.bookingDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        rawDate: booking.bookingDate
      };

      return res.status(200).json({ success: true, message: 'Lấy thông tin lịch hẹn thành công', data: formattedBooking });
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
  },

  addItemsToBooking: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = req.body; // { newServices, newProducts }
      const updatedBooking = await staffDashboardService.addItemsToBooking(id, payload);
      
      res.status(200).json({
        success: true,
        data: updatedBooking,
        message: 'Thêm sản phẩm/dịch vụ thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  removeItemFromBooking: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { itemType, itemId } = req.body;
      const updatedBooking = await staffDashboardService.removeItemFromBooking(id, { itemType, itemId });
      
      res.status(200).json({
        success: true,
        data: updatedBooking,
        message: 'Đã xoá thành công'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = staffController;
