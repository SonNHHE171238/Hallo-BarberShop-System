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

    // 3. Khách đang chờ (đã đến): Booking status là confirmed
    const waitingCustomers = await Booking.countDocuments({
      bookingDate: { $gte: todayStart, $lte: todayEnd },
      status: 'confirmed'
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
    const totalBarbers = await Barber.countDocuments({ isAvailable: true });
    
    // Đếm số lượng thợ nghỉ phép hôm nay
    const absencesToday = await BarberAbsence.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'approved'
    });

    const activeBarbers = Math.max(0, totalBarbers - absencesToday);

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
        bookingDate: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'rejected', 'no_show'] }
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
        status: b.status,
        totalPrice: b.totalPrice || 0,
        amountPaid: b.amountPaid || 0,
        paymentStatus: b.paymentStatus || 'pending'
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
    const User = require('../models/user.model');
    const BarberAbsence = require('../models/barber-absence.model');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const barberUsers = await User.find({ role: 'barber', isDeleted: false });
    const barberProfiles = await Barber.find().populate('userId');

    const statuses = [];

    for (const u of barberUsers) {
      const uid = u._id.toString();
      const bp = barberProfiles.find(p => p.userId && p.userId._id.toString() === uid);

      let statusStr = 'Làm việc';
      
      if (bp) {
        const isAbsent = await BarberAbsence.exists({
          barberId: bp._id,
          date: { $gte: todayStart, $lte: todayEnd },
          status: 'approved'
        });
        if (isAbsent) statusStr = 'Nghỉ phép';
      }

      statuses.push({
        _id: bp ? bp._id.toString() : uid,
        name: u.name || 'Barber',
        role: bp ? (bp.title || 'Barber') : 'Barber',
        image: (bp && bp.profileImageUrl) ? bp.profileImageUrl : (u.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'Barber')),
        status: statusStr
      });
    }

    return statuses;
  },



  getAppointmentsList: async ({ date, barberId, status }) => {
    const query = {};

    if (date && date !== 'all') {
      const targetDate = new Date(date);
      const start = new Date(targetDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);
      
      query.bookingDate = { $gte: start, $lte: end };
    }

    if (barberId && barberId !== 'all') {
      query.barberId = barberId;
    }

    if (status && status !== 'all') {
      if (status === 'waiting') {
        // Đang chờ: pending, confirmed (đã check-in chưa làm)
        query.status = { $in: ['pending', 'confirmed'] };
      } else if (status === 'serving') {
        // Đang làm
        query.status = 'in_progress';
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
      } else if (b.status === 'in_progress') {
        uiStatus = 'Đang làm';
        statusClass = 'bg-secondary/20 text-secondary border-secondary/50';
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
        totalPrice: b.totalPrice || 0,
        amountPaid: b.amountPaid || 0,
        paymentStatus: b.paymentStatus || 'pending'
      };
    });

    // Calculate Stats
    const totalBookings = formattedBookings.length;
    const serving = formattedBookings.filter(b => b.uiStatus === 'Khách đã đến').length;
    
    // Chairs empty
    const totalBarbers = await Barber.countDocuments();
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
