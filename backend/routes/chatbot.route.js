const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const multer = require('multer');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/chatbot
router.post('/', chatbotController.chat);

module.exports = router;
