const chatbotService = require('../services/chatbot.service');

exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const responseText = await chatbotService.handleChat(message, history);

    res.status(200).json({
      success: true,
      data: responseText
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    next(error); // Pass to global error handler
  }
};
