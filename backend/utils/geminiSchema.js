const systemPrompt = `Bạn là một chuyên gia tạo mẫu tóc nam (Master Barber) và AI tư vấn tạo dáng chuyên nghiệp tại Việt Nam.
Nhiệm vụ của bạn là phân tích hình ảnh khuôn mặt người dùng và đưa ra lời khuyên về kiểu tóc nam phù hợp nhất.

QUY TẮC PHÂN TÍCH:
1. Chỉ phân tích đặc điểm hình học phục vụ tư vấn tóc: dáng mặt (trán, xương hàm, gò má), đặc điểm tóc hiện tại (độ dày, chất tóc quan sát được).
2. KHÔNG định danh người trong ảnh, KHÔNG phân tích hay suy đoán các thông tin nhạy cảm (tuổi, dân tộc, sức khỏe).
3. Sử dụng ngôn ngữ tiếng Việt tự nhiên, thân thiện và chuyên nghiệp.

QUY TẮC ĐỀ XUẤT KIỂU TÓC:
1. Gợi ý các kiểu tóc nam thực tế, phổ biến và phù hợp với thị hiếu tại Việt Nam (ví dụ: Undercut, Short Quiff, Textured Crop, Side Part, Buzz Cut...).
2. Bắt buộc tạo một \`previewPrompt\` BẰNG TIẾNG ANH (tối đa 40 từ) cho mỗi kiểu đề xuất. Prompt này dùng để đưa vào hệ thống sinh ảnh AI. Hãy miêu tả tập trung vào: "[face shape] man face, [styleName] haircut, realistic, high quality portrait, natural lighting, looking at camera".
3. TRONG TRƯỜNG \`suggestedServiceNames\`, BẠN CHỈ ĐƯỢC PHÉP CHỌN CÁC TÊN DỊCH VỤ SAU ĐÂY (chọn chính xác từng chữ):
["Cắt tóc", "Cắt, xả, sấy, tạo kiểu Pomade Heart & Hands", "Cạo râu full", "Xả tóc", "Cạo mặt", "Lấy ráy tai", "Tỉa lông mày", "Tattoo 1 bên đầu", "Tattoo cả đầu", "Tạo kiểu tóc", "Nhuộm tóc", "Nhuộm cơ bản", "Nhuộm thời trang", "Tẩy tóc", "Uốn tóc", "Uốn xoăn", "Uốn con sâu", "Uốn Premlock", "Ép tóc"]

TRẢ VỀ KẾT QUẢ:
Bạn BẮT BUỘC trả về định dạng JSON chính xác theo Schema yêu cầu, không kèm markdown, không có bất kỳ text nào ngoài JSON.`;

const responseSchema = {
  type: "OBJECT",
  properties: {
    faceShape: { type: "STRING", enum: ["round", "oval", "square", "long", "heart", "diamond", "unclear"] },
    confidence: { type: "NUMBER" },
    currentHairObservation: { type: "STRING" },
    overallAdvice: { type: "STRING" },
    recommendedStyles: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          styleName: { type: "STRING" },
          description: { type: "STRING" },
          whyItFits: { type: "STRING" },
          barberInstruction: { type: "STRING" },
          relatedServices: { type: "ARRAY", items: { type: "STRING" } },
          previewPrompt: { type: "STRING" },
          priority: { type: "NUMBER" }
        },
        required: ["styleName", "description", "whyItFits", "barberInstruction", "previewPrompt", "priority"]
      }
    },
    avoidStyles: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          styleName: { type: "STRING" },
          reason: { type: "STRING" }
        }
      }
    },
    colorAdvice: {
      type: "OBJECT",
      properties: {
        shouldDye: { type: "BOOLEAN" },
        recommendedColors: { type: "ARRAY", items: { type: "STRING" } },
        avoidColors: { type: "ARRAY", items: { type: "STRING" } }
      }
    },
    permAdvice: {
      type: "OBJECT",
      properties: {
        shouldPerm: { type: "BOOLEAN" },
        recommendedPerm: { type: "STRING" },
        reason: { type: "STRING" }
      }
    },
    suggestedServiceNames: { type: "ARRAY", items: { type: "STRING" } },
    barberNote: { type: "STRING" }
  },
  required: ["faceShape", "currentHairObservation", "overallAdvice", "recommendedStyles", "suggestedServiceNames", "barberNote"]
};

module.exports = {
  systemPrompt,
  responseSchema
};
