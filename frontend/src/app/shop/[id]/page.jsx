import ProductDetailPage from "@/page/shop/ProductDetailPage";

export const metadata = {
  title: "Chi tiết sản phẩm | HALLO BARBER",
  description: "Trang chi tiết sản phẩm HALLO BARBER",
};

export default async function ProductDetail({ params }) {
  const resolvedParams = await params;
  return <ProductDetailPage id={resolvedParams.id} />;
}
