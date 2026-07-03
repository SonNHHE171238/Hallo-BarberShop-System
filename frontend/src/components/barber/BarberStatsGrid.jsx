import React from 'react';
import MetricCard from '@/components/ui/MetricCard';

export default function BarberStatsGrid({ profile, bookings }) {
  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
  const pendingBookings = bookings?.filter(b => ['pending', 'confirmed'].includes(b.status)).length || 0;

  // Calculate revenue from completed bookings
  const revenue = bookings?.reduce((acc, b) => {
    if (b.status === 'completed' && b.serviceId) {
      return acc + (b.serviceId.price || 0);
    }
    return acc;
  }, 0) || 0;

  const averageRating = profile?.averageRating?.toFixed(1) || '0.0';
  const ratingCount = profile?.ratingCount || 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <MetricCard
        title="Lịch Hẹn Hôm Nay"
        icon="calendar_today"
        value={totalBookings}
        subtitle={`${completedBookings} Đã Hoàn Thành · ${pendingBookings} Đang Chờ`}
      />
      <MetricCard
        title="Doanh Thu Hôm Nay"
        icon="payments"
        value={`$${revenue}`}
        subtitle="Tổng doanh thu từ dịch vụ"
        isHighlight={true}
      />
      <MetricCard
        title="Đánh Giá Khách Hàng"
        icon="star"
        value={averageRating}
        subtitle={`Dựa trên ${ratingCount} đánh giá`}
        isHighlight={true}
        className="sm:col-span-2 md:col-span-1"
      />
    </section>
  );
}
