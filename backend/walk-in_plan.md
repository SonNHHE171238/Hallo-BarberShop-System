# Walk-in Booking API — Kế hoạch triển khai Backend

Xây dựng luồng API đặt lịch Walk-in (khách tại quầy) cho nhân viên/admin thao tác, dựa trên plan trong hình ảnh người dùng cung cấp.

## Phân tích hiện trạng

### Đã có sẵn
| Thành phần | Trạng thái | Ghi chú |
|---|---|---|
| `booking.model.js` — trường `bookingType: 'guest'` | ✅ Đã có | Hỗ trợ `customerName`, `customerPhone` bắt buộc khi `bookingType === 'guest'` |
| `barber-schedule.model.js` — `getAvailableSlots()` | ✅ Đã có | Trả slots trống theo `barberId` + `date` |
| `barber-schedule.model.js` — `markSlotsAsBooked()` | ✅ Đã có | Đánh dấu slots đã đặt |
| `barber.controller.js` — `autoAssignBarberForSlot()` | ✅ Đã có (dòng 817) | Logic auto-assign thợ |
| `createBookingSinglePage` — validate chống trùng lịch | ✅ Đã có | Barber conflict + Customer conflict |
| Middleware `authenticate` + `authorizeRoles` | ✅ Đã có | |

### Chưa có — cần tạo mới
| Thành phần | Plan |
|---|---|
| Controller `createWalkInBooking` | Tạo booking walk-in không cần `customerId`, `bookingType = 'guest'`, status mặc định `confirmed` |
| Route `POST /api/bookings/walk-in` | Endpoint cho staff/admin |
| API kiểm tra slots trống (cho walk-in) | Tận dụng `getAvailableSlots` đã có, thêm route |
| Notification (bước 4 trong plan) | ⏭️ Chưa có hạ tầng notification — **bỏ qua bước này, để phase sau** |
| `POST /customers` tạo khách mới | ⏭️ Không cần model Customer riêng — thông tin guest lưu trực tiếp trong Booking |
---

## Luồng kỹ thuật Walk-in (theo plan hình ảnh)

```
Staff nhấn "Xác nhận" tại quầy
         │
    ┌────▼────┐
    │ Bước 1  │ GET /api/bookings/walk-in/available-slots?service_id={id}&date={date}
    │         │ → Kiểm tra khung giờ còn trống
    └────┬────┘
         │
    ┌────▼────┐
    │ Bước 2  │ (Không cần API riêng — thông tin guest nhúng trong request bước 3)
    │         │ → Staff nhập tên, SĐT tại frontend
    └────┬────┘
         │
    ┌────▼────┐
    │ Bước 3  │ POST /api/bookings/walk-in
    │         │ → Tạo đơn booking với status: confirmed
    └────┬────┘
         │
    ┌────▼────┐
    │ Bước 4  │ POST /api/notifications (phase sau)
    │         │ → Gửi xác nhận SMS/Email
    └─────────┘
```

---

## Open Questions

> [!IMPORTANT]
> **1. Bỏ qua validate 30 phút?**
> Hàm `createBookingSinglePage` hiện tại bắt buộc booking phải đặt trước ít nhất 30 phút. Với Walk-in, khách đang đứng tại quầy → **nên bỏ quy tắc 30 phút** cho walk-in. Bạn đồng ý?

> [!IMPORTANT]
> **2. Bỏ qua kiểm tra No-show?**
> Walk-in là khách vãng lai, không có `customerId` → không thể kiểm tra lịch sử no-show. **Bỏ qua validate no-show** cho walk-in booking. Bạn đồng ý?

> [!IMPORTANT]
> **3. Ai được phép gọi API walk-in?**
> Theo plan, chỉ **staff (admin)** mới được thao tác. Vậy endpoint walk-in sẽ yêu cầu `authenticate + authorizeRoles('admin')`. Bạn có muốn thêm role `staff` hoặc `barber` cũng được phép không?

