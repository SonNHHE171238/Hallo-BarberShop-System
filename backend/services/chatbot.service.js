const { GoogleGenerativeAI } = require('@google/generative-ai');
const Service = require('../models/service.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const Barber = require('../models/barber.model');
const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const bookingAvailabilityService = require('./bookingAvailability.service');
const { systemPrompt: aiAdvicePrompt, responseSchema: adviceSchema } = require('../utils/geminiSchema');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const getShopServices = async () => {
  try {
    const services = await Service.find({ isActive: true }).select('name description price category durationMinutes -_id');
    return JSON.stringify(services);
  } catch (error) {
    return JSON.stringify({ error: "Failed to fetch services." });
  }
};

const getShopProducts = async () => {
  try {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } }).select('name brand description price stock -_id');
    if (!products || products.length === 0) {
      return JSON.stringify({ message: "Hiện tại shop đã hết hàng tất cả sản phẩm." });
    }
    return JSON.stringify(products);
  } catch (error) {
    console.error("Error in getShopProducts:", error);
    return JSON.stringify({ error: "Lỗi hệ thống khi lấy danh sách sản phẩm." });
  }
};

const getAvailableBarbers = async () => {
  try {
    // Lấy danh sách thợ trực tiếp từ User
    const barberUsers = await User.find({ role: 'barber', status: 'active' });
    const formatted = [];
    
    for (const user of barberUsers) {
      const existingBarber = await Barber.findOne({ userId: user._id });
      
      formatted.push({
        name: user.name || "Thợ cắt tóc",
        bio: existingBarber ? existingBarber.bio : null,
        specialties: existingBarber && existingBarber.specialties ? existingBarber.specialties : [],
        experienceYears: existingBarber ? existingBarber.experienceYears : null,
        rating: existingBarber ? existingBarber.averageRating : null
      });
    }

    return JSON.stringify(formatted);
  } catch (error) {
    return JSON.stringify({ error: "Failed to fetch barbers." });
  }
};

const bookAppointment = async (args) => {
  try {
    const { customerName, customerPhone, serviceNames, barberName, bookingDate, startTime } = args;

    if (!isValidPhone(customerPhone)) {
      return JSON.stringify({ success: false, reason: "Số điện thoại không hợp lệ. Vui lòng cung cấp số điện thoại Việt Nam hợp lệ (ví dụ: 0987654321)." });
    }
    const cleanPhone = customerPhone.replace(/\s+/g, '');

    // 1. Lấy thông tin dịch vụ
    const services = await Service.find({ name: { $in: serviceNames }, isActive: true });
    if (!services || services.length === 0) {
      return JSON.stringify({ success: false, reason: "Không tìm thấy dịch vụ nào khớp với yêu cầu." });
    }
    const serviceIds = services.map(s => s._id);
    const totalDuration = services.reduce((acc, curr) => acc + (curr.durationMinutes || 30), 0);

    // 2. Format thời gian (Giả sử múi giờ VN +07:00)
    const requestedDateTime = new Date(`${bookingDate}T${startTime}:00+07:00`);
    const now = new Date();
    if (requestedDateTime < now) {
      return JSON.stringify({ success: false, reason: "Thời gian đặt lịch nằm trong quá khứ. Vui lòng báo khách chọn lại thời gian hợp lệ trong tương lai." });
    }

    // 2.5 Kiểm tra spam (trùng lặp)
    const duplicate = await Booking.findOne({ customerPhone, bookingDate: requestedDateTime, status: "pending" });
    if (duplicate) {
      return JSON.stringify({ success: true, message: "Lịch này đã được ghi nhận trước đó, không cần tạo mới." });
    }

    // 3. Tìm thợ
    let barberId = null;
    let assignedBarberName = "Bất kỳ";
    
    if (barberName && barberName !== "Any" && barberName.toLowerCase() !== "bất kỳ") {
      const users = await User.find({ role: 'barber', status: 'active' });
      const foundUser = users.find(u => u.name && (
        u.name.toLowerCase().includes(barberName.toLowerCase()) || 
        barberName.toLowerCase().includes(u.name.toLowerCase())
      ));
      
      if (foundUser) {
        const foundBarber = await Barber.findOne({ userId: foundUser._id });
        if (!foundBarber) {
          return JSON.stringify({ success: false, reason: `Thợ ${foundUser.name} chưa có hồ sơ chuyên môn nên không thể đặt lịch lúc này.` });
        }
        if (!foundBarber.isAvailable) {
          return JSON.stringify({ success: false, reason: `Thợ ${foundUser.name} hiện đang tạm ngừng nhận khách.` });
        }
        barberId = foundBarber._id;
        assignedBarberName = foundUser.name;
      } else {
        return JSON.stringify({ success: false, reason: `Không tìm thấy thợ tên ${barberName}. Vui lòng chọn thợ khác hoặc để tiệm tự sắp xếp.` });
      }
    }

    // 4. Kiểm tra lịch trống
    if (barberId) {
      const availability = await bookingAvailabilityService.checkAvailability(barberId, requestedDateTime.toISOString(), totalDuration);
      if (!availability.available) {
        return JSON.stringify({ success: false, reason: `Thợ ${assignedBarberName} đã kín lịch vào lúc ${startTime} ngày ${bookingDate}. Vui lòng chọn giờ khác.` });
      }
    } else {
      // Auto-assign
      const barbers = await Barber.find({ isAvailable: true }).populate('userId');
      let foundAvailable = false;
      for (const b of barbers) {
        const availability = await bookingAvailabilityService.checkAvailability(b._id, requestedDateTime.toISOString(), totalDuration);
        if (availability.available) {
          barberId = b._id;
          assignedBarberName = b.userId.name || "Thợ cắt tóc";
          foundAvailable = true;
          break;
        }
      }
      if (!foundAvailable) {
        return JSON.stringify({ success: false, reason: `Rất tiếc, tất cả thợ đều kín lịch vào lúc ${startTime} ngày ${bookingDate}. Vui lòng chọn giờ hoặc ngày khác.` });
      }
    }

    // 5. Tạo Booking
    const totalPrice = services.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const newBooking = new Booking({
      bookingType: "guest",
      customerName: customerName,
      customerPhone: cleanPhone,
      barberId: barberId,
      services: serviceIds,
      bookingDate: requestedDateTime,
      durationMinutes: totalDuration,
      totalPrice: totalPrice,
      status: "pending",
    });

    await newBooking.save();

    return JSON.stringify({ 
      success: true, 
      message: "Đặt lịch thành công", 
      bookingDetails: {
        bookingId: newBooking._id,
        customerName,
        customerPhone: cleanPhone,
        serviceNames: services.map(s => s.name),
        barberName: assignedBarberName,
        time: `${startTime} ngày ${bookingDate}`,
        totalPrice: totalPrice
      }
    });

  } catch (error) {
    console.error("Error in bookAppointment tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi đặt lịch: " + error.message });
  }
};

