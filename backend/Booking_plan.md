# Kế hoạch luồng đặt lịch & xác thực

## 1. Tổng quan
Tài liệu này mô tả **vòng đời đặt lịch** trong backend của HalloBarberShop, tập trung vào:
- **Xác thực xung đột** để ngăn chặn đặt chồng lặp (đặt trùng slot).
- **Quản lý slot** – đánh dấu slot đã đặt, giải phóng khi hủy hoặc hoàn thành, và xử lý khả năng thay đổi động.
- **Các mô hình dữ liệu chính** (`Booking`, `BarberSchedule`, `BarberAbsence`).
- **Các endpoint API** tham gia vào luồng.
- **Xử lý các trường hợp biên** (khóa do no‑show, tích hợp nghỉ phép, đặt lịch đa ngày).
---

## 2. Tổng quan mô hình dữ liệu
| Mô hình | Trường chính | Phương thức liên quan |
|---------|--------------|----------------------|
| **Booking** (`backend/models/booking.model.js`) | `bookingDate`, `startTime`, `endTime`, `status`, `barberId`, `serviceId`, `customerId`, `bookingType` | – |
| **BarberSchedule** (`backend/models/barber-schedule.model.js`) | `barberId`, `date`, `availableSlots` (mảng `{time, isBooked, isBlocked}`) | `markSlotsAsBooked`, `unmarkSlotsAsBooked`, `releaseCompletedBookingSlots`, `getRealTimeAvailability` |
| **BarberAbsence** (`backend/models/barber-absence.model.js`) | `barberId`, `startDate`, `endDate`, `isApproved` | `isBarberAbsent`, `getBarberAbsences`, `updateBarberSchedules`, `revertBarberSchedules` |

---

## 3. Luồng tạo đặt lịch
1. **Yêu cầu từ client** → `POST /api/bookings` (được xử lý bởi `booking.controller.createBooking`).
2. **Kiểm tra payload** – các trường bắt buộc được xác thực qua schema Mongoose. **Sửa lỗi quan trọng**: `bookingType` giờ được gán rõ ràng (`'user'` hoặc `'guest'`).
3. **Kiểm tra xung đột** (trước khi lưu):
```js
const overlapping = await Booking.findOne({
  barberId,
  bookingDate,
  $or: [{ startTime: { $lt: newEnd }, endTime: { $gt: newStart } }]
});
if (overlapping) return res.status(409).json({ message: 'Slot conflict' });
```
- Điều kiện `newStart < existingEnd && newEnd > existingStart` đảm bảo **không có chồng lặp**.
4. **Lưu Booking** – tạo document `Booking` mới.
5. **Đánh dấu slot** – gọi `BarberSchedule.markSlotsAsBooked(barberId, dateStr, bookingId, startTime, endTime)` để đánh dấu các slot tương ứng.
6. **Phản hồi** – trả về booking đã tạo kèm các tham chiếu đã populate.

---

## 4. Chi tiết xác thực xung đột
- **Vị trí**: `backend/controllers/booking.controller.js` (xung quanh dòng 280‑320).
- **Logic**:
```js
const newStart = …; // phút từ đầu ngày
const newEnd   = …;
const conflict = existingSlots.some(slot =>
  newStart < slot.end && newEnd > slot.start
);
```
- **Khóa vì no‑show** – Khi một thợ cắt đạt ngưỡng `noShowCount` cấu hình, middleware `validateBookingCancellation` sẽ từ chối đặt lịch tiếp cho thợ đó (xem `booking.middleware.validateBookingCancellation`).
- **Tích hợp nghỉ phép** – Trước khi kiểm tra xung đột, controller gọi `BarberAbsence.isBarberAbsent(barberId, bookingDate)`. Nếu trả về `true`, yêu cầu bị từ chối với mã 409.

---

