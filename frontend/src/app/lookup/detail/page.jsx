import GuestBookingDetailPage from "@/page/shop/GuestBookingDetailPage";
import { Suspense } from "react";

export const metadata = {
  title: "Chi Tiết Đơn Hàng | HALLO BARBER",
  description: "Chi tiết lịch hẹn của bạn tại Hallo Barber.",
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GuestBookingDetailPage />
    </Suspense>
  );
}