const updateAppointment = async (args) => {
  try {
    const { bookingId, customerName, customerPhone, serviceNames, barberName, bookingDate, startTime } = args;

    if (!isValidPhone(customerPhone)) {
      return JSON.stringify({ success: false, reason: "Số điện thoại không hợp lệ. Vui lòng cung cấp số điện thoại Việt Nam hợp lệ (ví dụ: 0987654321)." });
    }
    const cleanPhone = customerPhone.replace(/\s+/g, '');

    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      return JSON.stringify({ success: false, reason: "Không tìm thấy lịch hẹn với ID này để cập nhật." });
    }

    // 1. Lấy thông tin dịch vụ
    const services = await Service.find({ name: { $in: serviceNames }, isActive: true });
    if (!services || services.length === 0) {
      return JSON.stringify({ success: false, reason: "Không tìm thấy dịch vụ nào khớp với yêu cầu." });
    }
    const serviceIds = services.map(s => s._id);
    const totalDuration = services.reduce((acc, curr) => acc + (curr.durationMinutes || 30), 0);

    // 2. Format thời gian
    const requestedDateTime = new Date(`${bookingDate}T${startTime}:00+07:00`);
    const now = new Date();
    if (requestedDateTime < now) {
      return JSON.stringify({ success: false, reason: "Thời gian cập nhật nằm trong quá khứ. Vui lòng chọn lại." });
    }

    // 3. Tìm thợ
    let barberId = null;
    let assignedBarberName = "Bất kỳ";
    
    if (barberName && barberName !== "Any" && barberName.toLowerCase() !== "bất kỳ") {
      const users = await User.find({ role: 'barber', status: 'active' });
      const foundUser = users.find(u => u.name && (
        u.name.toLowerCase().includes(barberName.toLowerCase()) || 
        barberName.toLowerCase().includes(u.name.toLowerCase())
      ));
      
      if (foundUser) {
        const foundBarber = await Barber.findOne({ userId: foundUser._id });
        if (!foundBarber) {
          return JSON.stringify({ success: false, reason: `Thợ ${foundUser.name} chưa có hồ sơ chuyên môn nên không thể nhận lịch.` });
        }
        if (!foundBarber.isAvailable) {
          return JSON.stringify({ success: false, reason: `Thợ ${foundUser.name} hiện đang tạm ngừng nhận khách.` });
        }
        barberId = foundBarber._id;
        assignedBarberName = foundUser.name;
      } else {
        return JSON.stringify({ success: false, reason: `Không tìm thấy thợ tên ${barberName}.` });
      }
    }

    // 4. Cập nhật DB
    const totalPrice = services.reduce((acc, curr) => acc + (curr.price || 0), 0);
    existingBooking.customerName = customerName;
    existingBooking.customerPhone = cleanPhone;
    existingBooking.barberId = barberId;
    existingBooking.services = serviceIds;
    existingBooking.bookingDate = requestedDateTime;
    existingBooking.durationMinutes = totalDuration;
    existingBooking.totalPrice = totalPrice;
    
    await existingBooking.save();

    return JSON.stringify({ 
      success: true, 
      message: "Cập nhật lịch thành công", 
      bookingDetails: {
        bookingId: existingBooking._id,
        customerName,
        customerPhone: cleanPhone,
        serviceNames: services.map(s => s.name),
        barberName: assignedBarberName,
        time: `${startTime} ngày ${bookingDate}`,
        totalPrice: totalPrice
      }
    });

  } catch (error) {
    console.error("Error in updateAppointment tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi cập nhật: " + error.message });
  }
};

