const Booking = require('../models/booking.model');

class BookingStatsService {
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
