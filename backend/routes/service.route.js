const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");

// Public endpoints
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceDetail);

// Admin-only endpoints
router.post("/", authenticate, authorizeRoles("admin"), serviceController.createService);
router.put("/:id", authenticate, authorizeRoles("admin"), serviceController.updateService);
router.delete("/:id", authenticate, authorizeRoles("admin"), serviceController.deleteService);

module.exports = router;
