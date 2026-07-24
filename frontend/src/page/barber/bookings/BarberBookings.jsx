"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { barberService } from '@/services/barber.service';
import toast from 'react-hot-toast';

export default function BarberBookings() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filters State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
  });

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const appRes = await barberService.getHistoryBookings({
        date: dateFilter,
        page: currentPage,
        limit: 10
      });

      if (appRes && appRes.appointments) {
        setAppointments(appRes.appointments || []);
        if (appRes.pagination) setTotalPages(appRes.pagination.pages || 1);
      } else if (appRes?.success && appRes?.data) {
        setAppointments(appRes.data.appointments || []);
        if (appRes.data.pagination) setTotalPages(appRes.data.pagination.pages || 1);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải lịch sử cắt tóc');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(intervalId);
  }, [dateFilter, currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-8 pb-24 max-w-[1400px] mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4 md:mb-8">
          <h2 className="font-headline-sm text-xl md:text-headline-sm font-semibold text-primary">QUẢN LÝ LỊCH HẸN</h2>
          <span className="w-fit px-3 py-1 rounded-full bg-outline-variant/20 border border-outline-variant text-[10px] font-bold text-gold-dim tracking-widest uppercase">BOOKINGS DASHBOARD</span>
        </div>

        {/* Filters & Actions */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-6">
          <div className="flex flex-wrap gap-4 items-end w-full lg:w-auto">
            <div className="space-y-2 w-full sm:w-auto">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider">Chọn Ngày</label>
              <div className="flex gap-2 w-full">
                <div className="flex-1 sm:flex-none flex items-center gap-2 bg-surface-container border border-outline-variant px-4 h-11 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <span className="material-symbols-outlined text-gold-dim text-lg">event</span>
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent outline-none font-body-md text-sm text-on-surface [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert w-full"
                  />
                </div>
                <button 
                  onClick={() => fetchData(true)}
                  disabled={isLoading}
                  className="h-11 px-4 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-primary flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Làm mới dữ liệu"
                >
                  <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                </button>
              </div>
              <button 
                onClick={() => { setDateFilter(''); setCurrentPage(1); }}
                className="text-xs text-primary hover:underline mt-1 block"
              >
                Xem tất cả thời gian
              </button>
            </div>
          </div>
        </section>

      {/* Appointment Bento Grid / List */}
      <section className="space-y-4">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-outline-variant pb-4 px-6 text-xs font-label-md text-outline tracking-widest uppercase">
          <div className="col-span-12 md:col-span-4">Khách hàng</div>
          <div className="col-span-12 md:col-span-3">Thời gian</div>
          <div className="col-span-12 md:col-span-3">Giá trị đơn</div>
          <div className="col-span-12 md:col-span-2 text-right">Trạng thái</div>
        </div>
        
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-outline">Không có lịch sử cắt tóc nào khớp với bộ lọc.</div>
          ) : (
            appointments.map((booking) => {
              // Extract initials
              const initials = booking.customerName
                ? booking.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'KH';

              const bookingDateStr = new Date(booking.date).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              });

              return (
                <div 
                  key={booking._id} 
                  onClick={() => router.push(`/barber/bookings/detail?id=${booking._id}`)}
                  className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center bg-surface-container/20 border border-outline-variant/20 px-4 py-4 md:px-6 md:py-5 rounded-lg hover:border-primary transition-all cursor-pointer"
                >
                  <div className="col-span-12 md:col-span-4 flex items-center gap-3 w-full border-b border-outline-variant/20 md:border-none pb-3 md:pb-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-surface-container-highest text-primary shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 flex justify-between md:block items-center">
                      <div>
                        <p className="font-headline-sm text-sm font-bold text-on-surface line-clamp-1">{booking.customerName}</p>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-primary/10 text-primary">
                          {booking.customerType}
                        </span>
                      </div>
                      {/* Mobile Status Badge */}
                      <div className="md:hidden">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${booking.statusClass}`}>
                          <span className="material-symbols-outlined text-[10px]">{booking.icon || 'circle'}</span>
                          {booking.uiStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-12 md:col-span-3 w-full flex justify-between md:flex-col font-label-md text-sm text-on-surface-variant">
                    <span className="md:hidden text-xs uppercase text-outline">Thời gian</span>
                    <div className="flex flex-col items-end md:items-start">
                      <span className="font-bold text-on-surface">{booking.time}</span>
                      <span className="text-xs text-outline">{bookingDateStr}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-12 md:col-span-3 w-full flex justify-between md:block font-display-sm text-primary">
                    <span className="md:hidden text-xs uppercase font-label-md text-outline">Giá trị đơn</span>
                    <span>{(booking.totalPrice || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  {/* Desktop Status Badge */}
                  <div className="col-span-12 md:col-span-2 hidden md:flex justify-end w-full">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${booking.statusClass}`}>
                      <span className="material-symbols-outlined text-xs">{booking.icon || 'circle'}</span>
                      {booking.uiStatus}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-outline-variant/30">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-highest disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="font-label-md text-sm text-on-surface">
              Trang {currentPage} / {totalPages}
            </div>
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-highest disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>

      </div>
    </div>
  );
}
