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

    // 1. Lấy thông tin dịch vụ
    const services = await Service.find({ name: { $in: serviceNames }, isActive: true });
    if (!services || services.length === 0) {
      return JSON.stringify({ success: false, reason: "Không tìm thấy dịch vụ nào khớp với yêu cầu." });
    }
    const serviceIds = services.map(s => s._id);
    const totalDuration = services.reduce((acc, curr) => acc + (curr.durationMinutes || 30), 0);

    // 2. Format thời gian (Giả sử múi giờ VN +07:00)
    const requestedDateTime = new Date(`${bookingDate}T${startTime}:00+07:00`);

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

const tools = {
  getShopServices,
  getAvailableBarbers,
  bookAppointment
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
    }
  ]
}];

const systemInstruction = `Bạn là một trợ lý ảo tư vấn khách hàng và Booking Agent cho Hallo BarberShop.
Nhiệm vụ của bạn là tư vấn nhiệt tình, thân thiện, và giúp khách hàng CHỐT ĐẶT LỊCH.
Quy trình hoạt động:
1. Mỗi khi người dùng hỏi về dịch vụ hoặc thợ, HÃY SỬ DỤNG FUNCTION CALLING (getShopServices hoặc getAvailableBarbers) ĐỂ LẤY THÔNG TIN. KHÔNG tự bịa data.
2. Khi khách hàng có ý định đặt lịch, AI cần chủ động hỏi các thông tin còn thiếu một cách tự nhiên (đừng hỏi một lượt như cái máy): Tên, Số điện thoại, Dịch vụ muốn làm, Ngày, Giờ, và Thợ cắt (có yêu cầu thợ nào không hay tự sắp xếp). Ngày hiện tại (tham khảo): ${new Date().toISOString().split('T')[0]}.
3. CHỈ KHI thu thập đủ thông tin: Gọi tool 'bookAppointment' để lưu vào hệ thống. KHÔNG tự bịa số điện thoại hoặc tên.
4. Sau khi gọi tool 'bookAppointment', đọc kết quả (success hay failed). Nếu thành công, chúc mừng khách. Nếu thất bại (trùng lịch), thông báo lý do và gợi ý khách đổi giờ khác.
Giá tiền trả về từ database là VNĐ, hãy format giá trị cho dễ đọc (ví dụ: 100000 -> 100.000 VNĐ).`;

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
    model: "gemini-3.1-flash-lite",
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
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    let functionResult = "";
    if (call.name === "getShopServices") {
      functionResult = await tools.getShopServices();
    } else if (call.name === "getAvailableBarbers") {
      functionResult = await tools.getAvailableBarbers();
    } else if (call.name === "bookAppointment") {
      functionResult = await tools.bookAppointment(call.args);
    }

    response = await chatSession.sendMessage([{
      functionResponse: {
        name: call.name,
        response: { result: functionResult }
      }
    }]);
  }

  return response.response.text();
};

const handleHairstyleAdvice = async (message, imageBase64, mimeType) => {
  // TODO: Chuyển lại thành "gemini-2.5-flash" khi server hết lỗi 503 (quá tải)
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
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
      analysis: "gemini-2.5-flash",
      imagePreview: "pollinations"
    }
  };
};
