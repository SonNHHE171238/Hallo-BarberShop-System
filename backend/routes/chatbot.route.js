const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

// POST /api/chatbot
router.post('/', chatbotController.chat);

module.exports = router;
