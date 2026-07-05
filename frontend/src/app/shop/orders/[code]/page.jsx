import CustomerOrderDetailPage from "@/page/shop/CustomerOrderDetailPage";

export const metadata = {
  title: "Theo dõi đơn hàng | HALLO BARBER",
  description: "Trang theo dõi tình trạng giao hàng dành cho khách hàng của Hallo BarberShop",
};

export default async function OrderTrackingRoute({ params }) {
  const { code } = await params;
  return <CustomerOrderDetailPage orderCode={code} />;
}
