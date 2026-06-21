const chatbotService = require('../services/chatbot.service');

exports.chat = async (req, res, next) => {
  try {
    const { message, history, imageBase64, mimeType } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ success: false, message: "Message or image is required." });
    }

    const responseText = await chatbotService.handleChat(message, history, imageBase64, mimeType);

    res.status(200).json({
      success: true,
      data: responseText
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    next(error); // Pass to global error handler
  }
};
