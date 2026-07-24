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

    if (date && date !== 'all' && date !== 'null' && date !== 'undefined') {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);
        
        query.bookingDate = { $gte: start, $lte: end };
      }
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
      
      const isFuture = new Date(b.bookingDate).setHours(0,0,0,0) > new Date().setHours(0,0,0,0);

      if (b.status === 'cancelled' || b.status === 'rejected') {
        uiStatus = 'Đã hủy';
        statusClass = 'bg-error/10 text-error border-error/20';
      } else if (isFuture) {
        uiStatus = 'Chưa tới';
        statusClass = 'bg-surface-bright/50 text-gold-dim border-gold-dim/30';
      } else if (b.status === 'completed') {
        uiStatus = 'Hoàn thành';
        statusClass = 'bg-primary/5 text-primary border-primary/20';
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
        rawDate: b.bookingDate,
        time: new Date(b.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(b.bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
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

    // Check if there are future/past bookings beyond this date
    let hasFutureBookings = true;
    let hasPastBookings = true;
    if (date && date !== 'all' && date !== 'null' && date !== 'undefined') {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);
        
        const futureCount = await Booking.countDocuments({ bookingDate: { $gt: end } });
        hasFutureBookings = futureCount > 0;
        
        const pastCount = await Booking.countDocuments({ bookingDate: { $lt: start } });
        hasPastBookings = pastCount > 0;
      }
    }

    return {
      appointments: formattedBookings,
      stats: {
        total: totalBookings,
        serving: serving,
        emptyChairs: emptyChairs
      },
      hasFutureBookings,
      hasPastBookings
    };
  },

  addItemsToBooking: async (bookingId, payload) => {
    const { newServices, newProducts } = payload;
    const booking = await Booking.findById(bookingId).populate('services');
    if (!booking) throw new Error('Booking not found');
    
    // Only allow if booking is not completed/cancelled
    if (['completed', 'cancelled', 'rejected', 'no_show'].includes(booking.status)) {
      throw new Error('Cannot add items to a closed booking');
    }

    let additionalPrice = 0;
    let additionalDuration = 0;

    // Handle new Services
    if (newServices && newServices.length > 0) {
      const Service = require('../models/service.model');
      let servicePriceSum = 0;
      for (const sId of newServices) {
        const svc = await Service.findById(sId);
        if (svc) {
          booking.services.push(svc._id);
          servicePriceSum += svc.price || 0;
          additionalDuration += svc.durationMinutes || 30;
        }
      }
      
      if (servicePriceSum > 0 && booking.barberId) {
        const barber = await Barber.findById(booking.barberId);
        if (barber && barber.level === 'vip' && barber.vipMultiplier > 0) {
          servicePriceSum += Math.round(servicePriceSum * barber.vipMultiplier);
        }
      }
      additionalPrice += servicePriceSum;
    }

    // Handle new Products
    if (newProducts && newProducts.length > 0) {
      const Product = require('../models/product.model');
      for (const p of newProducts) {
        const product = await Product.findById(p.productId);
        if (!product) throw new Error(`Product ${p.productId} not found`);
        if (product.stock < p.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
        
        // Decrease stock
        product.stock -= p.quantity;
        await product.save();

        booking.products.push({
          productId: product._id,
          quantity: p.quantity,
          priceAtPurchase: product.price
        });
        additionalPrice += (product.price * p.quantity);
      }
    }

    booking.totalPrice += additionalPrice;
    booking.durationMinutes += additionalDuration;

    await booking.save();
    return booking;
  },

  removeItemFromBooking: async (bookingId, payload) => {
    const { itemType, itemId } = payload;
    const booking = await Booking.findById(bookingId).populate('services');
    if (!booking) throw new Error('Booking not found');
    
    // Only allow if booking is not completed/cancelled
    if (['completed', 'cancelled', 'rejected', 'no_show'].includes(booking.status)) {
      throw new Error('Cannot remove items from a closed booking');
    }

    if (itemType === 'service') {
      if (booking.services.length <= 1) {
        throw new Error('Lịch hẹn phải có ít nhất 1 dịch vụ. Vui lòng thêm dịch vụ khác trước khi xoá dịch vụ này.');
      }
      const serviceIndex = booking.services.findIndex(s => s._id.toString() === itemId);
      if (serviceIndex === -1) throw new Error('Service not found in booking');
      
      const removedSvc = booking.services[serviceIndex];
      let removedPrice = removedSvc.price || 0;
      
      if (removedPrice > 0 && booking.barberId) {
        const barber = await Barber.findById(booking.barberId);
        if (barber && barber.level === 'vip' && barber.vipMultiplier > 0) {
          removedPrice += Math.round(removedPrice * barber.vipMultiplier);
        }
      }

      booking.totalPrice = Math.max(0, booking.totalPrice - removedPrice);
      booking.durationMinutes = Math.max(0, booking.durationMinutes - (removedSvc.durationMinutes || 0));
      
      booking.services.splice(serviceIndex, 1);
    } else if (itemType === 'product') {
      const productIndex = booking.products.findIndex(p => p.productId.toString() === itemId);
      if (productIndex === -1) throw new Error('Product not found in booking');
      
      const removedProd = booking.products[productIndex];
      booking.totalPrice = Math.max(0, booking.totalPrice - ((removedProd.priceAtPurchase || 0) * removedProd.quantity));
      
      // Restore stock
      const Product = require('../models/product.model');
      const dbProduct = await Product.findById(itemId);
      if (dbProduct) {
        dbProduct.stock += removedProd.quantity;
        await dbProduct.save();
      }
      
      booking.products.splice(productIndex, 1);
    } else {
      throw new Error('Invalid itemType');
    }

    await booking.save();
    return booking;
  }
};

module.exports = staffDashboardService;
