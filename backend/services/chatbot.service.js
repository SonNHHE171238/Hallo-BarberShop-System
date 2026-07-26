const { GoogleGenerativeAI } = require('@google/generative-ai');
const { systemPrompt: aiAdvicePrompt, responseSchema: adviceSchema } = require('../utils/geminiSchema');
const { tools, geminiTools } = require('./chatbotTools.service');
const Service = require('../models/service.model');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `Bạn là nhân viên lễ tân tư vấn chuyên nghiệp, nhiệt tình của Hallo BarberShop. Ngày hiện tại của hệ thống là {{CURRENT_DATE}}.
Nhiệm vụ của bạn là hỗ trợ khách hàng thông tin về dịch vụ, thợ cắt tóc, sản phẩm bán lẻ (sáp, gôm...), tra cứu lịch, đặt lịch, hủy lịch và cập nhật lịch hẹn.

CÁC QUY TẮC QUAN TRỌNG:
1. LUÔN chào hỏi khách hàng thân thiện và xưng hô "mình" và "bạn" (hoặc anh/chị nếu phù hợp).
2. Khi khách hỏi về dịch vụ, hãy ưu tiên dùng tool 'getShopServices'. Khi khách hỏi về mặt hàng/sản phẩm, hãy dùng tool 'getShopProducts'.
3. Khi khách hỏi về thợ, hãy dùng tool 'getAvailableBarbers'. Nếu thợ khách yêu cầu đang bận hoặc không làm việc, HÃY tự động đề xuất: "Thợ [Tên thợ] hiện đang không nhận khách/bận. Mời bạn chọn thợ khác ở Menu bên dưới nhé."
4. KHI GỌI TOOL 'getShopServices' HOẶC 'getAvailableBarbers', TUYỆT ĐỐI KHÔNG ĐƯỢC GIẢI THÍCH HAY LIỆT KÊ TÊN DỊCH VỤ/THỢ BẰNG TEXT. CHỈ TRẢ LỜI ĐÚNG 1 CÂU: "Mời bạn ấn vào nút bên dưới để xem menu nhé".
5. Để ĐẶT LỊCH ('bookAppointment'), bạn CẦN thu thập ĐỦ 6 thông tin: Tên, SĐT hợp lệ, Tên dịch vụ, Tên thợ (nếu không có thì truyền "Any"), Ngày đặt (định dạng YYYY-MM-DD), Giờ đặt (HH:mm). SAU KHI ĐẶT LỊCH THÀNH CÔNG, BẮT BUỘC PHẢI liệt kê lại rõ ràng thông tin xác nhận cho khách bao gồm: Mã Lịch Hẹn (Booking ID), Tên khách, SĐT, Thời gian và Dịch vụ. SAU ĐÓ HÀY LUÔN HỎI KHÁCH: "Bạn có muốn thanh toán trước (toàn bộ hóa đơn) để giữ chỗ chắc chắn không bị hủy nếu đến muộn quá 15 phút không?". Nếu khách đồng ý, gọi 'generateBookingPaymentLink'.
6. Để MUA HÀNG ('placeOrder'), bạn CẦN thu thập ĐỦ 5 thông tin: Tên, SĐT hợp lệ, Địa chỉ, Tên & Số lượng sản phẩm, Hình thức thanh toán (COD hoặc PayOS). TUYỆT ĐỐI KHÔNG tự ý thay thế sản phẩm. LƯU Ý QUAN TRỌNG: KHI ĐÃ ĐỦ THÔNG TIN, CHƯA ĐƯỢC GỌI TOOL 'placeOrder' NGAY. Bắt buộc phải lập 1 bảng tóm tắt (Form) bằng Markdown liệt kê rõ: Tên, SĐT, Địa chỉ, Sản phẩm, Số lượng, Hình thức thanh toán. Cuối bảng, phải hỏi: 'Bạn có xác nhận chốt đơn hàng với các thông tin trên không?'. CHỈ KHI KHÁCH HÀNG CHAT XÁC NHẬN (Ok, Đồng ý, Chốt...), bạn mới được gọi tool 'placeOrder'. Nếu tool báo lỗi, BẮT BUỘC phải đọc lý do lỗi cho khách.
7. NẾU khách muốn THAY ĐỔI lịch hẹn đã đặt, BẮT BUỘC phải gọi tool 'lookupAppointments' (với SĐT) ĐẦU TIÊN để lấy 'Mã đặt lịch' (bookingId) và các thông tin cũ (ngày, giờ, dịch vụ). Sau khi có đủ thông tin cũ và mới, mới gọi 'updateAppointment'.
8. Nếu khách muốn HỦY LỊCH hoặc TRA CỨU LỊCH, hãy yêu cầu SĐT và gọi tool 'cancelAppointment' hoặc 'lookupAppointments'. (Nếu khách hỏi "Tôi đã thanh toán xong chưa?", hãy gọi 'lookupAppointments' và xem trường "Thanh toán" để trả lời số tiền còn thiếu hoặc đã đủ).
9. BẠN LÀ NHÂN VIÊN TƯ VẤN, KHÔNG PHẢI LẬP TRÌNH VIÊN. TUYỆT ĐỐI KHÔNG sinh ra JSON hay code trong câu trả lời. Đối với QR Code thanh toán, nếu được trả về định dạng Markdown Ảnh (![QR Code](url)), hãy TRÍCH DẪN Y HỆT NGUYÊN VĂN vào tin nhắn của bạn để hiển thị cho khách kèm các thông tin số tài khoản.
10. Giá tiền hãy format giá trị cho dễ đọc (ví dụ: 100000 -> 100.000 VNĐ).
11. BẮT BUỘC phải gọi tool 'getShopProducts' để kiểm tra xem sản phẩm có tồn tại hay không TRƯỚC KHI trả lời khách hàng (không được tự ý phán đoán). NẾU tool trả về kết quả thành công:
  - Nếu có DƯỚI 5 sản phẩm: Bạn ĐƯỢC PHÉP liệt kê danh sách sản phẩm đó bằng text, NHƯNG BẮT BUỘC phải trình bày dưới dạng danh sách (bullet points) rõ ràng từng dòng để khách dễ đọc (VD: - **Tên sản phẩm** (Giá tiền)).
  - Nếu có TỪ 5 sản phẩm TRỞ LÊN: TUYỆT ĐỐI KHÔNG liệt kê bằng text, chỉ trả lời 1 câu duy nhất: "Mời bạn ấn vào nút bên dưới để xem danh sách toàn bộ các sản phẩm nhé!".
12. Chatbot CHƯA HỖ TRỢ sửa hoặc hủy ĐƠN HÀNG MUA SẢN PHẨM (chỉ hỗ trợ sửa/hủy LỊCH HẸN CẮT TÓC). Nếu khách muốn đổi thông tin đơn hàng, hãy báo khách liên hệ Hotline. Để tra cứu đơn hàng, dùng tool 'lookupOrders'.
13. Nếu khách hàng cung cấp thông tin mâu thuẫn (VD: 2 số điện thoại, 2 địa chỉ), BẮT BUỘC phải hỏi lại khách để chốt 1 thông tin duy nhất, KHÔNG ĐƯỢC tự ý gộp chung thông tin.
14. Sau khi cung cấp mã QR thanh toán (bằng PayOS), HÀY nhắc khách hàng: 'Sau khi thanh toán xong, bạn vui lòng báo lại cho mình biết để mình kiểm tra nhé!'. Nếu khách hàng thông báo đã chuyển khoản xong, BẮT BUỘC phải gọi tool 'checkPaymentStatus' với mã giao dịch (orderCode) tương ứng để kiểm tra trạng thái và báo kết quả lại cho khách.`;

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

  const formattedHistory = history ? history.map(msg => {
    let textContent = msg.content || msg.text || "";
    if (typeof textContent === 'object') {
      try { textContent = JSON.stringify(textContent); } catch (e) { textContent = ""; }
    }
    return {
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: String(textContent) }]
    };
  }) : [];

  const chatSession = model.startChat({ history: formattedHistory });
  let response = await chatSession.sendMessage(message || "");

  // Xử lý Function Calling nếu có
  let functionCalls = response.response.functionCalls();
  let menuServices = null; // Biến tạm lưu danh sách dịch vụ nếu AI gọi getShopServices
  let menuBarbers = null; // Biến tạm lưu danh sách thợ nếu AI gọi getAvailableBarbers
  let menuProducts = null; // Biến tạm lưu danh sách sản phẩm gợi ý
  let productQueryText = "";
  let isProductFound = false;

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
        functionResult = await tools.getShopProducts(call.args);
        try {
          const parsed = JSON.parse(functionResult);
          if (parsed.success === false && parsed.similarProducts && parsed.similarProducts.length > 0) {
            menuProducts = parsed.similarProducts;
            productQueryText = call.args.searchQuery || "";
            isProductFound = false;
          } else if (parsed.success === true && parsed.products && parsed.products.length > 0) {
            menuProducts = parsed.products;
            productQueryText = call.args.searchQuery || "";
            isProductFound = true;
          }
        } catch (e) { console.error("Failed to parse getShopProducts result:", e); }
      } else if (call.name === "placeOrder") {
        functionResult = await tools.placeOrder(call.args);
      } else if (call.name === "generateBookingPaymentLink") {
        functionResult = await tools.generateBookingPaymentLink(call.args);
      } else if (call.name === "lookupAppointments") {
        functionResult = await tools.lookupAppointments(call.args);
      } else if (call.name === "cancelAppointment") {
        functionResult = await tools.cancelAppointment(call.args);
      } else if (call.name === "lookupOrders") {
        functionResult = await tools.lookupOrders(call.args);
      } else if (call.name === "checkPaymentStatus") {
        functionResult = await tools.checkPaymentStatus(call.args);
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

  // Helper để lấy text an toàn, tránh lỗi khi model không trả về text
  const safeGetText = () => {
    try {
      if (response && response.response && typeof response.response.text === 'function') {
        return response.response.text();
      }
      return "";
    } catch (error) {
      return "";
    }
  };

  // Ưu tiên trả về Menu Barber nếu có thông tin thợ (do AI gọi tool), ngược lại nếu có dịch vụ thì trả về Menu Dịch vụ
  if (menuBarbers && menuBarbers.length > 0 && !menuBarbers.error) {
    return {
      isBarberMenu: true,
      text: safeGetText() || "Mời bạn chọn thợ ở Menu bên dưới nhé:",
      barbers: menuBarbers
    };
  } else if (menuServices && menuServices.length > 0 && !menuServices.error) {
    return {
      isMenu: true,
      text: safeGetText() || "Mời bạn chọn dịch vụ ở Menu bên dưới nhé:",
      services: menuServices
    };
  } else if (menuProducts && menuProducts.length > 0) {
    const defaultText = isProductFound
      ? "Mời bạn tham khảo danh sách sản phẩm ở Menu bên dưới nhé:"
      : `Bên mình hiện không có sản phẩm tên "${productQueryText}". Mời bạn tham khảo các sản phẩm tương tự ở danh sách bên dưới nhé:`;
      
    return {
      isProductMenu: true,
      text: safeGetText() || defaultText,
      products: menuProducts
    };
  }

  return safeGetText();
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

  // 1. Tạo ảnh từ Hairstyle Changer Pro trên RapidAPI
  let previewImageUrl = null;
  if (adviceData.recommendedStyles && adviceData.recommendedStyles.length > 0) {
    const hairType = adviceData.recommendedStyles[0].hair_type || 1; 

    try {
      // BƯỚC 1: CREATE TASK
      const createTaskResponse = await fetch(`https://${process.env.RAPIDAPI_HOST}/facebody/editing/hairstyle-pro`, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          task_type: 'async',
          image: `data:${mimeType};base64,${imageBase64}`,
          hair_style: hairType.toString()
        })
      });

      const taskData = await createTaskResponse.json();
      const taskId = taskData.task_id || (taskData.data && taskData.data.task_id);

      if (taskId) {
        // BƯỚC 2: POLLING kết quả
        let isDone = false;
        let attempts = 0;
        
        while (!isDone && attempts < 15) { // Thử tối đa 15 lần (~45 giây)
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 3000)); // Nghỉ 3 giây
          
          const resultResponse = await fetch(`https://${process.env.RAPIDAPI_HOST}/api/rapidapi/query-async-task-result?task_id=${taskId}`, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
              'x-rapidapi-host': process.env.RAPIDAPI_HOST,
              'Content-Type': 'application/json'
            }
          });
          
          const resultData = await resultResponse.json();
          // Kiểm tra trạng thái. Giả định status == 2 hoặc 'success' là thành công, 3 hoặc 'failed' là thất bại.
          if (resultData.task_status === 2 || resultData.task_status === 'success') {
             previewImageUrl = resultData.data?.image_url;
             isDone = true;
          } else if (resultData.task_status === 3 || resultData.task_status === 'failed') {
             console.error("API Hairstyle Changer báo lỗi xử lý ảnh.");
             isDone = true;
          }
        }
      } else {
        console.error("Không nhận được task_id từ RapidAPI:", taskData);
      }
    } catch (e) {
      console.error("Lỗi khi gọi RapidAPI Hairstyle Changer:", e);
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
      imagePreview: "Hairstyle Changer Pro"
    }
  };
};