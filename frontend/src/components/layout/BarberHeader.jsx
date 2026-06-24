"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";

export default function BarberHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      try {
        await logout();
      } catch (err) {
        console.error("Lỗi đăng xuất:", err);
      }
    }
  };

  return (
    <header className="fixed top-0 w-full bg-surface-container-lowest text-primary font-body-md text-body-md z-50 border-b border-outline-gold">
      <div className="max-w-7xl mx-auto px-gutter flex justify-between items-center h-20">
        {/* Brand Logo */}
        <Link href="/barber/dashboard" className="font-display-lg text-[24px] md:text-[32px] font-bold tracking-tighter text-primary serif-heading">
          HALLO BARBER
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link className="text-on-surface-variant hover:text-primary transition-all duration-300 uppercase text-[12px] tracking-[0.2em] font-medium" href="/barber/dashboard">Bảng Điều Khiển</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-all duration-300 uppercase text-[12px] tracking-[0.2em] font-medium" href="/barber/appointments">Lịch Hẹn</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-all duration-300 uppercase text-[12px] tracking-[0.2em] font-medium" href="/barber/customers">Khách Hàng</Link>
        </nav>

        {/* Trailing Action */}
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="relative">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className="font-label-md text-sm uppercase font-bold text-on-surface group-hover:text-primary transition-colors hidden sm:block">
                {user?.name || "Barber"}
              </span>
              <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-gold flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">person</span>
                )}
              </div>
            </div>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-4 w-56 bg-surface-container-lowest border border-outline-variant shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-outline-variant/50 bg-surface-container-low">
                  <p className="font-headline-sm text-sm text-on-surface truncate">{user?.name || "Barber"}</p>
                  <p className="font-body-md text-xs text-on-surface-variant truncate mt-1">{user?.email || "barber@hallobarber.com"}</p>
                </div>
                <div className="py-2">
                  <Link href="/barber/profile" className="flex items-center gap-3 px-4 py-2 font-label-md text-sm text-on-surface hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    Hồ sơ cá nhân
                  </Link>
                  <Link href="/barber/settings" className="flex items-center gap-3 px-4 py-2 font-label-md text-sm text-on-surface hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    Cài đặt
                  </Link>
                  <div className="h-px bg-outline-variant/50 my-2"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 font-label-md text-sm text-error hover:bg-error/10 transition-colors text-left">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-on-surface-variant p-2 rounded-md hover:bg-surface-variant transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-surface-container-lowest border-b border-outline-gold shadow-lg transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col px-4 space-y-4">
          <Link onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-sm uppercase tracking-widest font-bold" href="/barber/dashboard">Bảng Điều Khiển</Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-sm uppercase tracking-widest font-bold" href="/barber/appointments">Lịch Hẹn</Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-sm uppercase tracking-widest font-bold" href="/barber/customers">Khách Hàng</Link>
        </div>
      </div>
    </header>
  );
}
