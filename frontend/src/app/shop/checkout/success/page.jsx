import { Suspense } from 'react';
import CheckoutSuccessPage from '@/page/shop/CheckoutSuccessPage';

export const metadata = {
  title: 'Đặt Hàng Thành Công | HALLO BARBER',
  description: 'Cảm ơn bạn đã mua hàng tại HALLO BARBER.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Đang tải...</div>}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}
