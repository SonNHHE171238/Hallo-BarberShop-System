const cron = require("node-cron");
const Booking = require("../../models/booking.model");
const BarberSchedule = require("../../models/barber-schedule.model");
const User = require("../../models/user.model");

// Hàm thực hiện quét và hủy các booking của ngày cụ thể
const cleanupBookingsForDate = async (dateStr) => {
  try {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    // Tìm các booking trong ngày chưa được thao tác (pending, confirmed)
    const pendingBookings = await Booking.find({
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    if (pendingBookings.length === 0) {
      console.log(`[CRON Booking Cleanup] Không có booking nào bị bỏ quên trong ngày ${dateStr}.`);
      return;
    }

    console.log(`[CRON Booking Cleanup] Đã tìm thấy ${pendingBookings.length} booking bị bỏ quên. Tiến hành hủy...`);

    let cancelCount = 0;

    for (const booking of pendingBookings) {
      try {
        const bookingDateStr = startOfDay.toISOString().split("T")[0];

        // 1. Giải phóng lịch cho Barber (mặc dù ngày đã qua nhưng vẫn cần để dữ liệu nhất quán)
        try {
          await BarberSchedule.unmarkSlotsAsBooked(
            booking.barberId,
            bookingDateStr,
            booking._id,
            null
          );
        } catch (scheduleError) {
          console.error(`[CRON Booking Cleanup] Lỗi khi giải phóng lịch cho booking ${booking._id}:`, scheduleError.message);
        }

        // 2. Trừ totalBookings của Barber
        try {
          const barber = await User.findById(booking.barberId);
          if (barber && barber.role === "barber") {
            if (barber.totalBookings && barber.totalBookings > 0) {
              barber.totalBookings -= 1;
              await barber.save();
            }
          }
        } catch (barberError) {
          console.error(`[CRON Booking Cleanup] Lỗi khi trừ totalBookings cho thợ ${booking.barberId}:`, barberError.message);
        }

        // 3. Cập nhật booking status và note
        const noteMsg = "Hệ thống huỷ booking do không ai thao tác lên booking này";
        booking.status = "cancelled";
        booking.note = booking.note ? `${booking.note}\n${noteMsg}` : noteMsg;
        
        await booking.save();
        cancelCount++;
        
      } catch (err) {
         console.error(`[CRON Booking Cleanup] Lỗi khi xử lý booking ${booking._id}:`, err);
      }
    }

    console.log(`[CRON Booking Cleanup] Hoàn tất! Đã tự động hủy ${cancelCount} booking.`);
  } catch (error) {
    console.error("[CRON Booking Cleanup] Lỗi trong quá trình quét tự động:", error);
  }
};

// Đặt lịch chạy vào lúc 23:59 mỗi ngày
// Format: minute hour dayOfMonth month dayOfWeek
cron.schedule("59 23 * * *", () => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  console.log(`[CRON Booking Cleanup] Bắt đầu quét booking bỏ quên cho ngày ${dateStr}...`);
  cleanupBookingsForDate(dateStr);
});

console.log("✅ Cron job Booking Cleanup đã được khởi tạo: Chạy vào lúc 23:59 mỗi ngày.");

module.exports = { cleanupBookingsForDate };
