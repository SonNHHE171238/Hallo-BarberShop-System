import React, { useState } from 'react';
import { bookingService } from '@/services/booking.service';
import toast from 'react-hot-toast';

export default function ScheduleTimeline({ bookings = [], onRefresh, selectedDate }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      await bookingService.updateBookingStatus(bookingId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
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
            Không có lịch hẹn nào vào ngày này.
          </div>
        ) : (
          bookings.map((booking, index) => {
            const isCompleted = booking.status === 'completed';
            const isCheckedIn = booking.status === 'confirmed';
            const isPending = booking.status === 'pending';
            
            // Format time slot
            let timeDisplay = booking.timeSlot;
            if (!timeDisplay && booking.bookingDate) {
              const bDate = new Date(booking.bookingDate);
              timeDisplay = bDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            if (!timeDisplay) timeDisplay = 'N/A';
            
            const customerName = booking.customerName || booking.customerId?.name || 'Khách Vãng Lai';
            const serviceName = booking.serviceId?.name || (booking.services && booking.services.length > 0 ? booking.services.map(s => s.name).join(', ') : 'Dịch vụ');

            // Check if booking has started
            const now = new Date();
            const bookingStart = new Date(booking.bookingDate);
            const hasStarted = now >= bookingStart;

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
                    onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                    disabled={updatingId === booking._id}
                    className="w-[calc(100%-112px)] sm:w-auto ml-[112px] sm:ml-0 bg-surface-container-high border border-outline-variant text-on-surface font-label-md text-label-md uppercase px-8 py-3 rounded hover:border-primary transition-all shadow-sm"
                  >
                    Check In
                  </button>
                )}

                {isCheckedIn && (
                  <div className="flex items-center gap-2 w-[calc(100%-112px)] sm:w-auto ml-[112px] sm:ml-0">
                    <button 
                      onClick={() => handleUpdateStatus(booking._id, 'pending')}
                      disabled={updatingId === booking._id}
                      title="Hoàn tác Check-in"
                      className="bg-surface-container-high border border-outline-variant text-on-surface font-label-md text-label-md uppercase px-4 py-3 rounded hover:border-error hover:text-error transition-all shadow-sm flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[18px]">undo</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(booking._id, 'completed')}
                      disabled={updatingId === booking._id || !hasStarted}
                      title={!hasStarted ? "Chưa đến giờ bắt đầu lịch hẹn" : "Đánh dấu hoàn thành"}
                      className={`flex-1 sm:flex-none font-label-md text-label-md uppercase px-8 py-3 rounded transition-all shadow-lg ${
                        hasStarted 
                          ? "bg-primary text-on-primary hover:bg-gold-dim" 
                          : "bg-surface-container-highest text-outline cursor-not-allowed opacity-50"
                      }`}
                    >
                      Hoàn Thành
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
