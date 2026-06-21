"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no bookingId, just redirect back
    if (!bookingId) {
      router.push("/");
      return;
    }

    setBooking({
      id: searchParams.get("id")?.slice(-8).toUpperCase() || "HB-8829-X",
      serviceName: searchParams.get("service") || "Combo Di Sản",
      price: searchParams.get("price") || "850000",
      barberName: searchParams.get("barber") || "Hoàng Anh",
      barberTitle: searchParams.get("title") || "Chuyên gia cắt tỉa",
      time: searchParams.get("time") || "11:00",
      dateStr: searchParams.get("dateStr") || "Thứ Tư, 4 Tháng 12, 2024"
    });
    
    setIsLoading(false);
  }, [bookingId, router, searchParams]);

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md flex flex-col">
      <main className="flex-grow pt-32 pb-32 flex items-center justify-center relative overflow-hidden">
        {/* Atmospheric Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20"></div>
        
        <div className="w-full max-w-2xl px-4 md:px-0 relative z-10">
          {/* Success Animation & Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-primary mb-6 shadow-[0_0_15px_rgba(255,222,165,0.3)]">
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-headline-lg md:text-[40px] text-[32px] text-primary tracking-tight">Đặt Lịch Thành Công!</h1>
            <p className="font-body-md text-on-surface-variant mt-2">Cảm ơn bạn đã tin tưởng dịch vụ tại Heritage Barbers.</p>
            
            <div className="mt-8 flex items-center justify-center max-w-md mx-auto px-4">
              <div className="flex items-center w-full">
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="absolute -bottom-6 text-[10px] font-label-md text-primary whitespace-nowrap">Dịch Vụ</span>
                </div>
                <div className="flex-grow h-[2px] bg-primary mx-2"></div>
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="absolute -bottom-6 text-[10px] font-label-md text-primary whitespace-nowrap">Barber</span>
                </div>
                <div className="flex-grow h-[2px] bg-primary mx-2"></div>
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="absolute -bottom-6 text-[10px] font-label-md text-primary whitespace-nowrap">Thời Gian</span>
                </div>
                <div className="flex-grow h-[2px] bg-primary mx-2"></div>
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="absolute -bottom-6 text-[10px] font-label-md text-primary whitespace-nowrap">Hoàn Tất</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="glass-card p-8 rounded-xl space-y-8 bg-surface-container-high/60 backdrop-blur-xl border border-outline-variant">
            {/* ID Banner */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-outline-variant/50 pb-6">
              <div>
                <span className="text-primary/70 font-label-md block mb-1">MÃ ĐẶT LỊCH</span>
                <div className="font-headline-md text-on-surface tracking-widest font-bold">HB-{booking.id}</div>
              </div>
              <div className="text-left md:text-right">
                <span className="text-primary/70 font-label-md block mb-1">TRẠNG THÁI</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Đã Xác Nhận
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-outline-variant/50 shrink-0">
                  <span className="material-symbols-outlined text-primary/70">content_cut</span>
                </div>
                <div>
                  <span className="font-label-md text-on-surface-variant">Dịch Vụ</span>
                  <p className="font-headline-sm text-on-surface mt-0.5">{booking.serviceName}</p>
                  <p className="font-body-md text-primary/80 mt-0.5">{Number(booking.price).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-outline-variant/50 shrink-0">
                  <span className="material-symbols-outlined text-primary/70">face</span>
                </div>
                <div>
                  <span className="font-label-md text-on-surface-variant">Barber</span>
                  <p className="font-headline-sm text-on-surface mt-0.5">{booking.barberName}</p>
                  <p className="font-body-md text-on-surface-variant mt-0.5">{booking.barberTitle}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:col-span-2">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-outline-variant/50 shrink-0">
                  <span className="material-symbols-outlined text-primary/70">calendar_today</span>
                </div>
                <div>
                  <span className="font-label-md text-on-surface-variant">Thời Gian</span>
                  <p className="font-headline-sm text-on-surface mt-0.5">{booking.time}, {booking.dateStr}</p>
                  <p className="font-body-md text-on-surface-variant mt-0.5">Vui lòng đến trước 5 phút để được phục vụ tốt nhất.</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-surface-container p-4 rounded border-l-2 border-primary">
              <p className="font-body-md text-on-surface-variant">
                Một email xác nhận đã được gửi đến bạn. Nếu có thay đổi, vui lòng liên hệ hotline sớm nhất.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 flex flex-col gap-4">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-primary text-on-primary h-14 rounded-lg font-headline-sm font-bold flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform active:scale-95"
              >
                Về Trang Chủ
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push('/customer/dashboard')}
                  className="border border-outline-variant text-on-surface h-12 rounded-lg font-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-primary/70">account_circle</span>
                  Xem Hồ Sơ
                </button>
                <button 
                  onClick={() => window.print()}
                  className="border border-outline-variant text-on-surface h-12 rounded-lg font-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-primary/70">download</span>
                  Lưu Hoá Đơn
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