> [!IMPORTANT]
> **4. Auto-assign barber cho walk-in?**
> Nếu staff không chọn thợ cụ thể, có muốn hỗ trợ auto-assign thợ rảnh nhất cho walk-in không? Hay bắt buộc staff phải chọn thợ?

---

## Proposed Changes

### Booking Controller

#### [NEW] Hàm `createWalkInBooking` trong [booking.controller.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/controllers/booking.controller.js)

Tạo hàm mới chuyên xử lý walk-in, tái sử dụng logic validate conflict từ `createBookingSinglePage` nhưng với các điểm khác biệt:

| So sánh | `createBookingSinglePage` | `createWalkInBooking` |
|---|---|---|
| `bookingType` | `'user'` (ngầm định) | `'guest'` |
| `customerId` | Bắt buộc (`req.userId`) | `null` — không cần |
| `status` mặc định | `'pending'` | **`'confirmed'`** — admin tạo = tự động xác nhận |
| Validate 30 phút | ✅ Có | ❌ Bỏ qua |
| Validate no-show | ✅ Có | ❌ Bỏ qua |
| Yêu cầu đăng nhập | Customer đăng nhập | Admin/Staff đăng nhập |
| `confirmedAt`, `confirmedBy` | Cần confirm sau | Gán ngay lúc tạo |
| `customerName`, `customerPhone` | Tùy chọn | **Bắt buộc** |
| Auto-assign barber | ✅ Có | ✅ Có (tuỳ open question #4) |

**Logic chính:**
1. Validate input: `serviceId`, `date`, `timeSlot`, `customerName`, `customerPhone` bắt buộc
2. Validate service tồn tại, lấy `durationMinutes`
3. Auto-assign barber nếu không chọn (tuỳ option)
4. Validate barber tồn tại + không nghỉ phép
5. Check barber conflict (trùng lịch thợ)
6. Check daily booking limit
7. **Bỏ qua**: validate 30 phút, no-show, customer conflict
8. Tạo booking với `bookingType: 'guest'`, `status: 'confirmed'`
9. Cập nhật `totalBookings` cho barber
10. Đánh dấu slots trong `BarberSchedule`
11. Trả response đầy đủ

---

#### [NEW] Hàm `getWalkInAvailableSlots` trong [booking.controller.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/controllers/booking.controller.js)

Bước 1 trong plan — kiểm tra khung giờ còn trống. Wrapper gọn gàng trên `BarberSchedule.getAvailableSlots()`:

- **Input**: `service_id` (query), `date` (query)
- **Output**: Danh sách slots trống cho tất cả barber hoạt động trong ngày đó
- Lọc bỏ barber nghỉ phép, barber đầy lịch

---

### Booking Route

#### [MODIFY] [booking.route.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/routes/booking.route.js)

Thêm 2 route mới:

```js
// Walk-in booking endpoints (Staff/Admin only)
router.get('/walk-in/available-slots', authenticate, authorizeRoles('admin'), bookingController.getWalkInAvailableSlots);
router.post('/walk-in', authenticate, authorizeRoles('admin'), bookingController.createWalkInBooking);
```

---

### Booking Model

#### Không cần sửa [booking.model.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/models/booking.model.js)

Model đã hỗ trợ sẵn:
- `bookingType: 'guest'` ✅
- `customerId: null` khi guest ✅
- `customerName`, `customerPhone` bắt buộc khi guest ✅
- `status: 'confirmed'` ✅
- `confirmedAt`, `confirmedBy` ✅

---

## Verification Plan

### Automated Tests
1. Chạy server: `node server.js` — đảm bảo không lỗi khởi động
2. Test bằng cURL/Postman:
   - **GET** `/api/bookings/walk-in/available-slots?service_id=xxx&date=2026-06-18` → trả slots trống
   - **POST** `/api/bookings/walk-in` với body hợp lệ → tạo booking `confirmed`
   - **POST** `/api/bookings/walk-in` với slot đã đặt → trả lỗi `409 BOOKING_CONFLICT`
   - **POST** `/api/bookings/walk-in` thiếu `customerName` → trả lỗi `400`
   - **POST** `/api/bookings/walk-in` không có token admin → trả lỗi `403`
