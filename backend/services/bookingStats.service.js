const Booking = require('../models/booking.model');

class BookingStatsService {
  async getAdminDashboardMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const bookings = await Booking.find({ status: 'completed' }).populate('services');
    
    let currentRevenue = 0;
    let previousRevenue = 0;
    let currentBookingsCount = 0;
    let currentTotalValue = 0;

    const currentCustomers = new Set();
    const previousCustomers = new Set();

    bookings.forEach(b => {
      const date = new Date(b.bookingDate);
      const price = (b.services && b.services.length > 0) ? b.services.reduce((sum, s) => sum + (s.price || 0), 0) : (b.totalPrice || 0);
      const customerId = b.customerId?.toString() || b.customerName || 'guest';

      if (date >= thirtyDaysAgo && date <= now) {
        currentRevenue += price;
        currentBookingsCount++;
        currentTotalValue += price;
        if (customerId !== 'guest') currentCustomers.add(customerId);
      } else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) {
        previousRevenue += price;
        if (customerId !== 'guest') previousCustomers.add(customerId);
      }
    });

    // Calculate Trends
    const revenueTrend = previousRevenue === 0 ? (currentRevenue > 0 ? 100 : 0) : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const currentNewCustomersCount = currentCustomers.size;
    const previousNewCustomersCount = previousCustomers.size;
    const customerTrend = previousNewCustomersCount === 0 ? (currentNewCustomersCount > 0 ? 100 : 0) : ((currentNewCustomersCount - previousNewCustomersCount) / previousNewCustomersCount) * 100;
    const avgBookingValue = currentBookingsCount === 0 ? 0 : (currentTotalValue / currentBookingsCount);

    return {
      totalRevenue: currentRevenue,
      revenueTrend: revenueTrend.toFixed(1),
      newCustomers: currentNewCustomersCount,
      customerTrend: customerTrend.toFixed(1),
      avgBookingValue: avgBookingValue.toFixed(2),
      avgBookingTrend: 0.0 // Simplified for now
    };
  }

  async getAdminTopBarbers() {
    const bookings = await Booking.find({ status: 'completed' }).populate({
      path: 'barberId',
      populate: { path: 'userId' }
    }).populate('services');

    const barberStats = {};

    for (const b of bookings) {
      if (!b.barberId) continue;
      const id = b.barberId._id.toString();
      if (!barberStats[id]) {
        barberStats[id] = {
          id,
          name: b.barberId.userId?.name || 'Thợ chưa đặt tên',
          revenue: 0,
          rating: b.barberId.averageRating || 0,
          completedBookings: 0,
          avatarUrl: b.barberId.profileImageUrl || b.barberId.userId?.avatarUrl || ''
        };
      }
      barberStats[id].completedBookings++;
      if (b.services && b.services.length > 0) {
        barberStats[id].revenue += b.services.reduce((sum, s) => sum + (s.price || 0), 0);
      } else if (b.totalPrice) {
        barberStats[id].revenue += b.totalPrice;
      }
    }

    return Object.values(barberStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  async getBookingStats() {
    const bookings = await Booking.find().populate("customerId");
    const now = new Date();
    
    const upcoming = bookings.filter(
      (b) =>
        (b.status === "pending" || b.status === "confirmed") &&
        new Date(b.bookingDate) >= now,
    ).length;
    
    const past = bookings.filter(
      (b) =>
        b.status === "completed" ||
        (new Date(b.bookingDate) < now &&
          b.status !== "cancelled" &&
          b.status !== "no_show"),
    ).length;
    
    const cancelled = bookings.filter(
      (b) => b.status === "cancelled" || b.status === "no_show",
    ).length;
    
    const totalCustomer = new Set(
      bookings.map((b) => b.customerId?._id || b.customerId),
    ).size;
    
    return { upcoming, past, cancelled, totalCustomer };
  }

  async getBookingChartStats(from, to, mode = "day") {
    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();

    const matchStage = {
      bookingDate: { $gte: start, $lte: end },
    };

    let groupStage;
    let projectStage;

    if (mode === "day") {
      groupStage = { _id: { $hour: "$bookingDate" } };
      projectStage = {
        _id: 0,
        time: { $concat: [{ $toString: "$_id" }, ":00"] },
        pending: 1,
        confirmed: 1,
        completed: 1,
        cancelled: 1,
      };
    } else if (mode === "week" || mode === "month") {
      groupStage = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
      };
      projectStage = {
        _id: 0,
        date: "$_id",
        pending: 1,
        confirmed: 1,
        completed: 1,
        cancelled: 1,
      };
    } else if (mode === "year") {
      groupStage = {
        _id: { $dateToString: { format: "%Y-%m", date: "$bookingDate" } },
      };
      projectStage = {
        _id: 0,
        month: "$_id",
        pending: 1,
        confirmed: 1,
        completed: 1,
        cancelled: 1,
      };
    } else {
      return [];
    }

    const result = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelled: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "cancelled"] },
                    { $eq: ["$status", "no_show"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $project: projectStage },
      {
        $sort:
          mode === "year"
            ? { month: 1 }
            : mode === "day"
              ? { time: 1 }
              : { date: 1 },
      },
    ]);

    return Array.isArray(result) ? result : [];
  }
}

module.exports = new BookingStatsService();
