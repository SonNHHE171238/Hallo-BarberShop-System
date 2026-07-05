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


module.exports = { tools, geminiTools };
