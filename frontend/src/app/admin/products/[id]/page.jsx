import AdminProductFormPage from '@/page/admin/AdminProductFormPage';

export const metadata = {
  title: 'Chỉnh Sửa Sản Phẩm | Admin HALLO BARBER',
  description: 'Chỉnh sửa thông tin sản phẩm',
};

export default function EditProductPage({ params }) {
  // params is provided by Next.js App Router for dynamic routes
  return <AdminProductFormPage productId={params.id} />;
}
