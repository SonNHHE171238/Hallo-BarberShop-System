# Backend Coding Standards - HALLO BARBER

Tài liệu này quy định các tiêu chuẩn viết code cho dự án Backend (Node.js + Express + JavaScript) của hệ thống HALLO BARBER. Tuân thủ các quy tắc này để duy trì kiến trúc rõ ràng, dễ bảo trì và dễ dàng test (unit test).

## 1. Kiến trúc phân lớp (Layered Architecture)

Backend được tổ chức theo kiến trúc 3 lớp (3-Tier Architecture) để tách biệt rõ ràng giữa phần xử lý HTTP (Controller) và logic nghiệp vụ (Service):

- **`routes/`**: Nơi định nghĩa các endpoints (URL) của API. Chỉ làm nhiệm vụ điều hướng request đến đúng Controller. Không chứa bất kỳ logic xử lý nào ở đây.
- **`controllers/`**: Lớp xử lý HTTP Request/Response. Chức năng chính là nhận request (params, body, query), kiểm tra tính hợp lệ sơ bộ, gọi hàm ở `services/`, và trả về JSON Response cho Frontend.
- **`services/`**: Lớp chứa **toàn bộ Logic Nghiệp vụ (Business Logic)**. Tại sao? Để có thể tái sử dụng logic (ví dụ: Controller có thể gọi service thanh toán, Cronjob cũng có thể gọi service thanh toán) và dễ dàng viết Unit Test.
- **`models/`**: Nơi định nghĩa các Schema của Database (ví dụ: Mongoose Models).
- **`middlewares/`**: Chứa các hàm middleware can thiệp vào vòng đời của request (ví dụ: `auth.middleware.js` kiểm tra token, `error.middleware.js` xử lý lỗi tập trung).
- **`config/`**: Nơi lưu trữ cấu hình hệ thống (kết nối Database, JWT config, Redis config...).
- **`utils/`**: Chứa các hàm tiện ích (helpers) dùng chung như format ngày tháng, mã hóa mật khẩu, sinh mã ngẫu nhiên.

## 2. Quy tắc Đặt tên (Naming Convention)

### File Naming
- Sử dụng `kebab-case` kết hợp với hậu tố của loại file (suffix).
- **Format:** `[tên_thực_thể].[loại_file].js`
- **Ví dụ:**
  - `user.controller.js`
  - `auth.service.js`
  - `booking.model.js`
  - `auth.middleware.js`
  - `database.config.js`

### Code Naming
- **Biến và Hàm (Variables & Functions):** Sử dụng `camelCase` (ví dụ: `getUserById`, `totalPrice`, `isVerified`).
- **Models/Classes:** Sử dụng `PascalCase` và số ít (ví dụ: `User`, `Booking`).
- **Hằng số (Constants):** Sử dụng `UPPER_SNAKE_CASE` (ví dụ: `MAX_RETRY_COUNT`, `JWT_SECRET`).

## 3. Quy chuẩn viết Controller và Service

### Nguyên tắc 1: Controller phải mỏng (Thin Controllers)
Controller **không** được chứa các câu lệnh truy vấn database trực tiếp (`Model.findOne()`) hoặc xử lý logic tính toán phức tạp. Nó chỉ nên:
1. Nhận dữ liệu.
2. Gọi Service.
3. Trả về kết quả (status code `200`, `201`...).

*Ví dụ sai (Mập Controller):*
```javascript
// user.controller.js
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id); // Trực tiếp gọi DB -> SAI
  if (!user) return res.status(404).send('Not found');
  res.json(user);
}
```

*Ví dụ đúng (Mỏng Controller, Mập Service):*
```javascript
// user.controller.js
const userService = require('../services/user.service');

exports.getUser = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error); // Đẩy lỗi cho Global Error Handler
  }
}

// user.service.js
const User = require('../models/user.model');

exports.findUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('UserNotFound');
  return user;
}
```

### Nguyên tắc 2: Service không biết về HTTP
Lớp Service không được nhận các object `req` (Request) hay `res` (Response) từ Express. Hãy bóc tách dữ liệu từ `req` ở Controller và truyền vào Service dưới dạng các tham số cơ bản (String, Object, Array).

## 4. Xử lý Lỗi (Error Handling)

1. Không dùng `res.status(500).json(...)` rải rác khắp nơi.
2. Sử dụng `try...catch` trong các hàm bất đồng bộ (async) ở Controller. Trong block `catch`, luôn gọi hàm `next(error)`.
3. Có một **Global Error Handler Middleware** (thường đặt cuối cùng trong `server.js`) để bắt tất cả các lỗi do hàm `next()` truyền tới, từ đó log lỗi và trả về JSON thống nhất cho Frontend.

## 5. Quy chuẩn API Response

Luôn trả về Response theo một định dạng thống nhất để Frontend dễ xử lý.

**Thành công:**
```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": { ... }
}
```

**Thất bại:**
```json
{
  "success": false,
  "message": "Không tìm thấy người dùng",
  "error_code": "USER_NOT_FOUND" 
}
```

## 6. Quy tắc Git Commit

Tương tự Frontend, sử dụng Conventional Commits:
- `feat:` Thêm API/Tính năng mới.
- `fix:` Sửa lỗi logic/DB.
- `docs:` Thay đổi tài liệu, Swagger.
- `refactor:` Tối ưu code Service/Controller.
- `test:` Viết thêm Unit Test.
