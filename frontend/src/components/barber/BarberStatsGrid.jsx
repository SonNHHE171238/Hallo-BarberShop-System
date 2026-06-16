import React from 'react';

export default function BarberStatsGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {/* Stat Card 1 */}
      <div className="bg-surface-container-low border border-outline-gold rounded p-container-padding flex flex-col gap-4 hover:border-primary transition-colors group">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span className="font-label-md text-label-md uppercase tracking-widest group-hover:text-primary transition-colors">Lịch Hẹn Hôm Nay</span>
          <span className="material-symbols-outlined">calendar_today</span>
        </div>
        <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface serif-heading">12</div>
        <div className="font-body-md text-body-md text-outline">4 Đã Hoàn Thành · 8 Đang Chờ</div>
      </div>

      {/* Stat Card 2 */}
      <div className="bg-surface-container-low border border-outline-gold rounded p-container-padding flex flex-col gap-4 hover:border-primary transition-colors group">
        <div className="flex justify-between items-center text-gold-dim">
          <span className="font-label-md text-label-md uppercase tracking-widest">Tiền Tip Dự Kiến</span>
          <span className="material-symbols-outlined">payments</span>
        </div>
        <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary serif-heading">$145</div>
        <div className="font-body-md text-body-md text-outline">+12% so với hôm qua</div>
      </div>

      {/* Stat Card 3 */}
      <div className="bg-surface-container-low border border-outline-gold rounded p-container-padding flex flex-col gap-4 sm:col-span-2 md:col-span-1 hover:border-primary transition-colors group">
        <div className="flex justify-between items-center text-gold-dim">
          <span className="font-label-md text-label-md uppercase tracking-widest">Đánh Giá Khách Hàng</span>
          <span className="material-symbols-outlined icon-fill text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </div>
        <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface serif-heading">4.9</div>
        <div className="font-body-md text-body-md text-outline">Dựa trên 342 đánh giá</div>
      </div>
    </section>
  );
}
