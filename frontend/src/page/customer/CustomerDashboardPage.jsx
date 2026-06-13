"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import DashboardHero from "@/components/customer/DashboardHero";
import NextAppointment from "@/components/customer/NextAppointment";
import LoyaltyStats from "@/components/customer/LoyaltyStats";
import RewardsSection from "@/components/customer/RewardsSection";
import CuratedProducts from "@/components/customer/CuratedProducts";

export default function CustomerDashboardPage() {
  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md">
      {/* TopNavBar */}
      <nav className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-gutter flex justify-between items-center h-20">
          <Link href="/" className="font-display-lg text-headline-lg font-bold tracking-tighter text-on-surface">
            HALLO BARBER
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-sm uppercase" href="#">Dịch vụ</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-sm uppercase" href="/shop">Cửa hàng</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-sm uppercase" href="/booking">Đặt lịch</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-sm uppercase" href="#">Thư viện</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">search</span>
            {/* Thay "Đăng nhập" bằng icon User/Đăng xuất */}
            <div className="flex items-center gap-3 cursor-pointer group relative">
              <span className="font-label-md text-sm uppercase font-bold text-on-surface group-hover:text-primary transition-colors hidden sm:block">
                Arthur
              </span>
              <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">person</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-gutter py-12 flex flex-col gap-16">
        <DashboardHero />
        
        {/* Bento Grid Dashboard */}
        <section className="bento-grid">
          <NextAppointment />
          <LoyaltyStats />
        </section>

        <RewardsSection />
        <CuratedProducts />
      </main>

      <Footer />
    </div>
  );
}
