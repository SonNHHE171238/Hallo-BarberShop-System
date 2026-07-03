# Kế Hoạch Refactor Backend (Tuân thủ Code-Rule)

Mục tiêu: Đưa toàn bộ cấu trúc mã nguồn của Backend vào khuôn khổ chuẩn mực dựa trên tài liệu `coding-standards.md`, giúp dễ dàng bảo trì, dễ viết Unit Test và chuẩn hóa dữ liệu trả về cho Frontend.

## Phạm Vi: Giai Đoạn 1 (Phase 1)
Để tránh gây ngợp và rủi ro lớn, Giai đoạn 1 (Phase 1) sẽ tập trung xử lý lõi cốt lõi: Auth (Đăng nhập/Đăng ký) và Booking (Đặt lịch).

## Kế Hoạch Chi Tiết (Phase 1: Chuẩn hóa Kiến trúc & Auth/Booking)

### 1. Chuẩn hóa Naming Convention (Tên file)
Đổi tên các file đang vi phạm quy tắc `kebab-case` kèm hậu tố (suffix).
- **[XÓA]** `backend/controllers/authController.js`
- **[TẠO MỚI]** `backend/controllers/auth.controller.js`
- **[XÓA]** `backend/routes/authRoute.js`
- **[TẠO MỚI]** `backend/routes/auth.route.js`
- **[XÓA]** `backend/middlewares/authMiddleware.js`
- **[TẠO MỚI]** `backend/middlewares/auth.middleware.js`

---

### 2. Xây dựng lớp Core Helpers & Middlewares (Tuân thủ Điều 4 & 5)
Thiết lập cơ chế xử lý Response và Error tập trung (Global).
- **[TẠO MỚI]** `backend/utils/response.helper.js`
  - Viết 2 hàm `sendSuccess` và `sendError` để đảm bảo API luôn bọc trong cấu trúc chuẩn: `{ success: true, message: "...", data: {...} }`.
- **[TẠO MỚI]** `backend/middlewares/error.middleware.js`
  - Tạo Global Error Handler bắt mọi lỗi từ hàm `next(error)` ở Controller, tránh tình trạng rải `res.status(500)` khắp nơi. Cập nhật `backend/server.js` để nhúng Middleware này vào dòng cuối cùng.

---

### 3. Refactor Domain Auth (Đăng nhập / Đăng ký)
Tuân thủ "Nguyên tắc 1: Thin Controller".
- **[TẠO MỚI]** `backend/services/auth.service.js`
  - Rút toàn bộ logic truy vấn DB (`User.findOne`, `user.save`), băm mật khẩu, gửi OTP từ Controller đưa vào đây.
- **[SỬA ĐỔI]** `backend/controllers/auth.controller.js`
  - Cắt gọt lại: Chỉ nhận Request `req.body`, truyền xuống cho `authService`, hứng kết quả và gọi `sendSuccess()`. Nếu có lỗi thì bọc trong `catch` và ném ra `next(error)`.

---

### 4. Refactor Domain Booking (Lịch hẹn)
Giải quyết file Controller béo phì nhất hệ thống (Gần 300 dòng code).
- **[TẠO MỚI]** `backend/services/booking.service.js`
  - Đưa các logic phức tạp như: Tính toán thời gian (Overlap), Normalize Date chống Race Condition, Check No-show và Giao tiếp với `BarberSchedule` sang Service.
- **[SỬA ĐỔI]** `backend/controllers/booking.controller.js`
  - Làm mỏng lại hàm `createBooking` và `checkAvailability`. Chuyển qua dùng Helper Response và Global Error Handler.
