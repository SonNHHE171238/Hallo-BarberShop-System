const cron = require("node-cron");
const mongoose = require("mongoose");
const WeeklyRoster = require("../models/weekly-roster.model");

// Hàm sinh Roster mới
const generateWeeklyRoster = async () => {
  if (process.env.ENABLE_ROSTER_CRON !== "true") {
    console.log(
      "[Cron Job] Roster generation is disabled in .env (ENABLE_ROSTER_CRON)",
    );
    return;
  }

  try {
    console.log("[Cron Job] Bắt đầu kiểm tra và tự động sinh Roster...");

    // Ngày hiện tại
    const today = new Date();

    // Lấy ngày Thứ Hai tuần sau (bắt đầu tuần mới)
    const daysUntilNextMonday = (1 + 7 - today.getDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    nextMonday.setHours(0, 0, 0, 0);

    // Ngày Chủ Nhật tuần sau
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    // Hạn chót đăng ký (Thứ Bảy tuần này, trước Thứ Hai 2 ngày)
    const deadline = new Date(nextMonday);
    deadline.setDate(nextMonday.getDate() - 2);
    deadline.setHours(23, 59, 59, 999);

    // Kiểm tra xem tuần này đã được tạo Roster chưa để tránh trùng lặp
    const existingRoster = await WeeklyRoster.findOne({
      weekStartDate: { $lte: nextMonday },
      weekEndDate: { $gte: nextSunday },
    });

    if (existingRoster) {
      console.log(
        `[Cron Job] Roster cho tuần ${nextMonday.toISOString().split("T")[0]} đã tồn tại. Bỏ qua.`,
      );
      return;
    }

    // Yêu cầu số ca cơ bản cho mỗi ngày (nếu cần)
    const shiftRequirements = [];
    for (let i = 0; i < 7; i++) {
      shiftRequirements.push({
        dayOfWeek: i,
        morning: { staff: 1 },
        afternoon: { staff: 1 },
      });
    }

    // Tạo Roster mới với minShiftsPerStaff = 0 theo yêu cầu
    const roster = new WeeklyRoster({
      weekStartDate: nextMonday,
      weekEndDate: nextSunday,
      registrationDeadline: deadline,
      shiftRequirements,
      closedDays: [], // Mặc định không có ngày nghỉ lễ
      minShiftsPerStaff: 0, // Staff tự do đăng ký
      status: "open_for_registration",
      createdBy: null, // Hệ thống tự tạo
    });

    await roster.save();
    console.log(
      `[Cron Job] Thành công! Đã tự động tạo Roster mới cho tuần từ ${nextMonday.toISOString().split("T")[0]} đến ${nextSunday.toISOString().split("T")[0]}`,
    );
  } catch (error) {
    console.error("[Cron Job] Lỗi khi tự động sinh Roster:", error);
  }
};

const Barber = require("../models/barber.model");
const BarberSchedule = require("../models/barber-schedule.model");

// Hàm tự động Publish Lịch
const autoPublishRoster = async () => {
  if (process.env.ENABLE_ROSTER_CRON !== "true") return;
  try {
    console.log("[Cron Job] Bắt đầu tự động Publish Roster...");
    const today = new Date();
    // Tìm roster có status open_for_registration mà chuẩn bị bắt đầu
    const nextMonday = new Date(today);
    const daysUntilNextMonday = (1 + 7 - today.getDay()) % 7 || 7;
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    nextMonday.setHours(0, 0, 0, 0);

    const roster = await WeeklyRoster.findOne({
      status: "open_for_registration",
      weekStartDate: { $lte: nextMonday }
    });

    if (!roster) {
      console.log("[Cron Job] Không tìm thấy Roster nào cần Publish.");
      return;
    }

    const barbers = await Barber.find({});
    for (const barber of barbers) {
      let currentDate = new Date(roster.weekStartDate);
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const closedDay = roster.closedDays.find(d => {
            if (!d.date) return false;
            return new Date(d.date).toISOString().split('T')[0] === dateStr;
        });

        if (closedDay) {
            let schedule = await BarberSchedule.findOne({ barberId: barber._id, date: dateStr });
            if (!schedule) {
                schedule = new BarberSchedule({
                    barberId: barber._id,
                    date: dateStr,
                    isOffDay: true,
                    offReason: closedDay.reason || 'closed'
                });
            } else {
                schedule.isOffDay = true;
                schedule.offReason = closedDay.reason || 'closed';
            }
            await schedule.save();
        } else {
            let schedule = await BarberSchedule.findOne({ barberId: barber._id, date: dateStr });
            if (schedule && schedule.isOffDay && schedule.absenceId) {
                // Skip
            } else {
                if (!schedule) {
                    schedule = new BarberSchedule({
                        barberId: barber._id,
                        date: dateStr,
                        workingHours: { start: "09:00", end: "19:00" },
                        isOffDay: false
                    });
                    schedule.generateDefaultSlots();
                    await schedule.save();
                } else {
                    schedule.isOffDay = false;
                    schedule.workingHours = { start: "09:00", end: "19:00" };
                    if (!schedule.availableSlots || schedule.availableSlots.length === 0) {
                        schedule.generateDefaultSlots();
                    }
                    await schedule.save();
                }
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    roster.status = 'published';
    roster.publishedAt = new Date();
    await roster.save();
    console.log(`[Cron Job] Đã Publish Roster thành công cho tuần: ${roster.weekStartDate.toISOString().split("T")[0]}`);
  } catch (error) {
    console.error("[Cron Job] Lỗi khi tự động Publish Roster:", error);
  }
};

// Đặt lịch chạy lúc 00:00 sáng Thứ 5 hàng tuần
cron.schedule("0 0 * * 4", generateWeeklyRoster, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

// Đặt lịch chạy lúc 00:00 sáng Chủ Nhật hàng tuần để tự động Publish
cron.schedule("0 0 * * 0", autoPublishRoster, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

console.log("[Cron Job] Roster generator initialized.");

module.exports = { generateWeeklyRoster, autoPublishRoster };
