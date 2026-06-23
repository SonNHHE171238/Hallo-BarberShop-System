import React from 'react';

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
      {/* Stat Card 1 */}
      <div className="bg-surface-container-low border border-outline-gold rounded p-container-padding flex flex-col gap-4 hover:border-primary transition-colors group">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span className="font-label-md text-label-md uppercase tracking-widest group-hover:text-primary transition-colors">Lịch Hẹn Hôm Nay</span>
          <span className="material-symbols-outlined">calendar_today</span>
        </div>
        <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface serif-heading">{totalBookings}</div>
        <div className="font-body-md text-body-md text-outline">{completedBookings} Đã Hoàn Thành · {pendingBookings} Đang Chờ</div>
      </div>

      {/* Stat Card 2 */}
      <div className="bg-surface-container-low border border-outline-gold rounded p-container-padding flex flex-col gap-4 hover:border-primary transition-colors group">
        <div className="flex justify-between items-center text-gold-dim">
          <span className="font-label-md text-label-md uppercase tracking-widest">Doanh Thu Hôm Nay</span>
          <span className="material-symbols-outlined">payments</span>
        </div>
        <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary serif-heading">${revenue}</div>
        <div className="font-body-md text-body-md text-outline">Tổng doanh thu từ dịch vụ</div>
      </div>

      {/* Stat Card 3 */}
      <div className="bg-surface-container-low border border-outline-gold rounded p-container-padding flex flex-col gap-4 sm:col-span-2 md:col-span-1 hover:border-primary transition-colors group">
        <div className="flex justify-between items-center text-gold-dim">
          <span className="font-label-md text-label-md uppercase tracking-widest">Đánh Giá Khách Hàng</span>
          <span className="material-symbols-outlined icon-fill text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </div>
        <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface serif-heading">{averageRating}</div>
        <div className="font-body-md text-body-md text-outline">Dựa trên {ratingCount} đánh giá</div>
      </div>
    </section>
  );
}
