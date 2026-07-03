"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { staffDashboardService } from '@/services/staffDashboard.service';
import toast from 'react-hot-toast';

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmCompletion = async () => {
    if (!window.confirm('Xác nhận khách đã chuyển khoản và hoàn thành đơn?')) return;
    setIsConfirming(true);
    try {
      await staffDashboardService.updateStatus(id, {
        status: 'completed',
        amountPaid: booking.totalPrice || 0,
        paymentMethod: 'bank_transfer'
      });
      toast.success('Xác nhận thanh toán và hoàn thành thành công!');
      setBooking(prev => ({
        ...prev,
        status: 'completed',
        paymentStatus: 'paid',
        amountPaid: prev.totalPrice || 0
      }));
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    if (!id || id === 'undefined') {
      setIsLoading(false);
      return;
    }
    const fetchBooking = async () => {
      try {
        const res = await staffDashboardService.getBookingById(id);
        if (res && res._id) {
          setBooking(res);
        }
      } catch (error) {
        toast.error("Không thể lấy thông tin lịch hẹn");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleCompleteService = () => {
    router.push(`/staff/payment?id=${id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#121212] flex justify-center items-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full min-h-screen bg-[#121212] flex justify-center items-center text-white">
        Không tìm thấy lịch hẹn.
      </div>
    );
  }

  const isCompleted = booking.status === 'completed';
  const isCancelledOrNoShow = booking.status === 'cancelled' || booking.status === 'no_show';
  const amountPaid = booking.amountPaid || 0;
  const remaining = Math.max(0, booking.totalPrice - amountPaid);

  return (
    <div className="w-full bg-[#121212] text-gray-200 font-sans antialiased p-4 h-[calc(100vh-100px)] flex flex-col overflow-hidden rounded-xl">
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <button onClick={() => router.back()} className="text-xs uppercase tracking-wider text-gray-400 hover:text-white flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Quay lại bảng điều khiển
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${isCompleted ? 'bg-green-900/50 text-green-400' : isCancelledOrNoShow ? 'bg-red-900/50 text-red-400' : 'bg-[#1e293b] text-[#38bdf8]'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${isCompleted ? 'bg-green-400' : isCancelledOrNoShow ? 'bg-red-400' : 'bg-[#38bdf8]'}`}></span>
                  {isCompleted ? 'Hoàn thành' : isCancelledOrNoShow ? 'Khách không đến quán' : 'Đang phục vụ'}
                </span>
                <span className="text-gray-500 font-mono text-sm">#{booking._id.slice(-6).toUpperCase()}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Phiên Dịch Vụ Của {(booking.customerName || 'Khách').split(' ').pop()}</h1>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex items-center gap-4 min-w-[180px] justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="material-symbols-outlined text-xl text-[#d97706]">schedule</span>
                <span className="text-[11px] uppercase tracking-wider font-medium">Giờ hẹn</span>
              </div>
              <span className="text-xl font-mono font-bold text-[#d97706]">{booking.time}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2a2a]">
                  <span className="material-symbols-outlined text-base">person</span>
                  Thông Tin Khách Hàng
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center font-bold text-base text-gray-300">
                    {(booking.customerName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{booking.customerName || 'Khách Vãng Lai'}</h3>
                    <p className="text-xs text-gray-400 font-mono mb-1">📞 {booking.customerPhone || 'N/A'}</p>
                    <span className="bg-[#2e2516] text-[#eab308] border border-[#ca8a04]/30 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">{booking.customerType}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2a2a]">
                  <span className="material-symbols-outlined text-base">content_cut</span>
                  Barber Phụ Trách
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cover bg-center border border-[#333] flex items-center justify-center bg-[#2a2a2a] font-bold text-base text-gray-300">
                    {(booking.barberName && booking.barberName !== 'Auto') ? booking.barberName.charAt(0) : 'A'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{booking.barberName || 'Sắp xếp tự động'}</h3>
                    <p className="text-[10px] text-[#ca8a04] font-medium tracking-wide uppercase">
                      {(booking.barberName === 'Auto' || !booking.barberName) ? 'Sắp xếp tự động' : 'Barber'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#2a2a2a]">
                  <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">list_alt</span>
                    Danh Sách Dịch Vụ
                  </h2>
                  {!isCompleted && !isCancelledOrNoShow && (
                    <button className="text-[11px] font-bold text-[#e2e8f0] hover:text-white uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Thêm dịch vụ
                    </button>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {booking.services?.map(service => (
                    <div key={service._id} className="bg-[#121212] border border-[#232323] rounded-lg p-3.5 flex justify-between items-center gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{service.name}</h4>
                        <p className="text-[11px] text-gray-400 mt-1">Thời gian: {service.durationMinutes} phút</p>
                      </div>
                      <span className="text-sm font-bold text-white font-mono shrink-0">{(service.price || 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                  {!booking.services?.length && (
                    <div className="text-center text-gray-500 py-3 text-sm">Chưa có dịch vụ nào được chọn</div>
                  )}
                </div>
              </div>

              {!isCancelledOrNoShow && (
                <div className="border-t border-[#2a2a2a] pt-4 mt-auto">
                  <div className="flex justify-between text-xs text-gray-400 mb-3">
                    <span>Tổng tiền dịch vụ</span>
                    <span className="font-mono text-gray-300">{(booking.totalPrice || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#f87171] mb-5">
                    <span>Đã đặt cọc / Thanh toán</span>
                    <span className="font-mono">- {(amountPaid || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-[#2a2a2a]/50 mb-4">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Cần thanh toán thêm</span>
                    </div>
                    <span className="text-2xl font-extrabold text-[#fef08a] font-mono tracking-tight">{(remaining || 0).toLocaleString('vi-VN')} đ</span>
                  </div>

                  {!isCompleted && booking.status !== 'cancelled' && (
                    <button 
                      onClick={handleConfirmCompletion}
                      disabled={isConfirming}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-on-primary font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isConfirming ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">task_alt</span>
                          Xác nhận đã chuyển khoản & Hoàn thành
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#2a2a2a] pt-4 mt-2 shrink-0">
          <button 
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-[#3a3a3a] text-gray-300 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#222] hover:text-white transition-all"
          >
            Đóng
          </button>
          {!isCancelledOrNoShow && (
            !isCompleted && remaining > 0 ? (
              <button
                onClick={handleCompleteService}
                className="px-5 py-2.5 bg-[#fef08a] text-black font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 hover:bg-[#fde047] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                Thanh toán {remaining.toLocaleString('vi-VN')} đ
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 bg-green-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 opacity-80 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {remaining === 0 && !isCompleted ? 'Chờ hoàn thành' : 'Đã hoàn thành'}
              </button>
            )
          )}
        </footer>
      </div>
    </div>
  );
}