const cancelAppointment = async (args) => {
  try {
    const { customerPhone } = args;
    if (!isValidPhone(customerPhone)) {
      return JSON.stringify({ success: false, reason: "Số điện thoại không hợp lệ. Vui lòng cung cấp số điện thoại Việt Nam hợp lệ (ví dụ: 0987654321)." });
    }
    const cleanPhone = customerPhone.replace(/\s+/g, '');

    // Find the latest pending or confirmed booking for this phone number
    const booking = await Booking.findOne({
      customerPhone: cleanPhone,
      status: { $in: ["pending", "confirmed"] },
      bookingDate: { $gte: new Date() } // Only cancel future bookings
    }).sort({ bookingDate: 1 });

    if (!booking) {
      return JSON.stringify({ success: false, reason: `Không tìm thấy lịch hẹn nào sắp tới cho số điện thoại ${customerPhone}.` });
    }

    // Unmark slots in BarberSchedule
    const BarberSchedule = require("../models/barber-schedule.model");
    const dateStr = booking.bookingDate.toISOString().split("T")[0];
    try {
      await BarberSchedule.unmarkSlotsAsBooked(booking.barberId, dateStr, booking._id, null);
    } catch (e) {
      console.error("Error unmarking slots for cancellation via chatbot:", e);
    }

    // Update booking status
    booking.status = "cancelled";
    booking.note = booking.note ? `${booking.note}\nHủy qua Chatbot AI` : "Hủy qua Chatbot AI";
    await booking.save();

    // Decrease barber's total bookings
    const Barber = require("../models/barber.model");
    try {
      await Barber.findByIdAndUpdate(booking.barberId, { $inc: { totalBookings: -1 } });
    } catch (e) {
      console.error("Error updating totalBookings via chatbot:", e);
    }

    // Return success
    const serviceNames = await Service.find({ _id: { $in: booking.services } }).select('name');
    const serviceList = serviceNames.map(s => s.name).join(", ");
    
    return JSON.stringify({
      success: true,
      message: `Đã hủy thành công lịch hẹn vào lúc ${booking.bookingDate.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} ngày ${dateStr} cho dịch vụ ${serviceList}.`
    });
  } catch (error) {
    console.error("Error in cancelAppointment tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi hủy lịch: " + error.message });
  }
};

const lookupAppointments = async (args) => {
  try {
    const { customerPhone } = args;
    if (!isValidPhone(customerPhone)) {
      return JSON.stringify({ success: false, reason: "Số điện thoại không hợp lệ. Vui lòng cung cấp số điện thoại Việt Nam hợp lệ (ví dụ: 0987654321)." });
    }
    const cleanPhone = customerPhone.replace(/\s+/g, '');

    const bookings = await Booking.find({
      customerPhone: cleanPhone,
      status: { $in: ["pending", "confirmed"] },
      bookingDate: { $gte: new Date() }
    })
    .populate('services', 'name')
    .populate({
      path: 'barberId',
      populate: { path: 'userId', select: 'name' }
    })
    .sort({ bookingDate: 1 });

    if (!bookings || bookings.length === 0) {
      return JSON.stringify({ success: true, message: `Bạn không có lịch hẹn nào sắp tới với số điện thoại ${cleanPhone}.` });
    }

    const bookingList = bookings.map(b => {
      const dateStr = b.bookingDate.toISOString().split("T")[0];
      const timeStr = b.bookingDate.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
      const serviceNames = b.services.map(s => s.name).join(", ");
      const barberName = b.barberId && b.barberId.userId ? b.barberId.userId.name : "Thợ bất kỳ";
      
      const amountPaid = b.amountPaid || 0;
      const amountRemaining = b.totalPrice - amountPaid;
      const paymentStatusStr = b.paymentStatus === 'paid' ? 'Đã thanh toán đủ' : (amountPaid > 0 ? `Đã thanh toán: ${amountPaid} VNĐ, Còn thiếu: ${amountRemaining} VNĐ` : 'Chưa thanh toán');

      return `- Mã đặt lịch: ${b._id}\n  Thời gian: ${timeStr} ngày ${dateStr}\n  Thợ: ${barberName}\n  Dịch vụ: ${serviceNames}\n  Tổng tiền: ${b.totalPrice} VNĐ\n  Thanh toán: ${paymentStatusStr}`;
    }).join("\n\n");

    return JSON.stringify({ 
      success: true, 
      message: `Đây là các lịch hẹn sắp tới của bạn (SĐT: ${cleanPhone}):\n\n${bookingList}` 
    });
  } catch (error) {
    console.error("Error in lookupAppointments tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi tra cứu lịch: " + error.message });
  }
};

