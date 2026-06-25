"use client";

import React from 'react';
import Link from 'next/link';

export default function StaffPaymentSuccess() {
  return (
    <div className="relative min-h-screen bg-[#111111] text-gray-300 font-sans flex items-center justify-center p-4 overflow-x-hidden">
      <div className="w-full max-w-lg bg-[#161616] border border-[#262626] rounded-2xl p-8 md:p-12 text-center shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-xl border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-6 bg-[#1e1e1e]">
          <svg className="w-8 h-8 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide mb-2">Thanh toán thành công!</h1>
        <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">Hệ thống đã ghi nhận khoản thanh toán của bạn.</p>

        <div className="bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl py-6 px-4 my-8 max-w-md mx-auto">
          <span className="text-[11px] text-gray-500 uppercase tracking-widest block mb-1 font-semibold">Số tiền nhận được</span>
          <span className="text-3xl md:text-4xl font-mono font-bold text-[#fddba3] tracking-wide">450.000 đ</span>
        </div>

        <div className="space-y-3.5 max-w-md mx-auto pt-2">
          <button className="w-full bg-[#fddba3] text-black font-bold text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/5 hover:bg-[#fccf86] transition-all uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            In Hóa Đơn Chính Thức
          </button>

          <Link href="/staff/dashboard" className="w-full bg-transparent border border-[#333333] text-gray-300 font-bold text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 hover:bg-[#1f1f1f] hover:text-white transition-all uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Về Bảng Điều Khiển
          </Link>
        </div>
      </div>
    </div>
  );
}
