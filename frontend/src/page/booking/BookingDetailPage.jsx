"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookingService } from '@/services/booking.service';
import RescheduleModal from '@/components/customer/RescheduleModal';

export default function BookingDetailPage({ id }) {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (error) {
        console.error("Failed to fetch booking details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
        <p className="mb-4">Không tìm thấy thông tin lịch hẹn.</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary text-on-primary font-bold rounded">Về trang chủ</button>
      </div>
    );
  }

  const dateObj = new Date(booking.bookingDate);
  const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dateStr = dateObj.toLocaleDateString('vi-VN');
  
  const startHours = String(dateObj.getHours()).padStart(2, '0');
  const startMinutes = String(dateObj.getMinutes()).padStart(2, '0');
  const startTime = `${startHours}:${startMinutes}`;

  const endDateObj = new Date(dateObj.getTime() + (booking.durationMinutes || 0) * 60000);
  const endHours = String(endDateObj.getHours()).padStart(2, '0');
  const endMinutes = String(endDateObj.getMinutes()).padStart(2, '0');
  const endTime = `${endHours}:${endMinutes}`;

  const timeStr = `${startTime} - ${endTime}`;
  
  const finalPrice = booking.totalPrice || 0;
  const amountStr = finalPrice.toLocaleString('vi-VN') + ' ₫';
  
  const servicesStr = booking.services && booking.services.length > 0 
    ? booking.services.map(s => s.name).join(', ') 
    : 'Chưa rõ';

  const barberName = booking.barberId?.userId?.name || 'Ngẫu nhiên';
  const barberAvatar = booking.barberId?.userId?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAQfWCkHgnf1DpGtQ-conxtI_uAenaJGfDqqbKrD_dhmZuxkgVdl6I5G--a_07HFLG7ffKIYEcd4PuLyrA4WOtWZ5aQIYItGUxRlFw4SCj5TM6fQC6M0sRUulivS4b-Kz8zrqjg4SKQvFl_oSNJuAEl1NPBXwc3J8jJdSrkZLq9afbBg01ifHyiIQrgdMmELmEYoXxqlzegW2v936vchWtqySDBqlS7J6nadMUUDL8wWCb850mIxvcyKWUlekpGmh5Esqix30l7WpwN";
  
  const shortId = booking._id ? booking._id.slice(-8).toUpperCase() : 'N/A';

  const statusMap = {
    pending: { label: 'Chưa tới', icon: 'schedule' },
    confirmed: { label: 'Khách đã đến', icon: 'how_to_reg' },
    cancelled: { label: 'Đã huỷ', icon: 'cancel' }
  };
  const statusInfo = statusMap[booking.status] || statusMap.pending;

  return (
    <div className="font-body-md text-body-md antialiased relative min-h-screen flex flex-col bg-background text-on-surface">
      {/* Blur Background Context (Home Screen Simulation) */}
      <div className="fixed inset-0 z-0 overflow-hidden filter blur-md pointer-events-none opacity-50 transition-all duration-500">
        <header className="fixed top-0 w-full z-10 bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
          <div className="flex justify-between items-center h-20 px-4 md:px-16 max-w-[1200px] mx-auto">
            <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary tracking-tighter uppercase">HALLO BARBER</div>
            <nav className="hidden md:flex gap-6">
              <span className="font-label-md text-label-md text-on-surface-variant">Dịch vụ</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Cửa hàng</span>
              <span className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1">Đặt lịch</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Thư viện</span>
            </nav>
          </div>
        </header>
        <main className="pt-24 px-4 md:px-16 max-w-[1200px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-surface-container border border-outline-variant rounded-lg p-6 h-64"></div>
            <div className="bg-surface-container border border-outline-variant rounded-lg p-6 h-64"></div>
            <div className="bg-surface-container border border-outline-variant rounded-lg p-6 h-64"></div>
          </div>
        </main>
      </div>
      
      {/* Overlay & Modal Wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300">
        
        <div aria-labelledby="modal-title" aria-modal="true" className="relative bg-surface-container w-full max-w-lg rounded-xl border border-primary-container shadow-2xl transform transition-all duration-300 scale-100 overflow-hidden flex flex-col" role="dialog">
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low">
            <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide" id="modal-title">Chi Tiết Lịch Hẹn</h2>
            <button 
              aria-label="Đóng popup" 
              className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none" 
              type="button"
              onClick={() => router.push('/customer/dashboard')}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-6 space-y-6">
            
            {/* Status & Code Banner */}
            <div className="flex items-center justify-between bg-surface-container-highest rounded-lg p-4 border border-outline-variant/30">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">Mã Lịch Hẹn</p>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-wider">HB-{shortId}</p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
                <span className="font-label-md text-label-md text-primary">{statusInfo.label}</span>
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gold-dim mt-0.5">event</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase">Thời Gian</p>
                    <p className="font-body-md text-body-md text-on-surface">{dayName}, {dateStr}</p>
                    <p className="font-body-md text-body-md text-on-surface font-semibold mt-1 text-primary-fixed-dim">{timeStr}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gold-dim mt-0.5">location_on</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase">Chi Nhánh</p>
                    <p className="font-body-md text-body-md text-on-surface">HALLO BARBER Hòa Lạc</p>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Khu CNC Hòa Lạc, Hà Nội</p>
                  </div>
                </div>
              </div>
              
              {/* Column 2 */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gold-dim mt-0.5">content_cut</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase">Barber</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high flex-shrink-0">
                        <img 
                          alt="Barber Avatar" 
                          className="w-full h-full object-cover grayscale opacity-80" 
                          src={barberAvatar} 
                        />
                      </div>
                      <p className="font-body-md text-body-md text-on-surface font-medium">{barberName}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gold-dim mt-0.5">spa</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase">Dịch Vụ</p>
                    <p className="font-body-md text-body-md text-on-surface">{servicesStr}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Divider */}
            <div className="border-t border-outline-variant/30 pt-4 flex justify-between items-end">
              <p className="font-headline-sm text-headline-sm text-on-surface">Tổng Tiền</p>
              <p className="font-headline-md text-headline-md text-primary font-bold">{amountStr}</p>
            </div>
          </div>
          
          {/* Modal Footer / Actions */}
          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/50 flex flex-col md:flex-row gap-3 justify-end items-center">
            <button 
              className="w-full md:w-auto px-6 py-2.5 rounded border border-outline-variant text-on-surface-variant font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-highest hover:text-on-surface transition-colors active:scale-95" 
              type="button"
              onClick={() => router.push('/customer/dashboard')}
            >
              Đóng
            </button>
            <button 
              className="w-full md:w-auto px-6 py-2.5 rounded bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider font-semibold hover:bg-primary-fixed transition-colors active:scale-95 shadow-[0_0_15px_rgba(255,222,165,0.15)] disabled:opacity-50" 
              type="button"
              onClick={() => setIsRescheduleOpen(true)}
              disabled={booking.status === 'cancelled'}
            >
              Đổi Lịch
            </button>
          </div>
          
          {/* Subtle Decorative Shine on Modal */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container/50 to-transparent opacity-50"></div>
          
        </div>
      </div>

      {isRescheduleOpen && (
        <RescheduleModal
          booking={booking}
          onClose={() => setIsRescheduleOpen(false)}
          onSuccess={() => {
            setIsRescheduleOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}