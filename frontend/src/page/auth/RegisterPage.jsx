"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kích hoạt animation khi component mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-md">
        <div className="flex justify-between items-center px-6 md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <Link href="/" className="text-headline-sm md:text-headline-md font-bold tracking-tighter text-primary uppercase">
            HALLO BARBER
          </Link>
          <div className="hidden md:flex gap-8">
            <Link className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="/">Trang chủ</Link>
            <Link className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="/services">Dịch vụ</Link>
            <Link className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="/team">Đội ngũ</Link>
            <Link className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="/about">Về chúng tôi</Link>
          </div>
          <Link 
            href="/customer/booking" 
            className="bg-primary text-on-primary px-6 py-2 font-body-md font-bold hover:scale-95 transition-transform duration-150 rounded"
          >
            Đặt Lịch Hẹn
          </Link>
        </div>
      </nav>

      {/* Main Registration Container */}
      <main 
        className="relative z-10 w-full max-w-[500px] px-margin-mobile md:px-0 py-section-padding mt-16 flex-grow flex items-center justify-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="glass-panel border border-outline-variant p-8 md:p-12 shadow-2xl relative w-full rounded-xl">
          {/* Decorative Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-primary"></div>
          
          <header className="text-center mb-10">
            <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight mb-2 uppercase">Gia Nhập Cộng Đồng</h1>
            <p className="text-body-md font-body-md text-on-surface-variant">Trải nghiệm phong cách quý ông thượng lưu cùng HALLO BARBER.</p>
          </header>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Họ và Tên</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">person</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                  placeholder="Nguyễn Văn A" 
                  type="text" 
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                  placeholder="email@vi-du.com" 
                  type="email" 
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Số Điện Thoại</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">call</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                  placeholder="090 123 4567" 
                  type="tel" 
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Mật Khẩu</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                    placeholder="••••••••" 
                    type="password" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Xác Nhận</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">verified_user</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                    placeholder="••••••••" 
                    type="password" 
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input 
                  className="w-5 h-5 rounded bg-surface-container border-outline-gold text-primary focus:ring-primary/50 focus:ring-offset-0 transition-all cursor-pointer" 
                  id="terms" 
                  type="checkbox" 
                />
              </div>
              <label className="text-label-md font-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                Tôi đồng ý với <Link className="text-primary hover:underline transition-all underline-offset-4" href="#">Điều khoản & Điều kiện</Link>
              </label>
            </div>

            {/* Action Button */}
            <button className="w-full bg-primary text-on-primary py-4 text-body-lg font-bold hover:bg-gold-dim transition-all duration-300 transform active:scale-95 shadow-lg shadow-primary/10 rounded uppercase tracking-widest">
              Tạo Tài Khoản Ngay
            </button>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-body-md font-body-md text-on-surface-variant">
                Bạn đã có tài khoản? 
                <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1 transition-all" href="/login/customer">Đăng nhập tại đây</Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <div className="w-full relative z-10">
        <Footer />
      </div>
    </div>
  );
}
