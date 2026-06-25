const { GoogleGenerativeAI } = require('@google/generative-ai');
const Service = require('../models/service.model');
const Barber = require('../models/barber.model');
const Booking = require('../models/booking.model');
const bookingAvailabilityService = require('./bookingAvailability.service');
const { systemPrompt: aiAdvicePrompt, responseSchema: adviceSchema } = require('../utils/geminiSchema');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getShopServices = async () => {
  try {
    const services = await Service.find({ isActive: true }).select('name description price category durationMinutes -_id');
    return JSON.stringify(services);
  } catch (error) {
    return JSON.stringify({ error: "Failed to fetch services." });
  }
};

const getAvailableBarbers = async () => {
  try {
    const barbers = await Barber.find({ isAvailable: true })
      .populate('userId', 'fullName')
      .select('bio specialties experienceYears averageRating -_id');

    // Format cho dễ đọc
    const formatted = barbers.map(b => ({
      name: b.userId?.fullName || "Thợ cắt tóc",
      bio: b.bio,
      specialties: b.specialties,
      experienceYears: b.experienceYears,
      rating: b.averageRating
    }));
    return JSON.stringify(formatted);
  } catch (error) {
    return JSON.stringify({ error: "Failed to fetch barbers." });
  }
};

const bookAppointment = async (args) => {
  try {
    const { customerName, customerPhone, serviceNames, barberName, bookingDate, startTime } = args;

    if (!customerPhone || customerPhone.length < 9) {
      return JSON.stringify({ success: false, reason: "Số điện thoại không hợp lệ hoặc bị thiếu. Bạn PHẢI hỏi lại khách hàng số điện thoại chính xác." });
    }

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
      const barbers = await Barber.find({ isAvailable: true }).populate('userId');
      const foundBarber = barbers.find(b => b.userId && b.userId.fullName && b.userId.fullName.toLowerCase().includes(barberName.toLowerCase()));
      
      if (foundBarber) {
        barberId = foundBarber._id;
        assignedBarberName = foundBarber.userId.fullName;
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
          assignedBarberName = b.userId.fullName || "Thợ cắt tóc";
          foundAvailable = true;
          break;
        }
      }
      if (!foundAvailable) {
        return JSON.stringify({ success: false, reason: `Rất tiếc, tất cả thợ đều kín lịch vào lúc ${startTime} ngày ${bookingDate}. Vui lòng chọn giờ hoặc ngày khác.` });
      }
    }

    // 5. Tạo Booking
    const newBooking = new Booking({
      bookingType: "guest",
      customerName: customerName,
      customerPhone: customerPhone,
      barberId: barberId,
      services: serviceIds,
      bookingDate: requestedDateTime,
      durationMinutes: totalDuration,
      status: "pending",
    });

    await newBooking.save();

    return JSON.stringify({ 
      success: true, 
      message: "Đặt lịch thành công", 
      bookingDetails: {
        bookingId: newBooking._id,
        customerName,
        customerPhone,
        serviceNames: services.map(s => s.name),
        barberName: assignedBarberName,
        time: `${startTime} ngày ${bookingDate}`
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

    if (!customerPhone || customerPhone.length < 9) {
      return JSON.stringify({ success: false, reason: "Số điện thoại không hợp lệ hoặc bị thiếu." });
    }

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
      const barbers = await Barber.find({ isAvailable: true }).populate('userId');
      const foundBarber = barbers.find(b => b.userId && b.userId.fullName && b.userId.fullName.toLowerCase().includes(barberName.toLowerCase()));
      
      if (foundBarber) {
        barberId = foundBarber._id;
        assignedBarberName = foundBarber.userId.fullName;
      } else {
        return JSON.stringify({ success: false, reason: `Không tìm thấy thợ tên ${barberName}.` });
      }
    }

    // 4. Cập nhật DB
    existingBooking.customerName = customerName;
    existingBooking.customerPhone = customerPhone;
    existingBooking.barberId = barberId;
    existingBooking.services = serviceIds;
    existingBooking.bookingDate = requestedDateTime;
    existingBooking.durationMinutes = totalDuration;
    
    await existingBooking.save();

    return JSON.stringify({ 
      success: true, 
      message: "Cập nhật lịch thành công", 
      bookingDetails: {
        bookingId: existingBooking._id,
        customerName,
        customerPhone,
        serviceNames: services.map(s => s.name),
        barberName: assignedBarberName,
        time: `${startTime} ngày ${bookingDate}`
      }
    });

  } catch (error) {
    console.error("Error in updateAppointment tool:", error);
    return JSON.stringify({ success: false, reason: "Lỗi hệ thống khi cập nhật: " + error.message });
  }
};

