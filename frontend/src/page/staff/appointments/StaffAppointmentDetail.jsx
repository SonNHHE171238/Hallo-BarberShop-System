"use client";

import React, { useState } from 'react';

export default function StaffAppointmentDetail() {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCompleteService = () => {
    setIsCompleted(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] text-gray-200 font-sans antialiased p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <a href="/staff/appointments" className="text-xs uppercase tracking-wider text-gray-400 hover:text-white flex items-center gap-2 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Quay lại bảng điều khiển
            </a>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#1e293b] text-[#38bdf8] text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full inline-block"></span>
                {isCompleted ? 'Hoàn thành' : 'Đang phục vụ'}
              </span>
              <span className="text-gray-500 font-mono text-sm">#HB-8492</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Phiên Dịch Vụ Của Anh Khang</h1>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 min-w-[200px] justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xs uppercase tracking-wider font-medium">Thời gian thực hiện</span>
            </div>
            <span className="text-2xl font-mono font-bold text-[#d97706]">00:45:24</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2a2a]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Thông Tin Khách Hàng
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center font-bold text-lg text-gray-300">K</div>
                <div>
                  <h3 className="text-base font-bold text-white">Trần Anh Khang</h3>
                  <p className="text-sm text-gray-400 font-mono mb-1">📞 0987 654 321</p>
                  <span className="bg-[#2e2516] text-[#eab308] border border-[#ca8a04]/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Hội Viên Vàng</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2a2a]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg>
                Barber Phụ Trách
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-[#333]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80')" }}></div>
                <div>
                  <h3 className="text-base font-bold text-white">Lê Minh Tuấn</h3>
                  <p className="text-xs text-[#ca8a04] font-medium tracking-wide uppercase">Master Barber</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#2a2a2a]">
                <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  Danh Sách Dịch Vụ
                </h2>
                <button className="text-xs font-bold text-[#e2e8f0] hover:text-white uppercase tracking-wider flex items-center gap-1">
                  + Thêm dịch vụ
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-[#121212] border border-[#232323] rounded-lg p-4 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base">Cắt Tóc Đế Vương (Signature Cut)</h4>
                    <p className="text-xs text-gray-400 mt-1">Tư vấn kiểu tóc, cắt tạo kiểu, gội đầu thư giãn 2 lần, vuốt sáp/pomade cao cấp.</p>
                  </div>
                  <span className="text-base font-bold text-white font-mono shrink-0">250,000 đ</span>
                </div>
                <div className="bg-[#121212] border border-[#232323] rounded-lg p-4 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base">Cạo Râu Khăn Nóng Hoàng Gia</h4>
                    <p className="text-xs text-gray-400 mt-1">Đắp khăn nóng, sử dụng kem cạo râu cao cấp, massage mặt nhẹ nhàng.</p>
                  </div>
                  <span className="text-base font-bold text-white font-mono shrink-0">150,000 đ</span>
                </div>
                <div className="bg-[#121212] border border-[#232323] rounded-lg p-4 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base">Sáp Vuốt Tóc Reuzel Blue (Sản phẩm)</h4>
                    <p className="text-xs text-gray-400 mt-1">Số lượng: 1</p>
                  </div>
                  <span className="text-base font-bold text-white font-mono shrink-0">380,000 đ</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#2a2a2a] pt-4 mt-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Tổng phụ phí</span>
                <span className="font-mono text-gray-300">780,000 đ</span>
              </div>
              <div className="flex justify-between text-sm text-[#f87171] mb-6">
                <span>Chiết khấu hội viên (5%)</span>
                <span className="font-mono">- 39,000 đ</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Tổng cần thanh toán</span>
                  <span className="text-[10px] text-gray-500 italic">Đã bao gồm VAT</span>
                </div>
                <span className="text-3xl font-extrabold text-[#fef08a] font-mono tracking-tight">741,000 đ</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#2a2a2a] pt-4">
          <button className="px-6 py-3 border border-[#3a3a3a] text-gray-300 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#222] hover:text-white transition-all">
            Lưu nháp
          </button>
          <button
            onClick={handleCompleteService}
            className="px-6 py-3 bg-[#fef08a] text-black font-bold text-sm uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 hover:bg-[#fde047] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {isCompleted ? 'Đã hoàn thành' : 'Hoàn thành & thanh toán'}
          </button>
        </footer>
      </div>
    </div>
  );
}
