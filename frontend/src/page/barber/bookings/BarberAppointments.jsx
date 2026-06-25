"use client";

import React, { useState, useEffect } from 'react';
import { barberService } from '@/services/barber.service';
import toast from 'react-hot-toast';

export default function BarberAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const appRes = await barberService.getHistoryBookings({
        date: dateFilter
      });

      if (appRes?.success && appRes?.data) {
        setAppointments(appRes.data.appointments || []);
        setStats(appRes.data.stats || { total: 0 });
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải lịch sử cắt tóc');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(intervalId);
  }, [dateFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex-1 overflow-y-auto p-12 space-y-8 pb-24 max-w-[1400px] mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-primary">LỊCH SỬ CẮT TÓC</h2>
          <span className="px-3 py-1 rounded-full bg-outline-variant/20 border border-outline-variant text-[10px] font-bold text-gold-dim tracking-widest uppercase">HISTORY DASHBOARD</span>
        </div>

        {/* Filters & Actions */}
        <section className="flex flex-col lg:flex-row justify-between items-end gap-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider">Chọn Ngày</label>
              <div className="flex items-center gap-2 bg-surface-container border border-outline-variant px-4 h-11 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined text-gold-dim text-lg">event</span>
                <input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent outline-none font-body-md text-sm text-on-surface [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert w-full"
                />
              </div>
              <button 
                onClick={() => setDateFilter('')}
                className="text-xs text-primary hover:underline mt-1 block"
              >
                Xem tất cả thời gian
              </button>
            </div>
          </div>
        </section>

      {/* Appointment Bento Grid / List */}
      <section className="space-y-4">
        <div className="grid grid-cols-12 gap-0 border-b border-outline-variant pb-4 px-6 text-xs font-label-md text-outline tracking-widest uppercase">
          <div className="col-span-4">Khách hàng</div>
          <div className="col-span-3">Thời gian</div>
          <div className="col-span-3">Dịch vụ</div>
          <div className="col-span-2 text-right">Trạng thái</div>
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
                <div key={booking._id} className="grid grid-cols-12 gap-0 items-center bg-surface-container/20 border border-outline-variant/20 px-6 py-5 rounded-lg hover:border-primary transition-all cursor-pointer">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-surface-container-highest text-primary">
                      {initials}
                    </div>
                    <div>
                      <p className="font-headline-sm text-sm font-bold text-on-surface">{booking.customerName}</p>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-primary/10 text-primary">
                        {booking.customerType}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 font-label-md text-sm text-on-surface-variant flex flex-col">
                    <span>{booking.time}</span>
                    <span className="text-xs text-outline">{bookingDateStr}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="bg-outline-variant/30 px-2 py-1 rounded text-[10px] text-on-surface">
                      {booking.serviceName}
                    </span>
                  </div>
                  <div className="col-span-2 text-right flex justify-end">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter bg-green-100 text-green-700">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Hoàn thành
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Bottom Stats / Quick Info */}
      <section className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="glass-card p-6 rounded-xl flex items-center justify-between border-b-2 border-b-primary">
          <div>
            <p className="text-xs font-label-md text-outline uppercase">Tổng số khách đã phục vụ</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{stats.total < 10 ? `0${stats.total}` : stats.total}</h3>
          </div>
          <span className="material-symbols-outlined text-4xl text-outline/20">content_cut</span>
        </div>
      </section>
      </div>
    </div>
  );
}