const placeOrder = async (args) => {
  try {
    const { customerName, customerPhone, shippingAddress, items, paymentMethod } = args;

    if (!isValidPhone(customerPhone)) {
      return JSON.stringify({ success: false, reason: "Số điện thoại không hợp lệ. Vui lòng cung cấp số điện thoại Việt Nam hợp lệ (ví dụ: 0987654321)." });
    }
    const cleanPhone = customerPhone.replace(/\s+/g, '');

    if (!items || items.length === 0) {
      return JSON.stringify({ success: false, reason: "Giỏ hàng trống. Vui lòng chỉ định sản phẩm muốn mua." });
    }

    if (!shippingAddress || shippingAddress.trim() === '') {
      return JSON.stringify({ success: false, reason: "Địa chỉ giao hàng bị thiếu. Vui lòng cung cấp địa chỉ chi tiết." });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Verify stock and calculate total
    for (const item of items) {
      const product = await Product.findOne({ name: { $regex: new RegExp(`^${item.productName}$`, 'i') } });
      if (!product || !product.isActive) {
        return JSON.stringify({ success: false, reason: `Sản phẩm '${item.productName}' không tồn tại hoặc đã ngừng bán.` });
      }
      if (product.stock < item.quantity) {
        return JSON.stringify({ success: false, reason: `Sản phẩm '${product.name}' chỉ còn ${product.stock} sản phẩm trong kho. Không đủ số lượng bạn yêu cầu.` });
      }

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        name: product.name
      });
      totalAmount += product.price * item.quantity;
    }

    // Generate unique order code (Number) for PayOS
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));

    const newOrder = new Order({
      customerName,
      customerPhone: cleanPhone,
      shippingAddress,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod === 'payos' ? 'payos' : 'cod',
      orderCode
    });

    await newOrder.save();

    // Reduce stock
    for (const oItem of orderItems) {
      await Product.findByIdAndUpdate(oItem.productId, { $inc: { stock: -oItem.quantity } });
    }

    let paymentUrl = null;
    let paymentMessage = "Vui lòng thanh toán tiền mặt khi nhận hàng (COD).";

    if (paymentMethod === 'payos') {
      const { PayOS } = require("@payos/node");
      const payos = new PayOS({
        clientId: process.env.PAYOS_CLIENT_ID,
        apiKey: process.env.PAYOS_API_KEY,
        checksumKey: process.env.PAYOS_CHECKSUM_KEY
      });

      const body = {
        orderCode: orderCode,
        amount: totalAmount,
        description: `Thanh toan don hang chatbot`,
        items: orderItems.map(item => ({
          name: item.name.substring(0, 25), // PayOS name length limit
          quantity: item.quantity,
          price: item.priceAtPurchase
        })),
        returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/shop/checkout/success`,
        cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/shop/checkout/cancel`
      };

      try {
        const paymentLinkResponse = await payos.createPaymentLink(body);
        paymentUrl = paymentLinkResponse.checkoutUrl;
        paymentMessage = `Vui lòng click vào đường link sau để thanh toán trực tuyến: ${paymentUrl}`;
      } catch (payosError) {
        console.error("Lỗi tạo PayOS link via chatbot:", payosError);
        paymentMessage = "Đã xảy ra lỗi khi tạo link thanh toán online. Bạn vui lòng thanh toán COD khi nhận hàng nhé.";
        newOrder.paymentMethod = 'cod';
        await newOrder.save();
      }
    }

    const orderItemList = orderItems.map(i => `- ${i.quantity} x ${i.name} (Giá: ${i.priceAtPurchase})`).join("\n");

    return JSON.stringify({
      success: true,
      message: `Tạo đơn hàng thành công! Mã đơn: ${orderCode}\nChi tiết:\n${orderItemList}\nTổng tiền: ${totalAmount} VNĐ\nĐịa chỉ: ${shippingAddress}\n${paymentMessage}`
    });

  } catch (error) {
    console.error("Error in placeOrder tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi tạo đơn hàng: " + error.message });
  }
};


