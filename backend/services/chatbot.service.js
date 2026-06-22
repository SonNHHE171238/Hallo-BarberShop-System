const { GoogleGenerativeAI } = require('@google/generative-ai');
const Service = require('../models/service.model');
const Barber = require('../models/barber.model');

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

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: systemInstruction,
    tools: geminiTools,
  });

  // Convert history format if needed (e.g., from { role: 'user', content: '...' } to Gemini's { role: 'user', parts: [{ text: '...' }] })
  const formattedHistory = history ? history.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  })) : [];

  const chatSession = model.startChat({
    history: formattedHistory,
  });

  let messageContent = [];
  if (message) {
    messageContent.push(message);
  }
  if (imageBase64 && mimeType) {
    messageContent.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    });
  }

  let response = await chatSession.sendMessage(messageContent);

  // Xử lý Function Calling nếu có
  let functionCalls = response.response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0]; // Assuming only one call for simplicity

    let functionResult = "";
    if (call.name === "getShopServices") {
      functionResult = await tools.getShopServices();
    } else if (call.name === "getAvailableBarbers") {
      functionResult = await tools.getAvailableBarbers();
    }

    // Gửi kết quả function call lại cho Gemini
    response = await chatSession.sendMessage([{
      functionResponse: {
        name: call.name,
        response: { result: functionResult }
      }
    }]);
  }

  return response.response.text();
};
