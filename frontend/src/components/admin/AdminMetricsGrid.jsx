import React from 'react';

export default function AdminMetricsGrid() {
  return (
    <section className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-4 md:pb-0 md:grid md:grid-cols-3 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      {/* Metric Card: Total Revenue */}
      <div className="min-w-[85%] md:min-w-0 snap-center bg-surface-container-low border border-outline-gold p-5 md:p-8 rounded flex flex-col justify-between relative overflow-hidden group flex-shrink-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all duration-300 group-hover:w-2"></div>
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.1em]">Tổng Doanh Thu (30n)</h2>
          <span className="material-symbols-outlined text-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="font-headline-lg text-[28px] md:text-headline-lg text-primary tracking-tight">$42,850</span>
          <span className="font-label-md text-[12px] text-primary flex items-center bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            <span className="material-symbols-outlined text-[14px] mr-1">arrow_upward</span>
            12.5%
          </span>
        </div>
      </div>
      {/* Metric Card: New Customers */}
      <div className="min-w-[85%] md:min-w-0 snap-center bg-surface-container-low border border-outline-gold p-5 md:p-8 rounded flex flex-col justify-between relative overflow-hidden group flex-shrink-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 transition-all duration-300 group-hover:bg-primary"></div>
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.1em]">Khách Hàng Mới</h2>
          <span className="material-symbols-outlined text-primary/60">person_add</span>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="font-headline-lg text-[28px] md:text-headline-lg text-on-surface tracking-tight">184</span>
          <span className="font-label-md text-[12px] text-primary flex items-center bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            <span className="material-symbols-outlined text-[14px] mr-1">arrow_upward</span>
            8.2%
          </span>
        </div>
      </div>
      {/* Metric Card: Avg Booking Value */}
      <div className="min-w-[85%] md:min-w-0 snap-center bg-surface-container-low border border-outline-gold p-5 md:p-8 rounded flex flex-col justify-between relative overflow-hidden group flex-shrink-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 transition-all duration-300 group-hover:bg-primary"></div>
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.1em]">Giá Trị Đặt Lịch TB</h2>
          <span className="material-symbols-outlined text-primary/60">receipt_long</span>
        </div>
        <div className="flex items-baseline gap-4">
          <span className="font-headline-lg text-[28px] md:text-headline-lg text-on-surface tracking-tight">$68.50</span>
          <span className="font-label-md text-[12px] text-outline flex items-center bg-surface-variant px-2 py-0.5 rounded border border-outline-gold/30">
            <span className="material-symbols-outlined text-[14px] mr-1">horizontal_rule</span>
            0.0%
          </span>
        </div>
      </div>
    </section>
  );
}
