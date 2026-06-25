import React, { useState } from 'react';
import { bookingService } from '@/services/booking.service';

export default function ScheduleTimeline({ bookings = [], onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      await bookingService.updateBookingStatus(bookingId, newStatus);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface serif-heading">Lịch Hẹn</h2>
        <button 
          onClick={onRefresh}
          className="font-label-md text-label-md text-primary uppercase hover:text-gold-dim transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span> Làm Mới
        </button>
      </div>
      
      <div className="flex flex-col border border-outline-gold rounded overflow-hidden bg-surface-container-lowest">
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant font-body-md">
            Không có lịch hẹn nào trong hôm nay.
          </div>
        ) : (
          bookings.map((booking, index) => {
            const isCompleted = booking.status === 'completed';
            const isCheckedIn = booking.status === 'checked_in' || booking.status === 'in_progress';
            const isPending = booking.status === 'pending' || booking.status === 'confirmed';
            
            // Format time slot
            const timeDisplay = booking.timeSlot; 
            const customerName = booking.customerName || booking.customerId?.name || 'Khách Vãng Lai';
            const serviceName = booking.serviceId?.name || (booking.services && booking.services.length > 0 ? booking.services.map(s => s.name).join(', ') : 'Dịch vụ');

            return (
              <div 
                key={booking._id || index}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-container-padding border-b border-outline-gold/30 ${
                  isCompleted ? 'opacity-50 grayscale bg-surface-container-lowest' : 
                  isCheckedIn ? 'bg-surface-container relative overflow-hidden border-outline-gold' : 
                  ''
                }`}
              >
                {isCheckedIn && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary shadow-[4px_0_15px_rgba(255,222,165,0.4)]"></div>
                )}
                
                <div className={`flex gap-4 sm:gap-6 items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0 ${isCheckedIn ? 'pl-4' : ''}`}>
                  <div className={`font-label-md text-label-md w-24 shrink-0 pt-1 sm:pt-0 ${isCheckedIn ? 'text-primary font-bold' : isCompleted ? 'text-outline' : 'text-on-surface-variant'}`}>
                    {timeDisplay}
                  </div>
                  <div className="flex-grow">
                    <div className="font-headline-sm text-headline-sm text-on-surface mb-1 serif-heading">{customerName}</div>
                    <div className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-2">
                      {serviceName}
                      {booking.bookingType === 'guest' && (
                        <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">Khách Mới</span>
                      )}
                    </div>
                  </div>
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-2 text-outline ml-[112px] sm:ml-0">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="font-label-md text-[10px] uppercase tracking-widest">Đã Hoàn Thành</span>
                  </div>
                )}

                {isPending && (
                  <button 
                    onClick={() => handleUpdateStatus(booking._id, 'checked_in')}
                    disabled={updatingId === booking._id}
                    className="w-[calc(100%-112px)] sm:w-auto ml-[112px] sm:ml-0 bg-surface-container-high border border-outline-variant text-on-surface font-label-md text-label-md uppercase px-8 py-3 rounded hover:border-primary transition-all shadow-sm"
                  >
                    Check In
                  </button>
                )}

                {isCheckedIn && (
                  <button 
                    onClick={() => handleUpdateStatus(booking._id, 'completed')}
                    disabled={updatingId === booking._id}
                    className="w-[calc(100%-112px)] sm:w-auto ml-[112px] sm:ml-0 bg-primary text-on-primary font-label-md text-label-md uppercase px-8 py-3 rounded hover:bg-gold-dim transition-all shadow-lg"
                  >
                    Hoàn Thành
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
