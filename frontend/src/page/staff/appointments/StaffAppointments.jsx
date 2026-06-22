"use client";

import React, { useState, useEffect } from 'react';
import { staffDashboardService } from '@/services/staffDashboard.service';
import toast from 'react-hot-toast';

export default function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, serving: 0, emptyChairs: 0 });
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [barberFilter, setBarberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'waiting', 'serving'

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [appRes, barbersRes] = await Promise.all([
        staffDashboardService.getAppointmentsList({
          date: dateFilter,
          barberId: barberFilter,
          status: statusFilter
        }),
        staffDashboardService.getBarbersStatus()
      ]);

      if (appRes) {
        setAppointments(appRes.appointments || []);
        setStats(appRes.stats || { total: 0, serving: 0, emptyChairs: 0 });
      }

      if (barbersRes) {
        setBarbers(barbersRes);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu lịch hẹn');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(intervalId);
  }, [dateFilter, barberFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  // Format date for display in the filter UI
  const displayDate = new Date(dateFilter).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="w-full">
      <div className="flex-1 overflow-y-auto p-12 space-y-8 pb-24 max-w-[1400px] mx-auto animate-fade-in">
        {/* Header (Text only, based on user request) */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-primary">QUẢN LÝ LỊCH HẸN</h2>
          <span className="px-3 py-1 rounded-full bg-outline-variant/20 border border-outline-variant text-[10px] font-bold text-gold-dim tracking-widest uppercase">LIVE DASHBOARD</span>
        </div>

        {/* Filters & Actions */}
        <section className="flex flex-col lg:flex-row justify-between items-end gap-6">
          <div className="flex flex-wrap gap-4 items-end">
            
            <div className="space-y-2">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider">Ngày làm việc</label>
              <div className="flex items-center gap-2 bg-surface-container border border-outline-variant px-4 h-11 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined text-gold-dim text-lg">event</span>
                {/* Native date picker with transparent background overlaid on the styled container */}
                <input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent outline-none font-body-md text-sm text-on-surface [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider">Thợ Barber</label>
              <select 
                value={barberFilter}
                onChange={(e) => setBarberFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant px-4 h-11 rounded-lg text-sm focus:ring-primary outline-none min-w-[180px] text-on-surface"
              >
                <option value="all">Tất cả thợ</option>
                {barbers.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider">Trạng thái</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 h-11 flex items-center rounded-lg text-sm transition-all ${
                    statusFilter === 'all' 
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/10' 
                    : 'bg-surface-container border border-outline-variant hover:border-primary text-on-surface'
                  }`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setStatusFilter('waiting')}
                  className={`px-4 h-11 flex items-center rounded-lg text-sm transition-all ${
                    statusFilter === 'waiting' 
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/10' 
                    : 'bg-surface-container border border-outline-variant hover:border-primary text-on-surface'
                  }`}
                >
                  Đang chờ
                </button>
                <button 
                  onClick={() => setStatusFilter('serving')}
                  className={`px-4 h-11 flex items-center rounded-lg text-sm transition-all ${
                    statusFilter === 'serving' 
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/10' 
                    : 'bg-surface-container border border-outline-variant hover:border-primary text-on-surface'
                  }`}
                >
                  Đang làm
                </button>
              </div>
            </div>
          </div>
        </section>

      {/* Appointment Bento Grid / List */}
      <section className="space-y-4">
        <div className="grid grid-cols-12 gap-0 border-b border-outline-variant pb-4 px-6 text-xs font-label-md text-outline tracking-widest uppercase">
          <div className="col-span-3">Khách hàng</div>
          <div className="col-span-2">Thời gian</div>
          <div className="col-span-3">Dịch vụ</div>
          <div className="col-span-2">Barber phụ trách</div>
          <div className="col-span-2 text-right">Trạng thái</div>
        </div>
        
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-outline">Không có lịch hẹn nào khớp với bộ lọc.</div>
          ) : (
            appointments.map((booking) => {
              // Styling logic depending on rawStatus or uiStatus
              let rowClass = "bg-surface-container/20 border border-outline-variant/20 px-6 py-5 rounded-lg hover:border-primary group transition-all cursor-pointer";
              let initialsClass = "bg-surface-container-highest text-primary";
              let badgeClass = "bg-primary/10 text-primary";
              
              if (booking.uiStatus === 'Đang chờ') {
                rowClass = "bg-surface-container/40 border border-outline-variant/50 px-6 py-5 rounded-lg hover:border-gold-dim transition-all cursor-pointer";
                initialsClass = "bg-outline-variant/20 text-outline";
                badgeClass = "bg-outline-variant/20 text-outline";
              } else if (booking.uiStatus === 'Hoàn thành') {
                rowClass = "bg-surface-container/20 border border-outline-variant/20 px-6 py-5 rounded-lg opacity-80 hover:opacity-100 transition-all cursor-pointer grayscale hover:grayscale-0";
              } else if (booking.uiStatus === 'Đã hủy') {
                rowClass = "bg-error-container/5 border border-error/10 px-6 py-5 rounded-lg opacity-60";
                initialsClass = "bg-error/10 text-error";
              } else if (booking.uiStatus === 'Đang làm') {
                rowClass = "glass-card px-6 py-5 rounded-lg hover:border-secondary transition-all cursor-pointer shadow-lg";
              }

              // Extract initials
              const initials = booking.customerName
                ? booking.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'KH';

              return (
                <div key={booking._id} className={`grid grid-cols-12 gap-0 items-center ${rowClass}`}>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${initialsClass}`}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-headline-sm text-sm font-bold text-on-surface">{booking.customerName}</p>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badgeClass}`}>
                        {booking.customerType}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 font-label-md text-sm text-on-surface-variant">
                    {booking.time}
                  </div>
                  <div className="col-span-3">
                    <span className="bg-outline-variant/30 px-2 py-1 rounded text-[10px] text-on-surface">
                      {booking.serviceName}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {booking.barberName === 'Auto' && booking.uiStatus === 'Đã hủy' ? (
                      <p className="text-sm text-outline">--</p>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full bg-gold-dim/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-gold-dim">person</span>
                        </div>
                        <p className="text-sm">{booking.barberName}</p>
                      </>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${booking.statusClass}`}>
                      {booking.uiStatus === 'Đang làm' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      )}
                      {booking.uiStatus === 'Hoàn thành' && (
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                      )}
                      {booking.uiStatus}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Bottom Stats / Quick Info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl flex items-center justify-between border-b-2 border-b-outline-variant">
          <div>
            <p className="text-xs font-label-md text-outline uppercase">Tổng lịch hẹn</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{stats.total < 10 ? `0${stats.total}` : stats.total}</h3>
          </div>
          <span className="material-symbols-outlined text-4xl text-outline/20">calendar_month</span>
        </div>
        
        <div className="glass-card p-6 rounded-xl flex items-center justify-between border-b-2 border-b-secondary">
          <div>
            <p className="text-xs font-label-md text-outline uppercase">Đang phục vụ</p>
            <h3 className="text-2xl font-bold text-secondary mt-1">{stats.serving < 10 ? `0${stats.serving}` : stats.serving}</h3>
          </div>
          <span className="material-symbols-outlined text-4xl text-secondary/20">content_cut</span>
        </div>
        
        <div className="glass-card p-6 rounded-xl flex items-center justify-between border-b-2 border-b-gold-dim">
          <div>
            <p className="text-xs font-label-md text-outline uppercase">Ghế còn trống</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{stats.emptyChairs < 10 ? `0${stats.emptyChairs}` : stats.emptyChairs}</h3>
          </div>
          <span className="material-symbols-outlined text-4xl text-outline/20">chair</span>
        </div>
      </section>
      </div>
    </div>
  );
}
