import AdminOrdersPage from "@/page/admin/AdminOrdersPage";

export const metadata = {
  title: "Quản lý Đơn Hàng - Staff | HALLO BARBER",
  description: "Trang quản lý đơn hàng online dành cho nhân viên",
};

export default function Page() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 pb-8 w-full">
      <AdminOrdersPage role="staff" baseRoute="/staff/orders" />
    </div>
  );
}
