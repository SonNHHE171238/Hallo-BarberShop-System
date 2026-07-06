import AdminOrderDetailPage from "@/page/admin/AdminOrderDetailPage";

export const metadata = {
  title: "Chi tiết Đơn Hàng | HALLO BARBER",
  description: "Trang chi tiết đơn hàng",
};

export default async function Page({ params }) {
  // Pass the ID to the client component
  const { id } = await params;
  return <AdminOrderDetailPage orderId={id} />;
}
