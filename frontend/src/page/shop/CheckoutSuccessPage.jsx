"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  // Nếu có truyền param từ trang checkout sang, ta sẽ ưu tiên hiển thị
  const orderCode = searchParams.get('orderCode') || "HB-98231-VN";
  const totalAmount = searchParams.get('total') 
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(searchParams.get('total')) 
    : "1.250.000₫";

  // Ngày giao dự kiến (2 ngày sau)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDate = deliveryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    // Micro-interaction for the loyalty progress bar
    const progressBar = document.querySelector('.loyalty-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
      setTimeout(() => {
        progressBar.style.transition = 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)';
        progressBar.style.width = '75%';
      }, 500);
    }
  }, []);

  return (
    <div className="bg-surface-obsidian text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(32, 31, 31, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid #4e4639;
        }
        .gold-glow {
            text-shadow: 0 0 15px rgba(255, 222, 165, 0.3);
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
      `}} />

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface-obsidian/80 backdrop-blur-md border-b border-outline-variant h-20 flex items-center justify-center px-margin-mobile md:px-margin-desktop">
        <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">HALLO BARBER</h1>
      </header>

      <main className="flex-grow pt-32 pb-section-padding flex flex-col items-center px-margin-mobile">
        {/* Hero Success Section */}
        <div className="max-w-container-max w-full text-center flex flex-col items-center">
          <div className="mb-8 animate-float">
            <span className="material-symbols-outlined text-[80px] md:text-[120px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary gold-glow mb-4 tracking-tight uppercase">
            CẢM ƠN BẠN ĐÃ MUA SẮM!
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Chúng tôi sẽ thông báo cho bạn ngay khi kiện hàng được gửi đi.
          </p>

          {/* Layout Grid: Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter w-full max-w-4xl">
            {/* Order Summary Card */}
            <div className="md:col-span-8 glass-card p-base md:p-8 rounded-lg text-left flex flex-col justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">receipt_long</span>
                  Chi Tiết Đơn Hàng
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                    <span className="font-label-md text-label-md text-on-surface-variant">MÃ ĐƠN HÀNG</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold tracking-widest uppercase">#{orderCode}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                    <span className="font-label-md text-label-md text-on-surface-variant">DỰ KIẾN GIAO HÀNG</span>
                    <span className="font-label-md text-label-md text-on-surface">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">TỔNG CỘNG</span>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty / Rewards Card */}
            <div className="md:col-span-4 glass-card p-base md:p-8 rounded-lg flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-primary">star</span>
              </div>
              <span className="material-symbols-outlined text-4xl text-primary mb-4">loyalty</span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Thành Viên</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Bạn vừa tích lũy thêm <span className="text-primary font-bold">+150 điểm</span> cho đơn hàng này.
              </p>
              <div className="w-full h-1 bg-outline-variant rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-primary shadow-[0_0_10px_rgba(255,222,165,0.5)] loyalty-progress-bar"></div>
              </div>
              <p className="mt-4 font-label-md text-label-md text-gold-dim">950 / 1200 điểm tới Hạng Vàng</p>
            </div>

            {/* Action Section */}
            <div className="md:col-span-12 mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/shop" className="bg-primary text-on-primary font-headline-sm text-headline-sm px-12 py-4 rounded-lg hover:brightness-110 active:scale-95 transition-all duration-300 uppercase tracking-widest shadow-lg shadow-primary/20 text-center">
                TIẾP TỤC MUA SẮM
              </Link>
              <button className="border-2 border-primary text-primary font-headline-sm text-headline-sm px-12 py-4 rounded-lg hover:bg-primary/5 active:scale-95 transition-all duration-300 uppercase tracking-widest">
                THEO DÕI ĐƠN HÀNG
              </button>
            </div>
          </div>
        </div>

        {/* Atmospheric Image Section */}
        <section className="mt-24 w-full max-w-container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter h-64 md:h-96">
            <div className="relative rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
              <div className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCmw9K7ZLPYx7OlsEFY86cp6LeRzxAoHTddGkIor7-PQhj8ETTiYq8gBnlO8epyeO4qmwvAhdA3tbPCFVDKkwMdivwh27m2_KJr03eTcgonQ1qllA468DhiYKEjQHW0cU2XVxOPoFFKxwzTY4FWGSJpgsh6WrTJRSvV-h1skyN6utr-QLIg4pdVE91_6i6FOgAlQY1pParY83GF2sNJ1gN7FV_eenhbv7Qd8eSRsVc_8dCRWb1a4d5O4lrEZrjo5eXWYBXcasZFTTAE')" }}>
              </div>
              <div className="absolute bottom-8 left-8 z-20">
                <p className="font-label-md text-label-md text-primary tracking-widest uppercase">Precision & Heritage</p>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
              <div className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA4oOWERV-eMjDW0Kx_sUwb5PKW9tUySucmrc6Bok329cEz6x3jccuaR1wgQc_wYW97VT6vchmtsLQOF9FmYpqAkzPSVYw2_MXGAddmQHm9BSE8Y8Ikf3J6H-GLj6h8G8IB06ZBHOe4OkC8Q2Q_hnn22roW23EuNDiUW5cYav2X9W7av-F8TGgL36p8XrQuBDwCTnwB7AahkutdTvd0CD76VnnRuY20XdZmA13slcTxzoqsXB4RLYxIAOf6_D-eIxdPujeml3jjyuNl')" }}>
              </div>
              <div className="absolute bottom-8 left-8 z-20">
                <p className="font-label-md text-label-md text-primary tracking-widest uppercase">Premium Grooming</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin-desktop py-section-padding max-w-container-max mx-auto">
          <div className="flex flex-col gap-4">
            <span className="font-headline-sm text-headline-sm text-primary">HALLO BARBER</span>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
              Di sản của sự chính xác. Chúng tôi mang đến trải nghiệm cắt tóc và chăm sóc diện mạo đẳng cấp nhất cho quý ông hiện đại.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-md text-label-md text-primary uppercase">Quick Links</span>
            <div className="flex flex-col gap-2">
              <a className="text-on-surface-variant hover:text-gold-dim transition-colors" href="#">Operating Hours</a>
              <a className="text-on-surface-variant hover:text-gold-dim transition-colors" href="#">Contact Us</a>
              <a className="text-on-surface-variant hover:text-gold-dim transition-colors" href="#">Privacy Policy</a>
              <a className="text-on-surface-variant hover:text-gold-dim transition-colors" href="#">Terms of Service</a>
              <a className="text-on-surface-variant hover:text-gold-dim transition-colors" href="#">Locations</a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-md text-label-md text-primary uppercase">Connect</span>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">brand_awareness</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">public</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">mail</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4">
              © 2024 HALLO BARBER. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
