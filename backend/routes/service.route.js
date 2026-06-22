const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");

// ==========================================
// PUBLIC ENDPOINTS (Khách hàng & Nhìn công khai)
// ==========================================

// Route lấy các service đang hoạt động (Tính năng của bạn)
router.get("/active", serviceController.getActiveServices);

// Route lấy tất cả service có bộ lọc, phân trang (Từ develop)
router.get("/", serviceController.getAllServices);

// Chi tiết service
router.get("/:id", serviceController.getServiceDetail);

// ==========================================
// ADMIN-ONLY ENDPOINTS (Chỉ Admin được truy cập)
// ==========================================
router.post("/", authenticate, authorizeRoles("admin"), serviceController.createService);
router.put("/:id", authenticate, authorizeRoles("admin"), serviceController.updateService);
router.delete("/:id", authenticate, authorizeRoles("admin"), serviceController.deleteService);

module.exports = router;