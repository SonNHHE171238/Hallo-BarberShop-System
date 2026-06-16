import React from 'react';

export default function AdminSidebar() {
  return (
    <aside className="w-20 lg:w-64 flex-shrink-0 border-r border-outline-gold bg-surface-container-lowest flex-col hidden md:flex z-20 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-center lg:justify-start px-0 lg:px-6 border-b border-outline-gold">
        <span className="font-headline-lg-mobile text-[24px] lg:text-headline-md text-primary uppercase tracking-[0.1em] truncate">HB</span>
        <span className="font-headline-lg-mobile text-headline-md text-primary uppercase tracking-[0.1em] hidden lg:inline ml-2 truncate">BARBER</span>
      </div>
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 lg:px-4 flex flex-col gap-2">
        {/* Active Item: Analytics/Overview */}
        <a className="flex items-center justify-center lg:justify-start gap-3 px-3 py-3 lg:py-2.5 bg-surface-container-high text-primary rounded border border-outline-gold transition-colors group" href="#" title="Tổng quan">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="font-label-md text-label-md hidden lg:inline uppercase tracking-widest">Tổng quan</span>
        </a>
        {/* Inactive Items */}
        <a className="flex items-center justify-center lg:justify-start gap-3 px-3 py-3 lg:py-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors rounded border border-transparent group" href="#" title="Lịch hẹn">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-label-md text-label-md hidden lg:inline uppercase tracking-widest">Lịch hẹn</span>
        </a>
        <a className="flex items-center justify-center lg:justify-start gap-3 px-3 py-3 lg:py-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors rounded border border-transparent group" href="#" title="Kho hàng">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-label-md text-label-md hidden lg:inline uppercase tracking-widest">Kho hàng</span>
        </a>
        <a className="flex items-center justify-center lg:justify-start gap-3 px-3 py-3 lg:py-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors rounded border border-transparent group" href="#" title="Nhân viên">
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-md text-label-md hidden lg:inline uppercase tracking-widest">Nhân viên</span>
        </a>
        <a className="flex items-center justify-center lg:justify-start gap-3 px-3 py-3 lg:py-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors rounded border border-transparent group" href="#" title="Phân tích">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-md text-label-md hidden lg:inline uppercase tracking-widest">Phân tích</span>
        </a>
      </nav>
      {/* User Profile Area */}
      <div className="p-3 lg:p-4 border-t border-outline-gold">
        <div className="flex items-center justify-center lg:justify-start gap-3 p-2 rounded hover:bg-surface-container cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded border border-primary flex items-center justify-center font-headline-sm text-primary flex-shrink-0">
            A
          </div>
          <div className="flex-col hidden lg:flex truncate">
            <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight truncate uppercase tracking-tighter">Quản trị viên</span>
            <span className="font-label-md text-[10px] text-primary truncate uppercase tracking-widest">Quản lý hệ thống</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