## 5. Quản lý slot
### 5.1 Đánh dấu slot (khi đặt)
- **Phương thức**: `BarberSchedule.markSlotsAsBooked(barberId, dateStr, bookingId, startTime, endTime)`.
- **Quy trình**:
  1. Tải lịch cho ngày cụ thể.
  2. Chuyển `startTime`/`endTime` thành chỉ số slot dựa trên `slotDuration` (mặc định 30 phút).
  3. Duyệt các slot, đặt `isBooked = true` và gắn `bookingId`.
  4. Lưu document lịch.

### 5.2 Bỏ đánh dấu slot (khi hủy)
- **Phương thức**: `BarberSchedule.unmarkSlotsAsBooked(barberId, dateStr, bookingId)`.
- **Quy trình** giống ngược lại: xoá `isBooked` và `bookingId`.

### 5.3 Khả năng thay đổi động (khi hoàn thành)
- **Phương thức**: `BarberSchedule.releaseCompletedBookingSlots(barberId, dateStr, bookingId, completionTime)`.
- **Mục đích**: Khi dịch vụ kết thúc sớm, các slot sau `completionTime` được giải phóng lại, các slot trước vẫn giữ trạng thái đã đặt.

---

## 6. Chuyển đổi trạng thái đặt lịch
| Từ → Đến | Được phép | Hệ quả phụ |
|-----------|------------|------------|
| `pending` → `confirmed` | ✅ | Đánh dấu slot đã đặt. |
| `pending` → `cancelled` | ✅ | Gọi `unmarkSlotsAsBooked`. |
| `confirmed` → `completed` | ✅ | Gọi `releaseCompletedBookingSlots`. |
| `confirmed` → `cancelled` | ✅ | Giống trên, có thể xử lý hoàn tiền. |
| Bất kỳ → `rejected` | ✅ | Không thay đổi slot (dùng cho lỗi xác thực). |

Chuyển đổi này được định nghĩa trong `booking.controller` khoảng dòng 990‑1015.

---

## 7. Xử lý nghỉ phép & ngày nghỉ
1. **Record nghỉ phép** – Tạo qua model `BarberAbsence`. Khi được duyệt, `updateBarberSchedules` sẽ đặt `isOffDay = true` và chặn các slot.
2. **Kiểm tra khi đặt** – `isBarberAbsent` được gọi trong quá trình xác thực xung đột. Nếu thợ đang nghỉ, yêu cầu bị từ chối.
3. **Hoàn tác** – Nếu nghỉ phép bị hủy, `revertBarberSchedules` sẽ xóa cờ `isOffDay`.

---

## 8. Tổng quan các endpoint API
| Phương thức | Đường dẫn | Controller | Mô tả |
|------------|-----------|------------|------|
| `POST` | `/api/bookings` | `createBooking` | Tạo đặt lịch mới với xác thực và đánh dấu slot. |
| `PATCH` | `/api/bookings/:id/status` | `updateBookingStatus` | Thay đổi trạng thái (xác nhận, hủy, hoàn thành). |
| `GET` | `/api/barbers/:id/schedule?date=YYYY-MM-DD` | `BarberSchedule.getRealTimeAvailability` | Trả về danh sách slot khả dụng/đã chặn. |
| `POST` | `/api/absences` | `BarberAbsence.create` | Gửi yêu cầu nghỉ phép. |
| `PATCH` | `/api/absences/:id/approve` | `BarberAbsence.approve` | Duyệt nghỉ phép, cập nhật lịch làm việc. |

---

## 9. Các trường hợp biên & hướng phát triển tương lai
- **Đặt lịch đa ngày** – Hiện chưa hỗ trợ; cần mở rộng mô hình `Booking` để lưu danh sách ngày và cập nhật logic xung đột.
- **Xử lý múi giờ** – Tất cả ngày được lưu dưới dạng chuỗi UTC (`YYYY‑MM‑DD`). Frontend phải chuyển sang múi giờ địa phương trước khi gửi.
- **Granularity slot** – Thời lượng slot có thể cấu hình qua `BarberSchedule.slotDuration`. Thay đổi yêu cầu di chuyển dữ liệu slot hiện có.
- **Hiệu năng** – Các truy vấn kiểm tra xung đột nên có chỉ mục `barberId + bookingDate + startTime/endTime` cho bộ dữ liệu lớn.
- **Kiểm thử** – Thêm unit test cho các phương thức `BarberSchedule` và middleware xác thực.

