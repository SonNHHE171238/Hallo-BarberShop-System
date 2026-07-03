const chatbotService = require('../services/chatbot.service');

exports.chat = async (req, res, next) => {
  try {
    const { message, history, imageBase64, mimeType } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ success: false, message: "Message or image is required." });
    }

    const result = await chatbotService.handleChat(message, history, imageBase64, mimeType);

    if (result && result.isAdvice) {
      res.status(200).json({
        success: true,
        type: "hairstyle_advice",
        data: {
          advice: result.advice,
          matchedServices: result.matchedServices,
          previewImageUrl: result.previewImageUrl,
          provider: result.provider
        }
      });
    } else if (result && result.isBarberMenu) {
      res.status(200).json({
        success: true,
        type: "barber_menu",
        data: {
          text: result.text,
          barbers: result.barbers
        }
      });
    } else if (result && result.isMenu) {
      res.status(200).json({
        success: true,
        type: "menu",
        data: {
          text: result.text,
          services: result.services
        }
      });
    } else {
      res.status(200).json({
        success: true,
        type: "text",
        data: result
      });
    }
  } catch (error) {
    console.error("Chatbot Error:", error);
    next(error); // Pass to global error handler
  }
};

const stabilityPreviewService = require('../services/stabilityPreview.service');

exports.testStabilityPreview = async (req, res, next) => {
  try {
    const file = req.file;
    const { prompt, search_prompt } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "Không tìm thấy file ảnh đính kèm (field: image)" });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({ success: false, message: "Kích thước ảnh quá lớn, tối đa 5MB." });
    }

    const previewImageBase64 = await stabilityPreviewService.generatePreview(file.buffer, prompt, search_prompt);

    res.status(200).json({
      success: true,
      data: {
        previewImageUrl: null,
        previewImageBase64: previewImageBase64,
        provider: "stability",
        mode: "search-and-replace",
        message: "Tạo ảnh preview bằng Stability thành công"
      }
    });

  } catch (error) {
    console.error("Stability Preview Error:", error);
    res.status(500).json({
      success: false,
      message: "Không tạo được ảnh preview bằng Stability",
      error: error.message
    });
  }
};
