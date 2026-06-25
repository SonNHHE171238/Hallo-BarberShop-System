"use client";

import React from 'react';
import Link from 'next/link';

export default function StaffPaymentPopup() {
  return (
    <>
      {/* ================= 1. GIAO DIỆN NỀN PHIẾU DỊCH VỤ (LÀM MỜ) ================= */}
      <div className="max-w-6xl mx-auto opacity-40 pointer-events-none select-none p-6 bg-[#121212] min-h-screen text-gray-200 font-sans antialiased"> 
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#1e293b] text-[#38bdf8] text-xs font-semibold px-2.5 py-1 rounded-full uppercase">Đang phục vụ</span>
              <span className="text-gray-500 font-mono text-sm">#HB-8492</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Phiên Dịch Vụ Của Anh Khang</h1>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl font-mono font-bold text-[#d97706]">00:45:24</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="text-base font-bold text-white">Trần Anh Khang</h3>
            </div>
          </div>
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex justify-between items-end pt-2">
              <span className="text-3xl font-extrabold text-[#fef08a] font-mono">741,000 đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. POPUP / MODAL QUÉT MÃ QR (FIXED PHỦ LÊN TRÊN) ================= */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1c1c1c] border border-[#2b2b2b] rounded-2xl shadow-2xl overflow-hidden relative">
          
          {/* Nút đóng ✕ */}
          <Link href="/staff/appointments/detail" className="absolute top-4 right-4 w-7 h-7 bg-[#262626] text-gray-400 hover:text-white rounded-full flex items-center justify-center text-xs border border-[#333333] transition-all">
            ✕
          </Link>

          {/* Tiền thanh toán */}
          <div className="p-6 text-center border-b border-[#2b2b2b] pt-8 bg-[#222222]/40">
            <div className="w-10 h-10 bg-[#292929] border border-[#d4af37]/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-[#d4af37]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-mono font-bold text-white tracking-wide">1,026,000 đ</h3>
            <p className="text-xs text-gray-400 mt-1 tracking-wider uppercase font-medium">Quét mã để thanh toán</p>
          </div>

          {/* QR Code & Thông tin ngân hàng */}
          <div className="p-8 flex flex-col items-center bg-[#181818]/50">
            <div className="p-4 bg-white rounded-2xl shadow-lg mb-6 relative border border-gray-200">
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]" />
              
              <div className="w-40 h-40 bg-cover bg-center rounded" style={{ backgroundImage: "url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HalloBarber-1026000&color=111111')" }} />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-white tracking-wide">Ngân hàng TMCP Á Châu (ACB)</h4>
              <p className="text-xs text-gray-400 font-mono">STK: <span className="text-gray-200 font-bold">123456789</span></p>
              <p className="text-xs text-gray-500 font-mono tracking-wide uppercase">CTK: HALLO BARBER CO.</p>
            </div>
          </div>

          {/* Trạng thái chờ */}
          <div className="bg-[#1f1f1f] py-4 border-t border-[#2b2b2b] text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs text-amber-400/90 font-medium tracking-wide">Đang chờ thanh toán...</span>
          </div>

        </div>
      </div>
    </>
  );
}