const generateBookingPaymentLink = async (args) => {
  try {
    const { bookingId } = args;
    const Booking = require('../models/booking.model');
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return JSON.stringify({ success: false, reason: "Không tìm thấy lịch hẹn. Vui lòng kiểm tra lại Mã lịch hẹn." });
    }

    if (booking.paymentStatus === "paid" || booking.amountPaid >= booking.totalPrice) {
      return JSON.stringify({ success: true, message: "Lịch hẹn này đã được thanh toán đủ. Bạn không cần thanh toán thêm." });
    }

    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
    booking.orderCode = orderCode;
    booking.paymentMethod = "bank_transfer";
    await booking.save();

    const amountToPay = booking.totalPrice - (booking.amountPaid || 0);

    const { PayOS } = require("@payos/node");
    const payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY
    });

    const body = {
      orderCode: orderCode,
      amount: amountToPay,
      description: `Thanh toan HD ${booking._id.toString().slice(-6).toUpperCase()}`,
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}`,
      cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}`
    };

    const paymentLinkRes = await payos.createPaymentLink(body);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentLinkRes.qrCode)}`;

    return JSON.stringify({
      success: true,
      message: `Tạo link thanh toán thành công!\n\nSố tiền cần thanh toán: ${amountToPay} VNĐ\nSố tài khoản: ${paymentLinkRes.accountNumber}\nTên tài khoản: ${paymentLinkRes.accountName}\nNội dung chuyển khoản: ${paymentLinkRes.description}\n\nẢnh QR:\n![QR Code](${qrCodeUrl})\n\nLink trực tiếp: ${paymentLinkRes.checkoutUrl}`
    });

  } catch (error) {
    console.error("Error in generateBookingPaymentLink tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi tạo link thanh toán: " + error.message });
  }
};

const checkBarberSchedule = async (args) => {
  try {
    const { barberName, date } = args;
    if (!date) {
      return JSON.stringify({ success: false, reason: "Ngày kiểm tra lịch là bắt buộc (định dạng YYYY-MM-DD)." });
    }

    let barberId = null;
    let foundBarberName = "Bất kỳ";

    if (barberName && barberName !== "Any" && barberName.toLowerCase() !== "bất kỳ") {
      const users = await User.find({ role: 'barber', status: 'active' });
      const foundUser = users.find(u => u.name && (
        u.name.toLowerCase().includes(barberName.toLowerCase()) || 
        barberName.toLowerCase().includes(u.name.toLowerCase())
      ));
      
      if (foundUser) {
        const foundBarber = await Barber.findOne({ userId: foundUser._id });
        if (!foundBarber) {
          return JSON.stringify({ success: false, reason: `Thợ ${foundUser.name} hiện chưa có hồ sơ trên hệ thống nên chưa có lịch làm việc.` });
        }
        if (!foundBarber.isAvailable) {
          return JSON.stringify({ success: false, reason: `Thợ ${foundUser.name} hiện đang tạm ngừng nhận khách.` });
        }
        barberId = foundBarber._id;
        foundBarberName = foundUser.name;
      } else {
        return JSON.stringify({ success: false, reason: `Không tìm thấy thợ tên ${barberName}.` });
      }
    } else {
      return JSON.stringify({ success: false, reason: "Vui lòng cung cấp tên thợ cụ thể để kiểm tra lịch." });
    }

    const BarberSchedule = require('../models/barber-schedule.model');
    const BarberAbsence = require('../models/barber-absence.model');
    const Service = require('../models/service.model');

    const dateObj = new Date(`${date}T00:00:00.000Z`);
    const isAbsent = await BarberAbsence.isBarberAbsent(barberId, dateObj);
    if (isAbsent) {
      return JSON.stringify({ success: true, message: `Thợ ${foundBarberName} không làm việc vào ngày ${date}. Lý do: Thợ đã xin nghỉ.` });
    }

    let durationMinutes = 30; // Mặc định nếu không cung cấp dịch vụ
    if (args.serviceNames) {
      const serviceNameList = args.serviceNames.split(',').map(s => s.trim());
      // Tìm các dịch vụ khớp tên để lấy thời gian
      const services = await Service.find({ name: { $in: serviceNameList.map(name => new RegExp(name, 'i')) } });
      if (services && services.length > 0) {
        durationMinutes = services.reduce((total, s) => total + s.durationMinutes, 0);
      }
    }

    const scheduleResult = await BarberSchedule.generateAvailableStartTimes(barberId, date, durationMinutes);

    if (!scheduleResult.available || !scheduleResult.slots || scheduleResult.slots.length === 0) {
      return JSON.stringify({ success: true, message: `Thợ ${foundBarberName} không có khung giờ nào trống liên tục đủ ${durationMinutes} phút vào ngày ${date}.` });
    }

    const availableTimeSlots = scheduleResult.slots.map(s => s.startTime);

    return JSON.stringify({
      success: true,
      barberName: foundBarberName,
      date: date,
      durationMinutes: durationMinutes,
      availableTimeSlots: availableTimeSlots,
      message: `Để thực hiện các dịch vụ trong khoảng ${durationMinutes} phút, thợ ${foundBarberName} có thể BẮT ĐẦU làm vào các khung giờ: ${availableTimeSlots.join(', ')}`
    });
  } catch (error) {
    console.error("Error in checkBarberSchedule tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi kiểm tra lịch: " + error.message });
  }
};

const tools = {
  getShopServices,
  getShopProducts,
  getAvailableBarbers,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
  lookupAppointments,
  placeOrder,
  generateBookingPaymentLink,
  checkBarberSchedule
};

// Define tool specifications for Gemini
const geminiTools = [{
  functionDeclarations: [
    {
      name: "getShopServices",
      description: "Lấy danh sách các dịch vụ hiện có tại Hallo BarberShop, bao gồm tên dịch vụ, giá tiền, mô tả và thời gian thực hiện.",
      parameters: {
        type: "OBJECT",
        properties: {},
      },
    },
    {
      name: "getAvailableBarbers",
      description: "Lấy danh sách các thợ cắt tóc đang có sẵn tại Hallo BarberShop, bao gồm tên, chuyên môn, kinh nghiệm và đánh giá.",
      parameters: {
        type: "OBJECT",
        properties: {},
      },
    },
    {
      name: "checkBarberSchedule",
      description: "Kiểm tra lịch làm việc và các khung giờ trống của một thợ cụ thể vào một ngày cụ thể. Dùng khi khách hỏi 'Thợ A có rảnh vào thứ X không?' hoặc 'Thợ B ngày mai mấy giờ trống?'",
      parameters: {
        type: "OBJECT",
        properties: {
          barberName: { type: "STRING", description: "Tên thợ cần kiểm tra lịch (bắt buộc)" },
          date: { type: "STRING", description: "Ngày cần kiểm tra định dạng YYYY-MM-DD (bắt buộc)" },
          serviceNames: { type: "STRING", description: "Tên các dịch vụ khách hàng muốn làm, phân tách bằng dấu phẩy (nếu có) để tính toán chuẩn thời gian trống" }
        },
        required: ["barberName", "date"]
      }
    },
    {
      name: "bookAppointment",
      description: "Tiến hành đặt lịch hẹn cho khách hàng vào hệ thống sau khi đã thu thập đủ thông tin (tên, sđt, dịch vụ, ngày, giờ, thợ).",
      parameters: {
        type: "OBJECT",
        properties: {
          customerName: { type: "STRING", description: "Tên khách hàng" },
          customerPhone: { type: "STRING", description: "Số điện thoại của khách hàng" },
          serviceNames: { type: "ARRAY", items: { type: "STRING" }, description: "Mảng chứa tên các dịch vụ khách hàng muốn đặt (phải khớp với tên dịch vụ thật từ getShopServices)" },
          barberName: { type: "STRING", description: "Tên thợ cắt tóc khách hàng yêu cầu, nếu không yêu cầu thì điền 'Any'" },
          bookingDate: { type: "STRING", description: "Ngày đặt lịch định dạng YYYY-MM-DD" },
          startTime: { type: "STRING", description: "Giờ bắt đầu định dạng HH:mm" }
        },
        required: ["customerName", "customerPhone", "serviceNames", "barberName", "bookingDate", "startTime"]
      }
    },
    {
      name: "updateAppointment",
      description: "Sử dụng để CẬP NHẬT hoặc THAY ĐỔI thông tin một lịch hẹn đã đặt thành công trước đó (đổi ngày, giờ, thợ, dịch vụ, sđt).",
      parameters: {
        type: "OBJECT",
        properties: {
          bookingId: { type: "STRING", description: "ID của lịch hẹn cần cập nhật (bạn nhận được ID này từ kết quả của bookAppointment)" },
          customerName: { type: "STRING", description: "Tên khách hàng" },
          customerPhone: { type: "STRING", description: "Số điện thoại của khách hàng" },
          serviceNames: { type: "ARRAY", items: { type: "STRING" }, description: "Mảng chứa tên các dịch vụ" },
          barberName: { type: "STRING", description: "Tên thợ cắt tóc khách hàng yêu cầu" },
          bookingDate: { type: "STRING", description: "Ngày đặt lịch định dạng YYYY-MM-DD" },
          startTime: { type: "STRING", description: "Giờ bắt đầu định dạng HH:mm" }
        },
        required: ["bookingId", "customerName", "customerPhone", "serviceNames", "barberName", "bookingDate", "startTime"]
      }
    },
    {
      name: "cancelAppointment",
      description: "Hủy lịch hẹn đã đặt trước đó dựa trên số điện thoại của khách hàng.",
      parameters: {
        type: "OBJECT",
        properties: {
          customerPhone: { type: "STRING", description: "Số điện thoại của khách hàng đã dùng để đặt lịch (bắt buộc)" }
        },
        required: ["customerPhone"]
      }
    },
    {
      name: "lookupAppointments",
      description: "Tra cứu danh sách các lịch hẹn sắp tới của khách hàng thông qua số điện thoại.",
      parameters: {
        type: "OBJECT",
        properties: {
          customerPhone: { type: "STRING", description: "Số điện thoại của khách hàng (bắt buộc)" }
        },
        required: ["customerPhone"]
      }
    },
    {
      name: "getShopProducts",
      description: "Lấy danh sách các sản phẩm đang được bán tại Hallo BarberShop, bao gồm tên sản phẩm, thương hiệu, giá tiền và số lượng tồn kho.",
      parameters: {
        type: "OBJECT",
        properties: {},
      },
    },
    {
      name: "placeOrder",
      description: "Tạo đơn đặt hàng mua sản phẩm từ shop cho khách hàng. Chỉ dùng khi khách hàng chốt muốn mua sản phẩm cụ thể.",
      parameters: {
        type: "OBJECT",
        properties: {
          customerName: { type: "STRING", description: "Tên người nhận (bắt buộc)" },
          customerPhone: { type: "STRING", description: "Số điện thoại nhận hàng hợp lệ (bắt buộc)" },
          shippingAddress: { type: "STRING", description: "Địa chỉ nhận hàng (bắt buộc)" },
          paymentMethod: { type: "STRING", description: "Phương thức thanh toán: 'cod' hoặc 'payos' (bắt buộc)" },
          items: {
            type: "ARRAY",
            description: "Danh sách sản phẩm muốn mua",
            items: {
              type: "OBJECT",
              properties: {
                productName: { type: "STRING", description: "Tên chính xác của sản phẩm theo list" },
                quantity: { type: "INTEGER", description: "Số lượng mua" }
              },
              required: ["productName", "quantity"]
            }
          }
        },
        required: ["customerName", "customerPhone", "shippingAddress", "paymentMethod", "items"]
      }
    },
    {
      name: "generateBookingPaymentLink",
      description: "Tạo link và ảnh mã QR thanh toán qua PayOS cho một lịch hẹn (để giữ chỗ).",
      parameters: {
        type: "OBJECT",
        properties: {
          bookingId: { type: "STRING", description: "Mã lịch hẹn cần thanh toán (bắt buộc)" }
        },
        required: ["bookingId"]
      }
    }
  ]
}];

const systemInstruction = `Bạn là nhân viên lễ tân tư vấn chuyên nghiệp, nhiệt tình của Hallo BarberShop. Ngày hiện tại của hệ thống là {{CURRENT_DATE}}.
Nhiệm vụ của bạn là hỗ trợ khách hàng thông tin về dịch vụ, thợ cắt tóc, sản phẩm bán lẻ (sáp, gôm...), tra cứu lịch, đặt lịch, hủy lịch và cập nhật lịch hẹn.

