"use client";

import React from 'react';
import Link from 'next/link';

const services = [
  {
    title: 'Cắt Tóc Đế Vương (Combo 7 Bước)',
    duration: '45 phút'
  },
  {
    title: 'Cạo Râu Khăn Nóng',
    duration: '15 phút'
  }
];

export default function StaffCheckInConfirmation() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#111] text-[#e0e0e0] font-sans p-4 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop')"
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-4 bg-[#1a1a1a]">
            <svg className="w-7 h-7 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide mb-1">Check-in Thành Công</h1>
          <p className="text-sm text-gray-400">Khách hàng đã sẵn sàng cho dịch vụ.</p>
        </div>

        <div className="w-full bg-[#161616]/90 border border-[#2a2a2a] rounded-2xl p-6 md:p-8 backdrop-blur-md mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#2a2a2a] gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 tracking-wide">Anh Nguyễn Văn A</h2>
              <p className="text-sm text-gray-400 font-mono flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                090 123 4567
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-[#d4af37] uppercase tracking-widest block mb-0.5">Mã Booking</span>
              <span className="text-2xl font-mono font-extrabold text-white tracking-wider">HB-8824</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-[#2a2a2a]">
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-3">Barber Phụ Trách</span>
              <div className="flex items-center gap-3 bg-[#1f1f1f]/60 p-3 rounded-xl border border-[#2d2d2d]">
                <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-[#444]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?auto=format&fit=crop&w=150&q=80')" }} />
                <div>
                  <h3 className="text-base font-bold text-white">Trần Tuấn</h3>
                  <p className="text-xs text-gray-400">Senior Barber</p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-3">Vị Trí Cắt</span>
              <div className="flex items-center gap-3 bg-[#1f1f1f]/60 p-3 rounded-xl border border-[#2d2d2d]">
                <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-[#d4af37] border border-[#3d3d3d]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ghế Số 03</h3>
                  <p className="text-xs text-[#d4af37] font-medium tracking-wide">Khu Vực VIP</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-6">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-4">Dịch Vụ</span>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.title} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <span className="text-gray-400 text-xs">✂</span>
                    {service.title}
                  </div>
                  <span className="font-mono text-gray-400 shrink-0">{service.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-dashed border-[#2d2d2d] my-2 -mx-6 md:-mx-8"></div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1">Thời Gian Vào</span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-3xl font-mono font-bold text-white">14:30</span>
                <span className="text-sm text-gray-400">Hôm nay</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="p-2 bg-white rounded-xl shadow-lg">
                <div className="w-20 h-20 bg-cover bg-center" style={{ backgroundImage: "url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HB-8824&color=111111')" }} />
              </div>
              <span className="text-[10px] text-gray-500 italic tracking-wider">Quét để xem chi tiết</span>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 bg-[#fddba3] text-black font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/5 hover:bg-[#fccf86] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            In Phiếu & QR
          </button>
          <Link href="/staff/pos" className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 border border-[#3a3a3a] text-gray-300 font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-[#1f1f1f] hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về Màn POS
          </Link>
        </div>
      </div>
    </div>
  );
}
