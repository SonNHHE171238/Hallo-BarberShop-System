import React from 'react';
import { usePathname } from 'next/navigation';

export default function AdminHeader({ onMenuClick }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes('/admin/employee')) return 'Quản Lý Nhân Viên';
    if (pathname.includes('/admin/appointments')) return 'Lịch Hẹn';
    if (pathname.includes('/admin/services')) return 'Dịch Vụ';
    if (pathname.includes('/admin/inventory')) return 'Kho Hàng';
    if (pathname.includes('/admin/analytics')) return 'Phân Tích';
    return 'Bảng Điều Khiển - Admin';
  };

  return (
    <header className="h-20 flex-shrink-0 border-b border-outline-gold bg-surface-obsidian/90 backdrop-blur-md sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-surface-variant hover:text-primary" onClick={onMenuClick}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-headline-md text-headline-sm md:text-headline-md text-on-surface uppercase tracking-[0.05em] truncate">
          {getPageTitle()}
        </h1>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <button className="text-on-surface-variant hover:text-primary transition-colors active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