CÁC QUY TẮC QUAN TRỌNG:
1. LUÔN chào hỏi khách hàng thân thiện và xưng hô "mình" và "bạn" (hoặc anh/chị nếu phù hợp).
2. Khi khách hỏi về dịch vụ, hãy ưu tiên dùng tool 'getShopServices'. Khi khách hỏi về mặt hàng/sản phẩm, hãy dùng tool 'getShopProducts'.
3. Khi khách hỏi về thợ, hãy dùng tool 'getAvailableBarbers'. Nếu thợ khách yêu cầu đang bận hoặc không làm việc, HÃY tự động đề xuất: "Thợ [Tên thợ] hiện đang không nhận khách/bận. Mời bạn chọn thợ khác ở Menu bên dưới nhé."
4. KHI GỌI TOOL 'getShopServices' HOẶC 'getAvailableBarbers', TUYỆT ĐỐI KHÔNG ĐƯỢC GIẢI THÍCH HAY LIỆT KÊ TÊN DỊCH VỤ/THỢ BẰNG TEXT. CHỈ TRẢ LỜI ĐÚNG 1 CÂU: "Mời bạn ấn vào nút bên dưới để xem menu nhé".
5. Để ĐẶT LỊCH ('bookAppointment'), bạn CẦN thu thập ĐỦ 6 thông tin: Tên, SĐT hợp lệ, Tên dịch vụ, Tên thợ (nếu không có thì truyền "Any"), Ngày đặt (định dạng YYYY-MM-DD), Giờ đặt (HH:mm). SAU KHI ĐẶT LỊCH THÀNH CÔNG, HÃY LUÔN HỎI KHÁCH: "Bạn có muốn thanh toán trước (toàn bộ hóa đơn) để giữ chỗ chắc chắn không bị hủy nếu đến muộn quá 15 phút không?". Nếu khách đồng ý, gọi 'generateBookingPaymentLink'.
6. Để MUA HÀNG ('placeOrder'), bạn CẦN thu thập ĐỦ 4 thông tin: Tên, SĐT hợp lệ, Địa chỉ, Hình thức thanh toán (COD hoặc PayOS).
7. NẾU khách muốn THAY ĐỔI lịch hẹn đã đặt, BẮT BUỘC phải gọi tool 'lookupAppointments' (với SĐT) ĐẦU TIÊN để lấy 'Mã đặt lịch' (bookingId) và các thông tin cũ (ngày, giờ, dịch vụ). Sau khi có đủ thông tin cũ và mới, mới gọi 'updateAppointment'.
8. Nếu khách muốn HỦY LỊCH hoặc TRA CỨU LỊCH, hãy yêu cầu SĐT và gọi tool 'cancelAppointment' hoặc 'lookupAppointments'. (Nếu khách hỏi "Tôi đã thanh toán xong chưa?", hãy gọi 'lookupAppointments' và xem trường "Thanh toán" để trả lời số tiền còn thiếu hoặc đã đủ).
9. BẠN LÀ NHÂN VIÊN TƯ VẤN, KHÔNG PHẢI LẬP TRÌNH VIÊN. TUYỆT ĐỐI KHÔNG sinh ra JSON hay code trong câu trả lời. Đối với QR Code thanh toán, nếu được trả về định dạng Markdown Ảnh (![QR Code](url)), hãy TRÍCH DẪN Y HỆT NGUYÊN VĂN vào tin nhắn của bạn để hiển thị cho khách kèm các thông tin số tài khoản.
10. Giá tiền hãy format giá trị cho dễ đọc (ví dụ: 100000 -> 100.000 VNĐ).`;

exports.handleChat = async (message, history, imageBase64, mimeType) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in backend.");
  }

  // --- LUỒNG 2: Xử lý Ảnh (AI Hairstyle Advice) ---
  if (imageBase64 && mimeType) {
    return handleHairstyleAdvice(message, imageBase64, mimeType);
  }

  // --- LUỒNG 1: Xử lý Text thông thường (gemini-3.1-flash-lite) ---
  const currentDate = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).split('/').reverse().join('-'); // format: YYYY-MM-DD
  const dynamicSystemInstruction = systemInstruction.replace('{{CURRENT_DATE}}', currentDate);

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    systemInstruction: dynamicSystemInstruction,
    tools: geminiTools,
  });

  const formattedHistory = history ? history.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  })) : [];

  const chatSession = model.startChat({ history: formattedHistory });
  let response = await chatSession.sendMessage(message || "");

  // Xử lý Function Calling nếu có
  let functionCalls = response.response.functionCalls();
  let menuServices = null; // Biến tạm lưu danh sách dịch vụ nếu AI gọi getShopServices
  let menuBarbers = null; // Biến tạm lưu danh sách thợ nếu AI gọi getAvailableBarbers

  while (functionCalls && functionCalls.length > 0) {
    const functionResponses = await Promise.all(functionCalls.map(async (call) => {
      let functionResult = "";
      if (call.name === "getShopServices") {
        functionResult = await tools.getShopServices();
        try { menuServices = JSON.parse(functionResult); } catch (e) { console.error("Failed to parse getShopServices result:", e); }
      } else if (call.name === "getAvailableBarbers") {
        functionResult = await tools.getAvailableBarbers();
        try { menuBarbers = JSON.parse(functionResult); } catch (e) { console.error("Failed to parse getAvailableBarbers result:", e); }
      } else if (call.name === "bookAppointment") {
        functionResult = await tools.bookAppointment(call.args);
      } else if (call.name === "updateAppointment") {
        functionResult = await tools.updateAppointment(call.args);
      } else if (call.name === "checkBarberSchedule") {
        functionResult = await tools.checkBarberSchedule(call.args);
      } else if (call.name === "getShopProducts") {
        functionResult = await tools.getShopProducts();
      } else if (call.name === "placeOrder") {
        functionResult = await tools.placeOrder(call.args);
      } else if (call.name === "generateBookingPaymentLink") {
        functionResult = await tools.generateBookingPaymentLink(call.args);
      } else if (call.name === "lookupAppointments") {
        functionResult = await tools.lookupAppointments(call.args);
      } else if (call.name === "cancelAppointment") {
        functionResult = await tools.cancelAppointment(call.args);
      }

      // Tự động load Menu Thợ nếu các tool trên báo lỗi không tìm thấy thợ, hoặc thợ kín lịch/nghỉ/tạm ngừng/không có hồ sơ
      try {
        const parsedResult = JSON.parse(functionResult);
        const reason = parsedResult.reason || "";
        const message = parsedResult.message || "";
        const notFound = parsedResult.success === false && (
          reason.includes("Không tìm thấy thợ") || 
          reason.includes("tạm ngừng nhận khách") || 
          reason.includes("chưa có hồ sơ")
        );
        const notAvailable = parsedResult.success === true && (
          message.includes("không làm việc") || 
          message.includes("đã kín lịch") ||
          message.includes("tạm ngừng")
        );
        
        if (notFound || notAvailable) {
          const barbersRaw = await tools.getAvailableBarbers();
          menuBarbers = JSON.parse(barbersRaw);
        }
      } catch(e) {
        // Bỏ qua nếu parse lỗi
      }

      return {
        functionResponse: {
          name: call.name,
          response: { result: functionResult }
        }
      };
    }));

    response = await chatSession.sendMessage(functionResponses);
    functionCalls = response.response.functionCalls();
  }

  // Ưu tiên trả về Menu Barber nếu có thông tin thợ (do AI gọi tool), ngược lại nếu có dịch vụ thì trả về Menu Dịch vụ
  if (menuBarbers && menuBarbers.length > 0 && !menuBarbers.error) {
    return {
      isBarberMenu: true,
      text: response.response.text() || "Mời bạn chọn thợ ở Menu bên dưới nhé:",
      barbers: menuBarbers
    };
  } else if (menuServices && menuServices.length > 0 && !menuServices.error) {
    return {
      isMenu: true,
      text: response.response.text() || "Mời bạn chọn dịch vụ ở Menu bên dưới nhé:",
      services: menuServices
    };
  }

  return response.response.text();
};

const handleHairstyleAdvice = async (message, imageBase64, mimeType) => {

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    systemInstruction: aiAdvicePrompt,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: adviceSchema,
    }
  });

  const messageContent = [];
  if (message) {
    messageContent.push(message);
  } else {
    messageContent.push("Hãy tư vấn kiểu tóc cho tôi dựa trên bức ảnh này.");
  }

  messageContent.push({
    inlineData: {
      data: imageBase64,
      mimeType: mimeType
    }
  });

  const response = await model.generateContent(messageContent);
  const jsonText = response.response.text();

  let adviceData;
  try {
    adviceData = JSON.parse(jsonText);
  } catch (err) {
    console.error("Gemini JSON parse error:", err);
    throw new Error("Lỗi phân tích hình ảnh từ AI.");
  }

  // 1. Tạo Pollinations Image URL từ previewPrompt đầu tiên
  let previewImageUrl = null;
  if (adviceData.recommendedStyles && adviceData.recommendedStyles.length > 0) {
    const previewPrompt = adviceData.recommendedStyles[0].previewPrompt;
    if (previewPrompt) {
      const encodedPrompt = encodeURIComponent(previewPrompt);
      previewImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`;
    }
  }

  // 2. Query MongoDB để lấy thông tin dịch vụ
  let matchedServices = [];
  if (adviceData.suggestedServiceNames && adviceData.suggestedServiceNames.length > 0) {
    matchedServices = await Service.find({
      name: { $in: adviceData.suggestedServiceNames },
      isActive: true
    }).select('name price durationMinutes _id');
  }

  return {
    isAdvice: true,
    advice: adviceData,
    matchedServices: matchedServices,
    previewImageUrl: previewImageUrl,
    provider: {
      analysis: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      imagePreview: "pollinations"
    }
  };
};