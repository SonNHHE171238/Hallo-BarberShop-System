const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/bookingfeedback.controller");

// Route API
router.get("/testimonials", feedbackController.getTestimonials);
router.get("/lookup/:phone", feedbackController.lookupByPhone);
router.post("/", feedbackController.createFeedback);

module.exports = router;
