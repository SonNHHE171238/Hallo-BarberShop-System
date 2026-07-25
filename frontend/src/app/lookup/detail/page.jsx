import GuestBookingDetailPage from "@/page/shop/GuestBookingDetailPage";

export const metadata = {
  title: "Chi Tiết Đơn Hàng | HALLO BARBER",
  description: "Chi tiết lịch hẹn của bạn tại Hallo Barber.",
};

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <GuestBookingDetailPage />
    </Suspense>
  );
}
