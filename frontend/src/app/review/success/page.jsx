"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ReviewSuccessPage() {
  const searchParams = useSearchParams();
  const [points, setPoints] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Read from URL query params
    const p = parseInt(searchParams.get('points')) || 0;
    const t = parseInt(searchParams.get('total')) || 0;
    setPoints(p);
    setTotal(t);
  }, [searchParams]);

  return (
    <div className="bg-background min-h-screen text-on-surface flex items-center justify-center p-margin-mobile md:p-margin-desktop overflow-hidden relative selection:bg-primary selection:text-on-primary">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxMzEzMTMiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+')] opacity-50 mix-blend-overlay"></div>
      </div>

      {/* Main Content Canvas */}
      <main className="w-full max-w-2xl relative z-10 animate-in zoom-in-95 fade-in duration-700">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        <div className="bg-surface-container/60 backdrop-blur-xl border border-outline-variant rounded-xl p-8 md:p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center mb-8 bg-surface-container relative">
            <div className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-20"></div>
            <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          
          {/* Headers */}
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg bg-clip-text text-transparent bg-gradient-to-br from-primary to-gold-dim mb-4 uppercase tracking-widest">
            Cảm ơn bạn đã đánh giá!
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant mb-2">
            Phản hồi của bạn giúp HALLO BARBER không ngừng hoàn thiện dịch vụ.
          </p>
          
          {/* Reward Section (Conditionally Rendered if points > 0) */}
          {points > 0 && (
            <div className="my-8 w-full animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
              <div className="bg-surface-container-high rounded-lg p-6 border border-outline-variant relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <h2 className="text-headline-md font-headline-md text-primary">Bạn vừa nhận được +{points} điểm tri ân</h2>
                </div>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  Tổng điểm hiện tại: <strong className="text-on-surface font-bold">{new Intl.NumberFormat('vi-VN').format(total)} điểm</strong>
                </p>
              </div>
            </div>
          )}

          {!points && (
             <div className="my-8 w-full border-t border-outline-variant/30"></div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/" className="bg-primary text-on-primary font-label-md py-4 px-8 rounded uppercase tracking-wider hover:bg-primary-fixed transition-colors duration-300 active:scale-95 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">home</span>
              Về trang chủ
            </Link>
            <Link href="/shop" className="bg-transparent border-2 border-outline-variant text-on-surface font-label-md py-4 px-8 rounded uppercase tracking-wider hover:border-primary hover:text-primary transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
