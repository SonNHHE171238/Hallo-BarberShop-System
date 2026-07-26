import BookingDetailPage from '@/page/booking/BookingDetailPage';

export const metadata = {
  title: 'Chi Tiết Lịch Hẹn | HALLO BARBER',
  description: 'Chi tiết lịch hẹn của bạn tại HALLO BARBER.',
};

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <BookingDetailPage id={resolvedParams.id} />;
}