---

## 10. Liên kết nhanh
- **Booking Controller**: [booking.controller.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/controllers/booking.controller.js)
- **Barber Schedule Model**: [barber-schedule.model.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/models/barber-schedule.model.js)
- **Barber Absence Model**: [barber-absence.model.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/models/barber-absence.model.js)
- **Middleware xác thực Booking**: [booking.middleware.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/middlewares/booking.middleware.js)

---

## 1. Overview
This document describes the **booking lifecycle** in the HalloBarberShop backend, focusing on:
- **Conflict validation** to prevent double‑booking (overlapping slots).
- **Slot management** – marking slots as booked, releasing them on cancellation/completion, and handling dynamic availability.
- **Key data models** (`Booking`, `BarberSchedule`, `BarberAbsence`).
- **API endpoints** involved in the flow.
- **Edge‑case handling** (no‑show blocking, absence integration, multi‑day bookings).

> All referenced file paths are absolute and clickable in the IDE.

---

## 2. Data Model Summary
| Model | Primary Fields | Relevant Methods |
|-------|----------------|------------------|
| **Booking** (`backend/models/booking.model.js`) | `bookingDate`, `startTime`, `endTime`, `status`, `barberId`, `serviceId`, `customerId`, `bookingType` | – |
| **BarberSchedule** (`backend/models/barber-schedule.model.js`) | `barberId`, `date`, `availableSlots` (array of `{time, isBooked, isBlocked}`) | `markSlotsAsBooked`, `unmarkSlotsAsBooked`, `releaseCompletedBookingSlots`, `getRealTimeAvailability` |
| **BarberAbsence** (`backend/models/barber-absence.model.js`) | `barberId`, `startDate`, `endDate`, `isApproved` | `isBarberAbsent`, `getBarberAbsences`, `updateBarberSchedules`, `revertBarberSchedules` |

---

## 3. Booking Creation Flow
1. **Client Request** → `POST /api/bookings` (handled by `booking.controller.createBooking`).
2. **Payload Validation** – required fields validated by Mongoose schema. **Important fix**: `bookingType` is now explicitly set (`'user'` or `'guest'`).
3. **Conflict Check** (in controller before persistence):
   ```js
   // Simplified pseudo‑code
   const overlapping = await Booking.findOne({
     barberId,
     bookingDate,
     $or: [
       { startTime: { $lt: newEnd }, endTime: { $gt: newStart } }
     ]
   });
   if (overlapping) return res.status(409).json({ message: 'Slot conflict' });
   ```
   - The condition `newStart < existingEnd && newEnd > existingStart` guarantees **no overlap**.
4. **Persist Booking** – new `Booking` document saved.
5. **Slot Marking** – `BarberSchedule.markSlotsAsBooked(barberId, dateStr, bookingId, startTime, endTime)` marks the exact slots as booked.
6. **Response** – returns the created booking with populated references.

---

## 4. Conflict Validation Details
- **Where it lives**: `backend/controllers/booking.controller.js` (lines around 280‑320). 
- **Logic**:
  ```js
  const newStart = …; // minutes from midnight
  const newEnd   = …;
  const conflict = existingSlots.some(slot =>
     newStart < slot.end && newEnd > slot.start
  );
  ```
- **No‑Show Blocking** – After a barber reaches the configured `noShowCount` threshold, `validateBookingCancellation` rejects further bookings for that barber (see `booking.middleware.validateBookingCancellation`).
- **Absence Integration** – Before conflict check, the controller calls `BarberAbsence.isBarberAbsent(barberId, bookingDate)`. If `true`, the request is rejected with `409`.

---

