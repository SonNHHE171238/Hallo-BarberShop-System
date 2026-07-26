import AdminOrderDetailPage from "@/page/admin/AdminOrderDetailPage";

export const metadata = {
  title: "Chi tiết Đơn Hàng - Staff | HALLO BARBER",
  description: "Trang chi tiết đơn hàng dành cho nhân viên",
};

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 pb-8 w-full">
      <AdminOrderDetailPage orderId={id} role="staff" baseRoute="/staff/orders" />
    </div>
  );
}

