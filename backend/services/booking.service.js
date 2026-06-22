const Booking = require('../models/booking.model');
const Barber = require('../models/barber.model');
const Service = require('../models/service.model');
const NoShow = require('../models/no-show.model');
const BarberAbsence = require('../models/barber-absence.model');
const BarberSchedule = require('../models/barber-schedule.model');

/**
 * Handle business logic for creating a new booking
 */
exports.processCreateBooking = async ({
  bookingType,
  customerId,
  barberId,
  serviceId,
  bookingDate,
  timeSlot,
  durationMinutes,
  note,
  notificationMethods,
  autoAssignedBarber,
  customerName,
  customerEmail,
  customerPhone,
}) => {
  // Normalize Date to prevent race conditions
  const requestedDateTime = new Date(bookingDate);
  requestedDateTime.setSeconds(0, 0);

  // Time Buffer Validation (30 mins advance)
  const now = new Date();
  const minutesDifference = (requestedDateTime.getTime() - now.getTime()) / (1000 * 60);

  if (minutesDifference < 30) {
    const error = new Error('Bookings must be made at least 30 minutes in advance');
    error.statusCode = 400;
    error.errorCode = 'BOOKING_TOO_SOON';
    throw error;
  }

  // No-show validation for User
  if (bookingType === 'user' && customerId) {
    const isBlocked = await NoShow.isCustomerBlocked(customerId, 3);
    if (isBlocked) {
      const noShowCount = await NoShow.getCustomerNoShowCount(customerId);
      const error = new Error(`Booking blocked due to ${noShowCount} cancellations/no-shows.`);
      error.statusCode = 403;
      error.errorCode = 'CUSTOMER_BLOCKED';
      throw error;
    }
  }

  // Barber Absence
  const isBarberAbsent = await BarberAbsence.isBarberAbsent(barberId, requestedDateTime);
  if (isBarberAbsent) {
    const error = new Error('Selected barber is not available on this date');
    error.statusCode = 400;
    error.errorCode = 'BARBER_ABSENT';
    throw error;
  }

  // Conflict Checking (Overlap)
  const dateStr = requestedDateTime.toISOString().split('T')[0];
  const barberBookings = await Booking.find({
    barberId,
    bookingDate: {
      $gte: new Date(dateStr + 'T00:00:00.000Z'),
      $lt: new Date(dateStr + 'T23:59:59.999Z'),
    },
    status: { $in: ['pending', 'confirmed'] },
  }).sort({ bookingDate: 1 });

  const newStart = new Date(requestedDateTime);
  const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

  // 1. Barber Conflict
  const barberConflict = barberBookings.find((booking) => {
    const existingStart = new Date(booking.bookingDate);
    const existingEnd = new Date(existingStart.getTime() + booking.durationMinutes * 60000);
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (barberConflict) {
    const error = new Error(`Time slot conflict detected. Your ${durationMinutes}-minute service overlaps with an existing booking.`);
    error.statusCode = 409;
    error.errorCode = 'BOOKING_CONFLICT';
    throw error;
  }

  // 2. Customer Conflict
  if (bookingType === 'user' && customerId) {
    const customerBookings = await Booking.find({
      customerId,
      bookingDate: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lt: new Date(dateStr + 'T23:59:59.999Z'),
      },
      status: { $in: ['pending', 'confirmed'] },
    });

    const customerConflict = customerBookings.find((booking) => {
      const existingStart = new Date(booking.bookingDate);
      const existingEnd = new Date(existingStart.getTime() + booking.durationMinutes * 60000);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (customerConflict) {
      const error = new Error(`You already have a booking during this time period.`);
      error.statusCode = 409;
      error.errorCode = 'CUSTOMER_DOUBLE_BOOKING';
      throw error;
    }
  }

  // Barber Daily Limit
  const barber = await Barber.findById(barberId);
  if (!barber) {
    const error = new Error('Barber not found');
    error.statusCode = 404;
    throw error;
  }

  if (barberBookings.length >= barber.maxDailyBookings) {
    const error = new Error('Barber has reached maximum bookings for this date');
    error.statusCode = 400;
    error.errorCode = 'DAILY_LIMIT_EXCEEDED';
    throw error;
  }

  // Service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Save Booking
  const bookingData = {
    bookingType,
    customerId,
    barberId,
    serviceId,
    bookingDate: requestedDateTime,
    durationMinutes,
    note,
    notificationMethods,
    autoAssignedBarber,
    customerName,
    customerEmail,
    customerPhone,
  };

  // If created via POS or auto-assigned by staff, it might be auto-confirmed
  // We will let the controller decide, but if autoAssignedBarber is true, we confirm it
  if (autoAssignedBarber) {
    bookingData.status = 'confirmed';
    bookingData.confirmedAt = new Date();
  }

  const booking = new Booking(bookingData);

  await booking.save();

  // Update totalBookings (non-blocking)
  try {
    await Barber.findByIdAndUpdate(barberId, { $inc: { totalBookings: 1 } });
  } catch (updateError) {
    console.error('Error updating barber totalBookings:', updateError);
  }

  // Lock Schedule
  try {
    await BarberSchedule.markSlotsAsBooked(
      barberId,
      dateStr,
      timeSlot,
      durationMinutes,
      booking._id,
      null
    );
  } catch (scheduleError) {
    await Booking.findByIdAndDelete(booking._id);
    const error = new Error('Failed to reserve time slots in schedule: ' + scheduleError.message);
    error.statusCode = 409;
    error.errorCode = 'SCHEDULE_UPDATE_FAILED';
    throw error;
  }

  // Return populated
  const populatedBooking = await Booking.findById(booking._id)
    .populate('serviceId', 'name price durationMinutes')
    .populate('barberId', 'userId specialties averageRating')
    .populate('customerId', 'name email phone')
    .populate({
      path: 'barberId',
      populate: { path: 'userId', select: 'name email' },
    });

  return populatedBooking;
};

/**
 * Sinh danh sách khung giờ động (Dynamic Gap Packing)
 * @param {String} barberId ID của thợ cắt
 * @param {String} date Ngày cần kiểm tra "YYYY-MM-DD"
 * @param {Number} durationMinutes Thời lượng của dịch vụ
 * @returns {Array} Mảng các khung giờ { time, available, reason }
 */
exports.generateDynamicSlots = async (barberId, date, durationMinutes = 30) => {
  const BarberAbsence = require("../models/barber-absence.model");
  const Booking = require("../models/booking.model");

  // Check if barber is absent all day
  const requestedDateTime = new Date(`${date}T12:00:00`);
  const isAbsent = await BarberAbsence.isBarberAbsent(barberId, requestedDateTime);
  if (isAbsent) {
    return []; // Trả về mảng rỗng nếu nghỉ cả ngày
  }

  // Lấy các booking trong ngày (chuyển sang UTC để match database)
  const startDate = new Date(`${date}T00:00:00+07:00`); // Vietnam Time
  const endDate = new Date(`${date}T23:59:59+07:00`);

  const conflictingBookings = await Booking.find({
    barberId,
    bookingDate: { $gte: startDate, $lt: endDate },
    status: { $in: ["pending", "confirmed"] }
  });

  conflictingBookings.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

  // Hàm check đụng lịch
  const checkOverlap = (start, end) => {
    return conflictingBookings.some(booking => {
      const bStart = new Date(booking.bookingDate).getTime();
      const bEnd = bStart + booking.durationMinutes * 60000;
      return start.getTime() < bEnd && end.getTime() > bStart;
    });
  };

  const baseSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  const resultSlots = [];

  // Bước 1: Quét các base slots
  for (const time of baseSlots) {
    const slotStart = new Date(`${date}T${time}:00+07:00`);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
    
    let isAvailable = true;
    let reason = null;

    if (checkOverlap(slotStart, slotEnd)) {
      isAvailable = false;
      reason = "Khung giờ đã có khách đặt";
    }

    resultSlots.push({ time, available: isAvailable, reason });
  }

  // Bước 2: Quét các khoảng hở (Gap Packing)
  for (const booking of conflictingBookings) {
    const bEnd = new Date(new Date(booking.bookingDate).getTime() + booking.durationMinutes * 60000);
    
    // Chuyển bEnd sang giờ Việt Nam để tính toán
    const localTime = new Date(bEnd.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const hours = localTime.getHours();
    const mins = localTime.getMinutes();
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    
    // Chỉ tính nếu nằm trong giờ làm việc và không phải giờ nghỉ trưa
    if (hours >= 9 && hours < 20 && hours !== 12) {
      // Ràng buộc nếu endtime vượt quá 19:00 (ca cuối) thì bỏ
      if (hours === 19 && mins > 0) continue; 

      const slotStart = bEnd;
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      
      if (!checkOverlap(slotStart, slotEnd)) {
        // Kiểm tra xem đã có trong resultSlots chưa
        if (!resultSlots.some(s => s.time === timeStr)) {
          resultSlots.push({ time: timeStr, available: true, reason: null });
        }
      }
    }
  }

  // Bước 3: Áp dụng ràng buộc Tối đa 2 tiếng (chỉ cho 19:00) và kiểm tra giờ quá khứ
  const now = new Date();
  const localNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const currentYear = localNow.getFullYear();
  const currentMonth = String(localNow.getMonth() + 1).padStart(2, '0');
  const currentDay = String(localNow.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;
  
  if (date === todayStr) {
    const currentHour = localNow.getHours();
    const currentMin = localNow.getMinutes();

    for (const slot of resultSlots) {
      const [h, m] = slot.time.split(':').map(Number);
      
      // Cản giờ trong quá khứ
      if (currentHour > h || (currentHour === h && currentMin >= m)) {
         slot.available = false;
         slot.reason = "Thời gian đã trôi qua";
      }
      
      // Luật Tối thiểu 2 tiếng cho 19:00
      if (slot.time === "19:00" && slot.available) {
        if (currentHour >= 17) {
          slot.available = false;
          slot.reason = "Yêu cầu bạn đặt lịch trước tối thiểu 2 tiếng để quán có thể sẵn sàng phục vụ";
        }
      }
    }
  }

  // Bước 4: Sort lại list từ sáng đến tối
  resultSlots.sort((a, b) => {
    const [ah, am] = a.time.split(':').map(Number);
    const [bh, bm] = b.time.split(':').map(Number);
    return (ah * 60 + am) - (bh * 60 + bm);
  });

  return resultSlots;
};
