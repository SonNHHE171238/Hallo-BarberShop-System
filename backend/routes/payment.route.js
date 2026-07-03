const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth.middleware");

// Tạo link thanh toán (có thể yêu cầu authenticate hoặc optionalAuthenticate tùy logic)
router.post("/create-link", optionalAuthenticate, paymentController.createPaymentLink);

// Đón webhook từ PayOS (không dùng authenticate vì đây là server-to-server)
router.post("/webhook", paymentController.payosWebhook);

module.exports = router;