## 5. Slot Management
### 5.1 Marking Slots (Booking)
- **Method**: `BarberSchedule.markSlotsAsBooked(barberId, dateStr, bookingId, startTime, endTime)`.
- **Process**:
  1. Load schedule for the given date.
  2. Convert `startTime`/`endTime` to slot indices based on `slotDuration` (default 30 min).
  3. Loop through slots, setting `isBooked = true` and attaching `bookingId`.
  4. Save schedule document.

### 5.2 Unmarking Slots (Cancellation)
- **Method**: `BarberSchedule.unmarkSlotsAsBooked(barberId, dateStr, bookingId)`.
- **Process** mirrors marking but clears `isBooked` and removes the `bookingId` reference.

### 5.3 Dynamic Availability (Completion)
- **Method**: `BarberSchedule.releaseCompletedBookingSlots(barberId, dateStr, bookingId, completionTime)`.
- **Purpose**: When a service finishes early, slots after `completionTime` are released back to availability while earlier slots stay booked.

---

## 6. Booking Status Transitions
| From → To | Allowed | Side‑effects |
|----------|---------|--------------|
| `pending` → `confirmed` | ✅ | Marks slots as booked. |
| `pending` → `cancelled` | ✅ | Calls `unmarkSlotsAsBooked`. |
| `confirmed` → `completed` | ✅ | Calls `releaseCompletedBookingSlots`. |
| `confirmed` → `cancelled` | ✅ | Same as above, plus optional refund logic. |
| Any → `rejected` | ✅ | No slot changes (used for validation failures). |

The transition matrix is defined in `booking.controller` around lines 990‑1015.

---

## 7. Absence & Off‑Day Handling
1. **Absence Record** – Created via `BarberAbsence` model. When approved, `updateBarberSchedules` marks each affected `BarberSchedule` as `isOffDay = true` and blocks slots.
2. **Booking Validation** – `isBarberAbsent` is consulted during the conflict check. If the barber is absent, booking is rejected.
3. **Reverting** – If an absence is cancelled, `revertBarberSchedules` clears the `isOffDay` flag.

Relevant files:
- `backend/models/barber-absence.model.js`
- `backend/controllers/absence.controller.js` (if exists)

---

## 8. API Endpoint Summary
| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| `POST` | `/api/bookings` | `createBooking` | New booking with validation & slot marking.
| `PATCH` | `/api/bookings/:id/status` | `updateBookingStatus` | Change status (confirm, cancel, complete).
| `GET` | `/api/barbers/:id/schedule?date=YYYY-MM-DD` | `BarberSchedule.getRealTimeAvailability` | Returns free/blocked slots.
| `POST` | `/api/absences` | `BarberAbsence.create` | Submit absence request.
| `PATCH` | `/api/absences/:id/approve` | `BarberAbsence.approve` | Marks off‑day and updates schedules.

---

## 9. Edge Cases & Future Enhancements
- **Multi‑day bookings** – Currently not supported; would require extending `Booking` to hold an array of dates and adjusting conflict logic.
- **Timezone handling** – All dates are stored as UTC strings (`YYYY‑MM‑DD`). UI should convert to local timezone before sending.
- **Slot granularity** – Slot duration is configurable via `BarberSchedule.slotDuration`. Changing it requires migration of existing slot arrays.
- **Performance** – Conflict check queries should index `barberId` + `bookingDate` + `startTime`/`endTime` for large datasets.
- **Testing** – Add unit tests for `BarberSchedule` methods and validation middleware.

---

## 10. Quick Reference Links
- **Booking Controller**: [booking.controller.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/controllers/booking.controller.js)
- **Barber Schedule Model**: [barber-schedule.model.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/models/barber-schedule.model.js)
- **Barber Absence Model**: [barber-absence.model.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/models/barber-absence.model.js)
- **Booking Validation Middleware**: [booking.middleware.js](file:///c:/Users/admin/Desktop/WDP301/HalloBarberShop/backend/middlewares/booking.middleware.js)

---

*Prepared by Antigravity – your AI coding assistant.*
