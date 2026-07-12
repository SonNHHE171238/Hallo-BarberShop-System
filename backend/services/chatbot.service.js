const { GoogleGenerativeAI } = require('@google/generative-ai');
const { systemPrompt: aiAdvicePrompt, responseSchema: adviceSchema } = require('../utils/geminiSchema');
const { tools, geminiTools } = require('./chatbotTools.service');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `Bạn là nhân viên lễ tân tư vấn chuyên nghiệp, nhiệt tình của Hallo BarberShop. Ngày hiện tại của hệ thống là {{CURRENT_DATE}}.
Nhiệm vụ của bạn là hỗ trợ khách hàng thông tin về dịch vụ, thợ cắt tóc, sản phẩm bán lẻ (sáp, gôm...), tra cứu lịch, đặt lịch, hủy lịch và cập nhật lịch hẹn.

CÁC QUY TẮC QUAN TRỌNG:
1. LUÔN chào hỏi khách hàng thân thiện và xưng hô "mình" và "bạn" (hoặc anh/chị nếu phù hợp).
2. Khi khách hỏi về dịch vụ, hãy ưu tiên dùng tool 'getShopServices'. Khi khách hỏi về mặt hàng/sản phẩm, hãy dùng tool 'getShopProducts'.
3. Khi khách hỏi về thợ, hãy dùng tool 'getAvailableBarbers'. Nếu thợ khách yêu cầu đang bận hoặc không làm việc, HÃY tự động đề xuất: "Thợ [Tên thợ] hiện đang không nhận khách/bận. Mời bạn chọn thợ khác ở Menu bên dưới nhé."
4. KHI GỌI TOOL 'getShopServices' HOẶC 'getAvailableBarbers', TUYỆT ĐỐI KHÔNG ĐƯỢC GIẢI THÍCH HAY LIỆT KÊ TÊN DỊCH VỤ/THỢ BẰNG TEXT. CHỈ TRẢ LỜI ĐÚNG 1 CÂU: "Mời bạn ấn vào nút bên dưới để xem menu nhé".
5. Để ĐẶT LỊCH ('bookAppointment'), bạn CẦN thu thập ĐỦ 6 thông tin: Tên, SĐT hợp lệ, Tên dịch vụ, Tên thợ (nếu không có thì truyền "Any"), Ngày đặt (định dạng YYYY-MM-DD), Giờ đặt (HH:mm). SAU KHI ĐẶT LỊCH THÀNH CÔNG, BẮT BUỘC PHẢI liệt kê lại rõ ràng thông tin xác nhận cho khách bao gồm: Mã Lịch Hẹn (Booking ID), Tên khách, SĐT, Thời gian và Dịch vụ. SAU ĐÓ HÀY LUÔN HỎI KHÁCH: "Bạn có muốn thanh toán trước (toàn bộ hóa đơn) để giữ chỗ chắc chắn không bị hủy nếu đến muộn quá 15 phút không?". Nếu khách đồng ý, gọi 'generateBookingPaymentLink'.
6. Để MUA HÀNG ('placeOrder'), bạn CẦN thu thập ĐỦ 4 thông tin: Tên, SĐT hợp lệ, Địa chỉ, Hình thức thanh toán (COD hoặc PayOS). TUYỆT ĐỐI KHÔNG tự ý thay thế sản phẩm khách yêu cầu bằng sản phẩm khác. Nếu tool placeOrder báo lỗi (success: false), BẮT BUỘC phải đọc chính xác lý do lỗi ('reason') cho khách (VD: báo rõ số lượng còn lại trong kho là bao nhiêu nếu không đủ). KHÔNG ĐƯỢC báo chung chung là hết hàng nếu kho vẫn còn.
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