const tools = {
  getShopServices,
  getAvailableBarbers,
  bookAppointment,
  updateAppointment
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
    }
  ]
}];

const systemInstruction = `Bạn là một trợ lý ảo tư vấn khách hàng và Booking Agent cho Hallo BarberShop.
Nhiệm vụ của bạn là tư vấn nhiệt tình, thân thiện, và giúp khách hàng CHỐT ĐẶT LỊCH.
Quy trình hoạt động:
1. Mỗi khi người dùng hỏi về dịch vụ hoặc thợ, HÃY SỬ DỤNG FUNCTION CALLING (getShopServices hoặc getAvailableBarbers) ĐỂ LẤY THÔNG TIN. KHÔNG tự bịa data. Hệ thống sẽ tự động hiển thị Menu tương tác cho khách hàng dựa trên kết quả.
2. Sau khi khách hàng chọn xong từ Menu và gửi lại danh sách dịch vụ, hãy tính TỔNG TIỀN dựa vào bảng giá và báo cho khách.
3. Khi khách hàng có ý định đặt lịch, chủ động hỏi các thông tin còn thiếu một cách tự nhiên: Tên, Số điện thoại, Ngày, Giờ, và Thợ cắt. Ngày hiện tại: ${new Date().toISOString().split('T')[0]}.
4. CHỈ KHI thu thập đủ thông tin: Gọi tool 'bookAppointment' để lưu vào hệ thống. BẠN TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ BỊA SỐ ĐIỆN THOẠI HAY BẤT CỨ THÔNG TIN NÀO. Nếu khách chưa cung cấp số điện thoại, BẮT BUỘC PHẢI HỎI LẠI khách hàng.
5. Nếu khách hàng muốn ĐẶT LỊCH CHO NHIỀU NGƯỜI CÙNG LÚC (ví dụ: cho bản thân và bạn bè), bạn PHẢI gọi công cụ 'bookAppointment' NHIỀU LẦN (mỗi người 1 lần gọi riêng biệt).
6. Nếu khách hàng muốn THAY ĐỔI thông tin lịch hẹn ĐÃ ĐẶT (đổi giờ, đổi ngày, đổi sđt...), hãy dùng công cụ 'updateAppointment' thay vì tạo mới.
7. Sau khi gọi tool 'bookAppointment' hoặc 'updateAppointment', báo kết quả thành công hoặc gợi ý đổi giờ nếu trùng lịch.
Giá tiền hãy format giá trị cho dễ đọc (ví dụ: 100000 -> 100.000 VNĐ).`;

exports.handleChat = async (message, history, imageBase64, mimeType) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in backend.");
  }

  // --- LUỒNG 2: Xử lý Ảnh (AI Hairstyle Advice) ---
  if (imageBase64 && mimeType) {
    return handleHairstyleAdvice(message, imageBase64, mimeType);
  }

  // --- LUỒNG 1: Xử lý Text thông thường (gemini-3.1-flash-lite) ---
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    systemInstruction: systemInstruction,
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

  const messageLower = message ? message.toLowerCase() : "";
  
  // Fallback cho Dịch vụ
  if (!menuServices && (messageLower.includes("dịch vụ") || messageLower.includes("menu") || messageLower.includes("bảng giá") || messageLower.includes("làm tóc") || messageLower.includes("cắt tóc") || messageLower.includes("uốn") || messageLower.includes("nhuộm"))) {
    try {
      const rawServices = await tools.getShopServices();
      menuServices = JSON.parse(rawServices);
    } catch (e) {
      console.error("Fallback getShopServices failed:", e);
    }
  }

  // Fallback cho Thợ
  if (!menuBarbers && (messageLower.includes("thợ") || messageLower.includes("barber") || messageLower.includes("người cắt") || messageLower.includes("ai cắt"))) {
    try {
      const rawBarbers = await tools.getAvailableBarbers();
      menuBarbers = JSON.parse(rawBarbers);
    } catch (e) {
      console.error("Fallback getAvailableBarbers failed:", e);
    }
  }
  
  // Ưu tiên trả về Menu Barber nếu có thông tin thợ, ngược lại nếu có dịch vụ thì trả về Menu Dịch vụ
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
  // TODO: Chuyển lại thành "gemini-2.5-flash" khi server hết lỗi 503 (quá tải)
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