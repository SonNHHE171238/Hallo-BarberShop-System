const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/bookingfeedback.controller");

const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

// Route API
router.get("/testimonials", feedbackController.getTestimonials);
router.get("/lookup/:phone", feedbackController.lookupByPhone);
router.get("/barber/:barberId", feedbackController.getBarberFeedbacks);
router.post("/", feedbackController.createFeedback);

// Admin routes
router.use(authenticate);
router.use(authorizeRoles('admin', 'staff'));
router.get("/all", feedbackController.getAllBookingFeedbacks);
router.delete("/:id", feedbackController.deleteBookingFeedback);

module.exports = router;
