import React from 'react';

export default function AdminHeader({ onMenuClick }) {
  return (
    <header className="h-20 flex-shrink-0 border-b border-outline-gold bg-surface-obsidian/90 backdrop-blur-md sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-surface-variant hover:text-primary" onClick={onMenuClick}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-headline-md text-headline-sm md:text-headline-md text-on-surface uppercase tracking-[0.05em] truncate">Bảng Điều Khiển - Admin</h1>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm">search</span>
          <input 
            className="bg-surface-container-low border border-outline-gold text-on-surface placeholder-outline pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors w-48 lg:w-64 font-body-md text-body-md rounded-lg" 
            placeholder="Tìm kiếm số liệu..." 
            type="text" 
          />
        </div>
        <button className="sm:hidden text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">search</span>
        </button>
        {/* Notifications */}
        <button className="relative text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-surface-obsidian"></span>
        </button>
      </div>
    </header>
  );
}
