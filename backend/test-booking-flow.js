require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Import models
const User = require("./models/user.model");
const Barber = require("./models/barber.model");
const Service = require("./models/service.model");
const Booking = require("./models/booking.model");
const BarberSchedule = require("./models/barber-schedule.model");

// Config
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/HalloBarberShop";
const JWT_SECRET = process.env.JWT_SECRET || "test_secret";
const API_URL = "http://localhost:5000/api/bookings";

async function runTest() {
  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected.");

  try {
    // 1. CLEAN UP old test data
    await User.deleteMany({
      email: { $in: ["test_customer@test.com", "test_barber@test.com"] },
    });
    await Barber.deleteMany({ bio: "Test Barber Bio" });
    await Service.deleteMany({ name: "Test Haircut" });

    // 2. CREATE mock data
    console.log("🔄 Creating test data (Customer, Barber, Service)...");
    const customer = await User.create({
      name: "Test Customer",
      email: "test_customer@test.com",
      password: "password123",
      role: "customer",
      phone: "0123456789",
    });

    const barberUser = await User.create({
      name: "Test Barber",
      email: "test_barber@test.com",
      password: "password123",
      role: "barber",
      phone: "0987654321",
    });

    const barber = await Barber.create({
      userId: barberUser._id,
      bio: "Test Barber Bio",
      experienceYears: 5,
      specialties: ["Fade"],
      workingSince: new Date(),
      maxDailyBookings: 10,
    });

    const service = await Service.create({
      name: "Test Haircut",
      durationMinutes: 30, // 30 mins
      price: 100000,
    });

    // Generate JWT Token for customer
    // Note: auth.middleware checks `process.env.JWT_SECRET`, so we must ensure it matches
    process.env.JWT_SECRET = JWT_SECRET;
    const token = jwt.sign(
      { userId: customer._id, role: "customer" },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Date for booking (tomorrow at 10:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    // Format YYYY-MM-DD
    const dateStr = tomorrow.toISOString().split("T")[0];

    // Ensure clear bookings and schedule for tomorrow
    await Booking.deleteMany({ barberId: barber._id });
    await BarberSchedule.deleteMany({ barberId: barber._id, date: dateStr });

    console.log(`\n📅 Test Date: ${dateStr}`);

    // 3. TEST 1: Create a valid booking (10:00 - 10:30)
    console.log("\n▶️ TEST 1: Đặt lịch hợp lệ (10:00 - 10:30)");
    const booking1Data = {
      bookingType: "user", // 👉 THÊM DÒNG NÀY VÀO
      serviceId: service._id,
      barberId: barber._id,
      bookingDate: new Date(`${dateStr}T10:00:00Z`).toISOString(),
      timeSlot: "10:00",
      durationMinutes: 30,
      date: dateStr,
    };

    let res = await fetch(`${API_URL}/single-page`, {
      method: "POST",
      headers,
      body: JSON.stringify(booking1Data),
    });
    let data = await res.json();

    if (res.ok) {
      console.log("✅ THÀNH CÔNG: Đặt lịch đầu tiên thành công.");
    } else {
      console.error("❌ THẤT BẠI:", data);
    }

    // 4. TEST 2: Create overlapping booking (10:15 - 10:45)
    console.log("\n▶️ TEST 2: Đặt lịch trùng giờ - Overlap (10:15 - 10:45)");
    const booking2Data = {
      bookingType: "user", // 👉 THÊM DÒNG NÀY VÀO
      serviceId: service._id,
      barberId: barber._id,
      bookingDate: new Date(`${dateStr}T10:15:00Z`).toISOString(),
      timeSlot: "10:15",
      durationMinutes: 30,
      date: dateStr,
    };

    res = await fetch(`${API_URL}/single-page`, {
      method: "POST",
      headers,
      body: JSON.stringify(booking2Data),
    });
    data = await res.json();

    if (
      (!res.ok && data.errorCode === "BARBER_CONFLICT") ||
      data.errorCode === "BOOKING_CONFLICT"
    ) {
      console.log("✅ THÀNH CÔNG: Hệ thống đã chặn thành công lỗi trùng lịch.");
      console.log("   Lý do trả về:", data.message);
    } else {
      console.error(
        "❌ THẤT BẠI: Hệ thống không chặn được trùng lịch hoặc lỗi khác.",
        data,
      );
    }

    // 5. TEST 3: Create valid non-overlapping booking (10:30 - 11:00)
    console.log("\n▶️ TEST 3: Đặt lịch tiếp nối hợp lệ (10:30 - 11:00)");
    const booking3Data = {
      bookingType: "user", // 👉 THÊM DÒNG NÀY VÀO
      serviceId: service._id,
      barberId: barber._id,
      bookingDate: new Date(`${dateStr}T10:30:00Z`).toISOString(),
      timeSlot: "10:30",
      durationMinutes: 30,
      date: dateStr,
    };

    res = await fetch(`${API_URL}/single-page`, {
      method: "POST",
      headers,
      body: JSON.stringify(booking3Data),
    });
    data = await res.json();

    if (res.ok) {
      console.log("✅ THÀNH CÔNG: Đặt lịch tiếp nối hợp lệ thành công.");
    } else {
      console.error("❌ THẤT BẠI:", data);
    }

    // 6. TEST 4: Check BarberSchedule in Database
    console.log(
      "\n▶️ TEST 4: Kiểm tra việc đánh dấu Slot trong Database (BarberSchedule)",
    );
    const schedule = await BarberSchedule.findOne({
      barberId: barber._id,
      date: dateStr,
    });
    if (schedule) {
      const bookedSlots = schedule.availableSlots
        .filter((s) => s.isBooked)
        .map((s) => s.time);
      console.log(
        '   Các slot đã bị đánh dấu là "đã đặt" (isBooked = true):',
        bookedSlots,
      );

      if (bookedSlots.includes("10:00") && bookedSlots.includes("10:30")) {
        console.log(
          "✅ THÀNH CÔNG: Slot 10:00 và 10:30 đã được cập nhật đúng trong DB.",
        );
      } else {
        console.error(
          "❌ THẤT BẠI: Slot chưa được cập nhật đúng.",
          bookedSlots,
        );
      }
    } else {
      console.error("❌ THẤT BẠI: Không tìm thấy BarberSchedule trong DB.");
    }

    // 7. TEST 5: Create Standard Booking (11:30 - 12:00)
    console.log("\n▶️ TEST 5: Đặt lịch User thông thường qua /api/bookings (11:30 - 12:00)");
    const booking5Data = {
      bookingType: "user",
      serviceId: service._id,
      barberId: barber._id,
      bookingDate: new Date(`${dateStr}T11:30:00Z`).toISOString(),
      timeSlot: "11:30",
      durationMinutes: 30,
    };
    
    let res5 = await fetch(`${API_URL}`, {
      method: "POST",
      headers,
      body: JSON.stringify(booking5Data),
    });
    let data5 = await res5.json();

    if (res5.ok) {
      console.log("✅ THÀNH CÔNG: Đặt lịch User thông thường thành công.");
    } else {
      console.error("❌ THẤT BẠI:", data5);
    }

    // 8. TEST 6: Create Walk-in Booking (12:00 - 12:30)
    // Needs admin role
    const adminToken = jwt.sign(
      { userId: customer._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const adminHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    };

    console.log("\n▶️ TEST 6: Đặt lịch Walk-in qua /api/bookings/walk-in (12:00 - 12:30)");
    const booking6Data = {
      serviceId: service._id,
      barberId: barber._id,
      bookingDate: new Date(`${dateStr}T12:00:00Z`).toISOString(),
      date: dateStr,
      timeSlot: "12:00",
      customerName: "Khách Vãng Lai",
      customerPhone: "0999999999",
      durationMinutes: 30,
    };
    
    let res6 = await fetch(`${API_URL}/walk-in`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify(booking6Data),
    });
    let data6 = await res6.json();

    if (res6.ok) {
      console.log("✅ THÀNH CÔNG: Đặt lịch Walk-in thành công.");
    } else {
      console.error("❌ THẤT BẠI:", data6);
    }

  } catch (err) {
    console.error("Lỗi trong quá trình chạy test:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\n🏁 Hoàn thành bài test.");
  }
}

runTest();
