"use client";

import React, { useState } from "react";
import Link from "next/link";
import BarberHeaderControls from "@/components/barber/BarberHeaderControls";
import BarberStatsGrid from "@/components/barber/BarberStatsGrid";
import ScheduleTimeline from "@/components/barber/ScheduleTimeline";

export default function BarberDashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md">
      {/* TopNavBar Component */}
      <header className="bg-surface-container-lowest text-primary font-body-md text-body-md w-full sticky top-0 z-50 border-b border-outline-gold">
        <div className="max-w-7xl mx-auto px-gutter flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link href="/" className="font-display-lg text-[24px] md:text-[32px] font-bold tracking-tighter text-primary serif-heading">
            HALLO BARBER
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="text-on-surface-variant hover:text-primary transition-all duration-300 uppercase text-[12px] tracking-[0.2em] font-medium" href="#">Dịch Vụ</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-all duration-300 uppercase text-[12px] tracking-[0.2em] font-medium" href="#">Cửa Hàng</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-all duration-300 uppercase text-[12px] tracking-[0.2em] font-medium" href="#">Đặt Lịch</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-all duration-300 uppercase text-[12px] tracking-[0.2em] font-medium" href="#">Bộ Sưu Tập</Link>
          </nav>

          {/* Trailing Action: Replace Login with Mocked User Avatar */}
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <span className="font-label-md text-sm uppercase font-bold text-on-surface group-hover:text-primary transition-colors hidden sm:block">
                Marcus
              </span>
              <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-gold flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">person</span>
              </div>
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
            <Link onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-sm uppercase tracking-widest font-bold" href="#">Dịch Vụ</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-sm uppercase tracking-widest font-bold" href="#">Cửa Hàng</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-sm uppercase tracking-widest font-bold" href="#">Đặt Lịch</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-sm uppercase tracking-widest font-bold" href="#">Bộ Sưu Tập</Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-gutter py-section-gap flex flex-col gap-section-gap">
        <BarberHeaderControls />
        <BarberStatsGrid />
        <ScheduleTimeline />
      </main>

      {/* Footer Component */}
      <footer className="bg-surface-container-lowest text-primary font-body-md text-body-md w-full py-section-padding border-t border-outline-gold mt-auto">
        <div className="max-w-7xl mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 lg:gap-section-gap">
          {/* Brand & Copyright */}
          <div className="flex flex-col gap-6 mb-8 md:mb-0">
            <div className="font-display-lg text-[32px] text-primary font-bold tracking-tighter serif-heading">
              HALLO BARBER
            </div>
            <p className="text-on-surface-variant uppercase text-[10px] tracking-[0.4em]">© 2024 HALLO BARBER. BẢO LƯU MỌI QUYỀN.</p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            <div className="flex flex-col gap-4">
              <Link className="text-on-surface-variant hover:text-primary transition-colors text-[12px] uppercase tracking-widest" href="#">Vị Trí</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors text-[12px] uppercase tracking-widest" href="#">Liên Hệ</Link>
            </div>
            <div className="flex flex-col gap-4">
              <Link className="text-on-surface-variant hover:text-primary transition-colors text-[12px] uppercase tracking-widest" href="#">Chính Sách Bảo Mật</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors text-[12px] uppercase tracking-widest" href="#">Điều Khoản Dịch Vụ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
