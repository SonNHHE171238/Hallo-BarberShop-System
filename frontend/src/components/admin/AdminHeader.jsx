import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminHeader({ onMenuClick }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes('/admin/employee')) return 'Quản Lý Nhân Viên';
    if (pathname.includes('/admin/bookings')) return 'Lịch Hẹn';
    if (pathname.includes('/admin/services')) return 'Dịch Vụ';
    if (pathname.includes('/admin/inventory')) return 'Kho Hàng';
    if (pathname.includes('/admin/products')) return 'Quản Lý Sản Phẩm';
    if (pathname.includes('/admin/analytics')) return 'Phân Tích';
    if (pathname === '/admin' || pathname === '/admin/') return 'Bảng Điều Khiển - Admin';
    return '';
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
        {/* User Profile Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-full hover:bg-surface-container cursor-pointer transition-colors border border-outline-gold/30"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="font-body-md text-sm font-semibold text-on-surface leading-tight truncate uppercase tracking-tighter">{user?.name || 'Quản trị viên'}</span>
              <span className="font-label-md text-[10px] text-primary truncate uppercase tracking-widest">Admin</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center font-headline-sm text-primary flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>

          {/* Profile Menu Popup */}
          <div className={`absolute top-full right-0 mt-2 w-48 bg-surface-container-high border border-outline-gold rounded-lg shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${isProfileMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <button 
              onClick={() => {
                setIsProfileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-label-md text-sm uppercase tracking-widest">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
