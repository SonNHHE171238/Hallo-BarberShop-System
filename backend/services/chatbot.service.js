const { GoogleGenerativeAI } = require('@google/generative-ai');
const Service = require('../models/service.model');
const Barber = require('../models/barber.model');
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

const tools = {
  getShopServices,
  getAvailableBarbers
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
    }
  ]
}];

const systemInstruction = `Bạn là một trợ lý ảo tư vấn khách hàng cho Hallo BarberShop.
Nhiệm vụ của bạn là tư vấn nhiệt tình, thân thiện, trả lời ngắn gọn và chính xác về các dịch vụ và thợ cắt tóc của cửa hàng.
Hỏi người dùng cần tư vấn gì, ví dụ: cắt tóc, uốn, nhuộm, v.v.
Mỗi khi người dùng hỏi về dịch vụ (giá cả, loại dịch vụ) hoặc thợ cắt tóc, HÃY SỬ DỤNG FUNCTION CALLING (getShopServices hoặc getAvailableBarbers) ĐỂ LẤY THÔNG TIN TỪ DATABASE.
Không được tự bịa ra dịch vụ hay tên thợ cắt tóc, luôn luôn dựa vào dữ liệu thực tế từ database.
Giá tiền trả về từ database là VNĐ, hãy format giá trị cho dễ đọc (ví dụ: 100000 -> 100.000 VNĐ).
Khi nhận được hình ảnh của khách hàng, hãy phân tích hình dáng khuôn mặt và chất tóc, sau đó đề xuất các kiểu tóc nam phù hợp nhất có thể cắt tại BarberShop.`;

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
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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
