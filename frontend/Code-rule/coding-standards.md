# Frontend Coding Standards - HALLO BARBER

Tài liệu này quy định các tiêu chuẩn viết code cho dự án Frontend (Next.js + Tailwind CSS + JavaScript/JSX) của hệ thống HALLO BARBER. Tuân thủ các quy tắc này giúp code dễ đọc, dễ bảo trì và hạn chế bugs khi làm việc nhóm.

## 1. Cấu trúc thư mục (Folder Structure)

Chúng ta sử dụng cấu trúc thư mục quy chuẩn trong `src/`:

- `app/`: Thư mục **Định tuyến (Router)**. Tên thư mục con sẽ tạo thành URL của web (ví dụ `app/login/` ➔ `localhost:3000/login`).
  - **Quy tắc bắt buộc:** File `page.jsx` ở đây **PHẢI** là Server Component (KHÔNG CÓ dòng `"use client"`). Nó chỉ làm 2 việc: Export SEO Metadata (`title`, `description`) và import Component giao diện từ thư mục `page/` để hiển thị.
- `page/`: Thư mục **Giao diện Toàn cảnh (UI Pages)**. Chứa Component đại diện cho nguyên một trang (ví dụ: `HomePage.jsx`, `LoginPage.jsx`).
  - **Quy tắc bắt buộc:** Đây là nơi chứa Logic người dùng (`useState`, `onChange`), gọi API (`fetch`) và ráp nối các mảnh ghép từ `components/`. File ở đây thường sẽ có `"use client"`.
  - **Nhóm theo tính năng (Feature-based):** Nếu dự án lớn có nhiều trang, hãy tạo các thư mục con theo chức năng (ví dụ: `page/auth/LoginPage.jsx`, `page/dashboard/AdminDashboard.jsx`). Tuyệt đối không để file nằm "mồ côi" lộn xộn ở ngoài root của `page/`.
- `assets/`: Chứa tài nguyên tĩnh như hình ảnh (`.png`, `.jpg`, `.svg`), icon.
- `components/`:
  - `layout/`: Các component dùng chung tạo thành khung xương của web (Navbar, Footer, Sidebar). **Tuyệt đối không** đặt thư mục layout nằm lộn xộn bên trong thư mục `page/`.
  - `shared/`: Các component nghiệp vụ có khả năng tái sử dụng qua nhiều trang (ví dụ: ServicesList, BookingForm).
  - `home/`, `booking/`: Các component cụ thể chỉ dùng MỘT LẦN cho từng trang tương ứng.
  - `ui/`: Các component UI cơ bản có thể tái sử dụng (Button, Input, Card).
- `context/`: Chứa React Context API để quản lý state global (ví dụ: AuthContext, ThemeContext).
- `hooks/`: Chứa Custom Hooks bắt đầu bằng tiền tố `use` (ví dụ: `useAuth`, `useWindowSize`).
- `services/`: Chứa các hàm gọi API (sử dụng fetch hoặc axios).
- `utils/`: Chứa các hàm helper, formatters (ví dụ: `formatDate`, `currencyFormat`).

## 2. Quy tắc Đặt tên (Naming Convention) & Quản lý File

- **Thư mục (Directories):** **BẮT BUỘC** sử dụng `kebab-case` 100% (ví dụ: `auth-context`, `home-page`, `manage-blog`). Tuyệt đối không pha trộn viết hoa viết thường (kiểu `Admin`, `ManageBlog`) để tránh xung đột hệ điều hành. Riêng các thư mục trong `app/` đặt tên theo chuẩn route của Next.js.
- **Không để file mồ côi:** Mọi file Component nên được phân loại vào đúng thư mục chủ đề của nó. Tránh tình trạng đã có thư mục chủ đề nhưng file lại nằm vất vưởng bên ngoài.
- **Tên Component (React Components):** Sử dụng `PascalCase` cho tên file và tên function (ví dụ: `Navbar.jsx`, `HeroSection.jsx`).
- **Biến và Hàm (Variables & Functions):** Sử dụng `camelCase` (ví dụ: `handleLogin`, `userData`, `fetchServices`).
- **Hằng số (Constants):** Sử dụng `UPPER_SNAKE_CASE` (ví dụ: `MAX_UPLOAD_SIZE`, `API_URL`).

## 3. Quy chuẩn React & Next.js

1. **Functional Components:** 100% sử dụng Functional Components kết hợp với Hooks. Không sử dụng Class Components.
2. **Server vs Client Components:** 
   - Mặc định Next.js App Router là Server Components (tốt cho SEO).
   - Chỉ thêm `'use client'` ở trên cùng file khi component thực sự cần tương tác (onClick, onChange) hoặc dùng React hooks (useState, useEffect).
3. **Props:** 
   - Ưu tiên destructuring props ngay tại tham số hàm: `export default function Button({ title, onClick }) {...}`
   - Nên sử dụng PropTypes nếu component được tái sử dụng nhiều ở các dự án lớn, hoặc viết comment rõ ràng cho props.
4. **Tránh Inline CSS:** Không sử dụng thuộc tính `style={{...}}` trừ khi các giá trị CSS là động (dynamic calculation từ Javascript). Luôn ưu tiên dùng class của Tailwind.

## 4. Quy chuẩn Tailwind CSS

1. **Sử dụng Design System:** Luôn sử dụng các màu, font, spacing đã được định nghĩa trong `tailwind.config.ts`.
   - Ví dụ: Dùng `text-on-surface`, `bg-background` thay vì gõ cứng `#121416` hay `gray-900`.
2. **Thứ tự Class (Class Ordering):** Khuyến khích cài đặt plugin Prettier cho Tailwind để tự động sắp xếp các class theo một thứ tự chuẩn (từ Layout, Flexbox -> Typography -> Visual -> Hover).
3. **Tránh lạm dụng class quá dài:** Nếu một element có quá nhiều class (trên 15 class) và được tái sử dụng nhiều, hãy cân nhắc tách thành Component hoặc khai báo bằng `@apply` trong `globals.css` (tuy nhiên ưu tiên React Component hơn).

## 5. Quy tắc Git Commit

Sử dụng Conventional Commits:
- `feat:` Thêm tính năng mới.
- `fix:` Sửa lỗi (bug).
- `docs:` Chỉ thay đổi tài liệu.
- `style:` Thay đổi format code, không ảnh hưởng logic.
- `refactor:` Tối ưu/Sửa đổi cấu trúc code không làm thay đổi tính năng.
- `perf:` Cải thiện hiệu năng.

Ví dụ: `feat: add booking service card to home page`
