const Booking = require('../models/booking.model');
const Barber = require('../models/barber.model');
const BarberAbsence = require('../models/barber-absence.model');
require('../models/user.model'); // Ensure User schema is registered
require('../models/service.model'); // Ensure Service schema is registered

const staffDashboardService = {
  getDashboardMetrics: async () => {
    // 1. Lấy thông tin ngày hôm nay (00:00:00 -> 23:59:59)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 2. Tổng lịch hẹn hôm nay
    const totalBookingsToday = await Booking.countDocuments({
      bookingDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    // 3. Khách đã xong: Booking status là completed
    const waitingCustomers = await Booking.countDocuments({
      bookingDate: { $gte: todayStart, $lte: todayEnd },
      status: 'completed'
    });

    // 4. Doanh thu dự kiến: Tổng price của tất cả bookings hôm nay
    const bookingsToday = await Booking.find({
      bookingDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['pending', 'confirmed', 'completed'] }
    }).populate('services', 'price');

    let expectedRevenue = 0;
    bookingsToday.forEach(b => {
      if (b.services && b.services.length > 0) {
        // Cộng tổng giá của tất cả services trong booking
        b.services.forEach(s => {
          if (s.price) expectedRevenue += s.price;
        });
      }
    });

    // 5. Thợ đang hoạt động / Tổng thợ
    const totalBarbers = await Barber.countDocuments({ isActive: true });
    // Thợ đang hoạt động = không có lịch nghỉ (BarberAbsence) nguyên ngày hôm nay
    // Simple version: just return active barbers for now, we will refine in barbers-status
    const activeBarbers = totalBarbers; // Update logic if needed

    return {
      totalBookingsToday,
      waitingCustomers,
      expectedRevenue,
      activeBarbers,
      totalBarbers
    };
  },

  getUpcomingBookings: async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const getFormattedBookings = async (start, end) => {
      const bookings = await Booking.find({
        bookingDate: { $gte: start, $lte: end }
      })
        .populate('customerId', 'name phone')
        .populate('services', 'name price durationMinutes')
        .populate({
          path: 'barberId',
          populate: { path: 'userId', select: 'name' }
        })
        .sort({ bookingDate: 1 });

      return bookings.map(b => ({
        _id: b._id,
        time: new Date(b.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        customerName: b.bookingType === 'user' && b.customerId ? b.customerId.name : (b.customerName || 'Khách Vãng Lai'),
        customerPhone: b.bookingType === 'user' && b.customerId ? b.customerId.phone : (b.customerPhone || 'N/A'),
        serviceName: (b.services && b.services.length > 0) ? b.services.map(s => s.name).join(', ') : 'Unknown',
        barberName: b.barberId && b.barberId.userId ? b.barberId.userId.name : 'Auto',
        status: b.status
      }));
    };

    const todayBookings = await getFormattedBookings(todayStart, todayEnd);
    const tomorrowBookings = await getFormattedBookings(tomorrowStart, tomorrowEnd);

    return {
      today: todayBookings,
      tomorrow: tomorrowBookings
    };
  },

  getBarbersStatus: async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const barbers = await Barber.find({ isActive: true }).populate('userId', 'name');
    const statuses = [];

    for (const barber of barbers) {
      // Check if on break (Nghỉ phép)
      const isAbsent = await BarberAbsence.exists({
        barberId: barber._id,
        date: { $gte: todayStart, $lte: todayEnd },
        status: 'approved'
      });

      let statusStr = 'Làm việc';
      if (isAbsent) {
        statusStr = 'Nghỉ phép';
      }

      statuses.push({
        _id: barber._id,
        name: barber.userId ? barber.userId.name : 'Barber',
        role: barber.title || 'Barber',
        image: barber.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(barber.userId ? barber.userId.name : 'Barber'),
        status: statusStr
      });
    }

    return statuses;
  },

  updateCheckIn: async (bookingId, isCheckedIn) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error("Không tìm thấy lịch hẹn");
    }
    booking.isCheckedIn = isCheckedIn;
    // Tự động chuyển status sang confirmed nếu đang pending
    if (booking.isCheckedIn && booking.status === 'pending') {
      booking.status = 'confirmed';
    }
    await booking.save();
    return booking;
  },

  getAppointmentsList: async ({ date, barberId, status }) => {
    // Determine the date range
    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date);
    }
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const query = {
      bookingDate: { $gte: start, $lte: end }
    };

    if (barberId && barberId !== 'all') {
      query.barberId = barberId;
    }

    if (status && status !== 'all') {
      if (status === 'waiting') {
        // Đang chờ: pending, confirmed (đã check-in chưa làm)
        query.status = { $in: ['pending', 'confirmed'] };
      } else if (status === 'serving') {
        // Đang làm
        query.status = 'in-progress'; 
        // Wait, if "in-progress" is not a status, maybe just use "confirmed"?
        // In the HTML, "Đang làm" is a status. If we don't have it, we use confirmed + isCheckedIn
      } else {
        query.status = status;
      }
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name phone')
      .populate('services', 'name price durationMinutes')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ bookingDate: 1 });

    const formattedBookings = bookings.map(b => {
      let uiStatus = 'Chưa tới';
      let statusClass = 'bg-surface-bright/50 text-gold-dim border-gold-dim/30';
      
      if (b.status === 'completed') {
        uiStatus = 'Hoàn thành';
        statusClass = 'bg-primary/5 text-primary border-primary/20';
      } else if (b.status === 'cancelled' || b.status === 'rejected') {
        uiStatus = 'Đã hủy';
        statusClass = 'bg-error/10 text-error border-error/20';
      } else if (b.status === 'no_show') {
        uiStatus = 'Không đến';
        statusClass = 'bg-error/10 text-error border-error/20';
      } else if (b.status === 'confirmed') {
        uiStatus = 'Khách đã đến';
        statusClass = 'bg-green-800/20 text-green-700 border-green-700/50';
      } else {
        uiStatus = 'Chưa tới';
      }

      return {
        _id: b._id,
        time: new Date(b.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        customerName: b.bookingType === 'user' && b.customerId ? b.customerId.name : (b.customerName || 'Khách Vãng Lai'),
        customerPhone: b.bookingType === 'user' && b.customerId ? b.customerId.phone : (b.customerPhone || 'N/A'),
        customerType: b.bookingType === 'user' ? 'Customer' : 'Guest',
        serviceName: (b.services && b.services.length > 0) ? b.services.map(s => s.name).join(', ') : 'Unknown',
        barberName: b.barberId && b.barberId.userId ? b.barberId.userId.name : 'Auto',
        rawStatus: b.status,
        uiStatus,
        statusClass,
        isCheckedIn: b.isCheckedIn || false
      };
    });

    // Calculate Stats
    const totalBookings = formattedBookings.length;
    const serving = formattedBookings.filter(b => b.uiStatus === 'Khách đã đến').length;
    
    // Chairs empty
    const totalBarbers = await Barber.countDocuments({ isActive: true });
    // Assuming 1 chair per barber
    const emptyChairs = Math.max(0, totalBarbers - serving);

    return {
      appointments: formattedBookings,
      stats: {
        total: totalBookings,
        serving: serving,
        emptyChairs: emptyChairs
      }
    };
  }
};

module.exports = staffDashboardService;
