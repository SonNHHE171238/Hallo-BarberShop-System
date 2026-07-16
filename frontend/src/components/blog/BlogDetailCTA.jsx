import React from "react";
import Link from "next/link";

export default function BlogDetailCTA() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-32">
      <div className="relative bg-surface-container-high rounded-2xl overflow-hidden border border-outline-gold p-8 md:p-16 flex flex-col items-center text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img 
            alt="Vintage barber wallpaper texture" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3H3W_O7XbmFHHi6BbG_B56dT4yG43TOHsOS4pZxs5K1q9xuUBQHr_sGj2skmGQ4KR9MpIy2wahq6KM-BRni7M_3I9DxnTpeTndc4-tvVIc6bLxc63ZOCSSlzPGFhNP7g_SPymu9TgV5tSXZxXVcorYpqEtumVp0JoLxKCY5CClHX8kNZ9dVftFrhsOkJUOhEBWH-Sq62ctIdhniSgGTdFCInuz2NSzghr5aoPL3E6kTcJ-jz77IhhQOCNHurWXpfJaYgMYJ-nZkHR" 
          />
        </div>
        <h2 className="relative font-headline-lg text-headline-lg md:text-5xl md:leading-tight text-on-surface mb-6 max-w-2xl">
          Sẵn sàng cho một diện mạo mới đầy tự tin?
        </h2>
        <p className="relative text-body-lg text-on-surface-variant mb-10 max-w-xl">
          Đặt lịch ngay để được trải nghiệm không gian sang trọng và dịch vụ chuyên nghiệp từ những bàn tay vàng tại HALLO BARBER.
        </p>
        <div className="relative flex flex-col md:flex-row gap-4">
          <Link href="/booking">
            <button className="bg-primary text-on-primary px-10 py-4 rounded-lg font-bold text-headline-sm hover:bg-primary-fixed-dim transition-all active:scale-95 shadow-lg shadow-primary/20 w-full md:w-auto">
              Đặt Lịch Ngay
            </button>
          </Link>
          <Link href="/services">
            <button className="bg-transparent border-2 border-primary text-primary px-10 py-4 rounded-lg font-bold text-headline-sm hover:bg-primary/10 transition-all active:scale-95 w-full md:w-auto">
              Xem Bảng Giá
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
