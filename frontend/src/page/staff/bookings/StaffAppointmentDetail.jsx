"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { staffDashboardService } from '@/services/staffDashboard.service';
import toast from 'react-hot-toast';

export default function StaffAppointmentDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="w-full min-h-[calc(100vh-80px)] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">autorenew</span>
          <span className="font-label-md text-on-surface-variant uppercase tracking-widest text-sm animate-pulse">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex justify-center items-center">
        <div className="glass-panel p-8 text-center max-w-md w-full border border-outline-variant/30 rounded-2xl flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-50">search_off</span>
          <h3 className="font-headline-sm text-on-surface">Không tìm thấy lịch hẹn</h3>
          <p className="font-body-md text-on-surface-variant mb-4">Lịch hẹn này có thể đã bị xóa hoặc không tồn tại.</p>
          <button onClick={() => router.push('/staff/bookings')} className="px-6 py-2.5 rounded-lg bg-surface-container hover:bg-surface-variant text-primary font-label-md tracking-wider uppercase transition-all duration-300 active:scale-95 border border-outline-variant/50">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = booking.status === 'completed';
  const amountPaid = booking.amountPaid || 0;
  const remaining = Math.max(0, booking.totalPrice - amountPaid);
  
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'completed': return { text: 'Hoàn thành', icon: 'check_circle', color: 'text-success border-success/30 bg-success/10' };
      case 'cancelled': return { text: 'Đã hủy', icon: 'cancel', color: 'text-error border-error/30 bg-error/10' };
      case 'confirmed': return { text: 'Đã xác nhận', icon: 'event_available', color: 'text-info border-info/30 bg-info/10' };
      case 'pending': return { text: 'Đang chờ', icon: 'pending', color: 'text-warning border-warning/30 bg-warning/10' };
      default: return { text: 'Đang phục vụ', icon: 'sync', color: 'text-primary border-primary/30 bg-primary/10' };
    }
  };

  const statusInfo = getStatusDisplay(booking.status);

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 pt-6">
        <div>
          <button 
            onClick={() => router.push('/staff/bookings')} 
            className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4 font-label-md text-xs uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Quay lại quản lý lịch hẹn
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1.5 rounded-full border ${statusInfo.color} font-label-md text-xs uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm shadow-sm`}>
              <span className="material-symbols-outlined text-[14px]">{statusInfo.icon}</span>
              {statusInfo.text}
            </span>
            <span className="text-on-surface-variant font-mono text-sm tracking-wider">#{booking._id.slice(-6).toUpperCase()}</span>
          </div>
          <h1 className="font-headline-lg text-headline-md md:text-headline-lg text-on-surface tracking-tight uppercase group">
            Phiên Dịch Vụ Của {(booking.customerName || 'Khách').split(' ').pop()}
            <span className="block h-1 w-24 bg-gradient-to-r from-primary to-transparent mt-2 rounded-full opacity-70 group-hover:w-48 transition-all duration-500"></span>
          </h1>
        </div>

        <div className="glass-panel relative overflow-hidden bg-surface-container-low/40 border border-outline-gold/30 rounded-2xl p-4 md:px-6 md:py-4 flex items-center gap-5 min-w-[220px] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Giờ hẹn</span>
            <span className="font-display-md text-2xl font-bold text-primary tracking-tighter drop-shadow-sm">{booking.time}</span>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column - Info Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Customer Card */}
          <div className="glass-panel relative overflow-hidden bg-surface-container-low/60 border border-outline-variant/40 hover:border-outline-gold/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(212,175,55,0.05)] group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-500 group-hover:bg-primary/10"></div>
            <h2 className="font-label-md text-xs font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-5 pb-3 border-b border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px]">person</span>
              Thông Tin Khách Hàng
            </h2>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/50 flex items-center justify-center font-display-sm text-xl text-primary shadow-inner">
                {(booking.customerName || 'K').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface text-lg mb-1">{booking.customerName || 'Khách Vãng Lai'}</h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  {booking.customerPhone || 'Không có SĐT'}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-variant border border-outline-variant/50 text-on-surface text-[10px] font-bold uppercase tracking-wider">
                  {booking.customerType || 'Khách mới'}
                </span>
              </div>
            </div>
          </div>

          {/* Barber Card */}
          <div className="glass-panel relative overflow-hidden bg-surface-container-low/60 border border-outline-variant/40 hover:border-outline-gold/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(212,175,55,0.05)] group">
            <h2 className="font-label-md text-xs font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-5 pb-3 border-b border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px]">content_cut</span>
              Barber Phụ Trách
            </h2>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-gold/30 flex items-center justify-center font-display-sm text-xl text-primary shadow-inner overflow-hidden">
                {(booking.barberName && booking.barberName !== 'Auto') ? booking.barberName.charAt(0) : 'A'}
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface text-lg mb-1">{booking.barberName || 'Sắp xếp tự động'}</h3>
                <p className="font-label-md text-[10px] text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">stars</span>
                  {(booking.barberName === 'Auto' || !booking.barberName) ? 'Hệ thống sắp xếp' : 'Chuyên gia Barber'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Services & Total */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="glass-panel bg-surface-container-low/60 border border-outline-gold/30 hover:border-outline-gold/60 rounded-2xl p-6 md:p-8 flex flex-col h-full transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.08)] relative overflow-hidden group">
            
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-primary/10"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-surface-variant/20 rounded-full blur-[50px] -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                <h2 className="font-label-md text-sm font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
                  Danh Sách Dịch Vụ
                </h2>
                {!isCompleted && (
                  <button className="text-[11px] font-bold text-on-surface hover:text-primary uppercase tracking-wider flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Thêm dịch vụ
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {booking.services?.map((service, index) => (
                  <div 
                    key={service._id} 
                    className="group/item relative bg-surface-container/50 hover:bg-surface-container border border-outline-variant/20 hover:border-outline-gold/40 rounded-xl p-4 md:p-5 flex justify-between items-center gap-4 transition-all duration-300 hover:shadow-lg"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    <div>
                      <h4 className="font-headline-sm text-on-surface text-base md:text-lg mb-1">{service.name}</h4>
                      <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        {service.durationMinutes} phút
                      </p>
                    </div>
                    <span className="font-display-md text-lg md:text-xl font-bold text-on-surface tracking-tight whitespace-nowrap">
                      {(service.price || 0).toLocaleString('vi-VN')} <span className="text-sm font-normal text-on-surface-variant">đ</span>
                    </span>
                  </div>
                ))}
                {!booking.services?.length && (
                  <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/50 border border-dashed border-outline-variant/30 rounded-xl">
                    <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                    <p className="font-body-md text-sm">Chưa có dịch vụ nào được chọn</p>
                  </div>
                )}
              </div>

              <div className="border-t border-outline-variant/50 pt-6 mt-auto">
                <div className="flex justify-between text-xs text-on-surface-variant mb-3">
                  <span className="uppercase tracking-wider">Tổng tiền dịch vụ</span>
                  <span className="font-mono text-on-surface">{(booking.totalPrice || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-xs text-error mb-5">
                  <span className="uppercase tracking-wider">Đã đặt cọc / Thanh toán</span>
                  <span className="font-mono">- {amountPaid.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex justify-between items-end bg-surface-container p-6 rounded-xl border border-outline-gold/20 shadow-inner">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Cần thanh toán thêm</span>
                    <span className="font-body-md text-xs text-on-surface-variant opacity-70">Đã bao gồm VAT</span>
                  </div>
                  <span className="font-display-lg text-3xl md:text-4xl font-extrabold text-primary tracking-tighter drop-shadow-md">
                    {remaining.toLocaleString('vi-VN')} <span className="text-xl text-primary/70 font-normal">đ</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex justify-end gap-3 mt-8 pt-6 border-t border-outline-variant/30 shrink-0">
        <button 
          onClick={() => router.push('/staff/bookings')}
          className="px-6 py-3 border border-outline-variant/50 text-on-surface-variant rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-surface-variant hover:text-on-surface hover:border-outline-variant transition-all active:scale-95"
        >
          Đóng
        </button>
        {!isCompleted && remaining > 0 ? (
          <button
            onClick={handleCompleteService}
            className="px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Thanh toán {remaining.toLocaleString('vi-VN')} đ
          </button>
        ) : (
          <button
            disabled
            className="px-6 py-3 bg-success/20 border border-success/30 text-success font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 opacity-80 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {remaining === 0 && !isCompleted ? 'Chờ hoàn thành' : 'Đã hoàn thành'}
          </button>
        )}
      </footer>
    </div>
  );
}
