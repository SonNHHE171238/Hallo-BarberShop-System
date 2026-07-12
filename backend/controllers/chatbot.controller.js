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
