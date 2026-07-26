"use client";

import React, { useEffect } from "react";

export default function FeedbackDetailModal({ isOpen, onClose, feedback }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !feedback) return null;

  const dateObj = new Date(feedback.createdAt);
  const formattedFeedbackDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
  
  const bookingObj = feedback.bookingId ? new Date(feedback.bookingId.bookingDate) : null;
  const formattedBookingDate = bookingObj ? `${bookingObj.getDate().toString().padStart(2, '0')}/${(bookingObj.getMonth() + 1).toString().padStart(2, '0')}/${bookingObj.getFullYear()}` : 'N/A';

  const customerName = feedback.bookingId?.customerName || "Khách Vãng Lai";
  const customerPhone = feedback.bookingId?.customerPhone || "Không có SĐT";
  const bookingType = feedback.bookingId?.bookingType || 'guest';
  const isMember = bookingType === 'user';
  
  const barberUser = feedback.bookingId?.barberId?.userId;
  const barberName = barberUser ? barberUser.name : "Không rõ";
  
  const services = feedback.bookingId?.services || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-obsidian/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-surface-container-low border border-outline-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-surface-container/50">
          <h2 className="font-serif text-2xl text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px]">reviews</span>
            Chi Tiết Đánh Giá
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-primary/20 hover:text-primary text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          
          {/* Booking Info Section */}
          <div>
            <h3 className="text-sm font-label-md text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              Thông Tin Lịch Hẹn
            </h3>
            <div className="bg-surface-container/50 rounded-xl p-5 border border-outline-variant/20 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-on-surface-variant">Khách hàng</p>
                    <span className={`px-2 py-0.5 text-[8px] uppercase font-bold tracking-wider rounded border ${isMember ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'}`}>
                      {isMember ? 'Thành Viên' : 'Vãng Lai'}
                    </span>
                  </div>
                  <p className="font-bold text-on-surface text-base">{customerName}</p>
                  <p className="text-sm text-on-surface-variant">{customerPhone}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">content_cut</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Thợ phụ trách</p>
                  <p className="font-bold text-on-surface text-base">{barberName}</p>
                  <p className="text-sm text-on-surface-variant">Ngày: {formattedBookingDate}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start md:col-span-2 mt-2 pt-4 border-t border-outline-variant/20">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">room_service</span>
                </div>
                <div className="w-full">
                  <p className="text-xs text-on-surface-variant mb-2">Dịch vụ sử dụng</p>
                  <div className="flex flex-wrap gap-2">
                    {services.length > 0 ? (
                      services.map(s => (
                        <span key={s._id} className="px-3 py-1 bg-surface-container-highest border border-outline-variant/30 rounded-full text-sm text-on-surface">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-on-surface-variant italic">Không có dữ liệu</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Feedback Info Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-label-md text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">star</span>
                Đánh Giá Của Khách
              </h3>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Thời gian đánh giá</span>
                <span className="text-xs font-medium text-on-surface bg-surface-container px-2 py-1 rounded-md border border-outline-variant/30">{formattedFeedbackDate}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột 1: Dịch Vụ */}
              <div className="bg-surface-container/50 rounded-xl p-5 border border-outline-gold/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <h4 className="text-sm font-label-md text-primary uppercase tracking-widest mb-4 border-b border-outline-variant/20 pb-2">Dịch Vụ Chung</h4>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Mức độ hài lòng</p>
                    <div className="flex items-center gap-1">
                      <span className="font-display-md text-3xl font-bold text-gold-dim mr-2">{feedback.rating}</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={`service-${star}`} 
                          className={`material-symbols-outlined text-[20px] ${star <= feedback.rating ? 'text-gold-dim' : 'text-outline-variant/30'}`}
                          style={{ fontVariationSettings: star <= feedback.rating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/20 relative z-10">
                  <p className="text-xs text-on-surface-variant mb-2">Góp ý dịch vụ</p>
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 h-24 overflow-y-auto custom-scrollbar">
                    {feedback.comment ? (
                      <p className="text-on-surface text-sm italic leading-relaxed">"{feedback.comment}"</p>
                    ) : (
                      <p className="text-on-surface-variant italic text-sm">Không có bình luận.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột 2: Barber */}
              <div className="bg-surface-container/50 rounded-xl p-5 border border-outline-gold/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <h4 className="text-sm font-label-md text-primary uppercase tracking-widest mb-4 border-b border-outline-variant/20 pb-2">Thợ: {barberName}</h4>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Mức độ hài lòng</p>
                    <div className="flex items-center gap-1">
                      <span className="font-display-md text-3xl font-bold text-gold-dim mr-2">{feedback.barberRating || feedback.rating}</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={`barber-${star}`} 
                          className={`material-symbols-outlined text-[20px] ${star <= (feedback.barberRating || feedback.rating) ? 'text-gold-dim' : 'text-outline-variant/30'}`}
                          style={{ fontVariationSettings: star <= (feedback.barberRating || feedback.rating) ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/20 relative z-10">
                  <p className="text-xs text-on-surface-variant mb-2">Góp ý về thợ</p>
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 h-24 overflow-y-auto custom-scrollbar">
                    {feedback.barberComment ? (
                      <p className="text-on-surface text-sm italic leading-relaxed">"{feedback.barberComment}"</p>
                    ) : (
                      <p className="text-on-surface-variant italic text-sm">Không có bình luận.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        {feedback.bookingId && (
          <div className="p-4 border-t border-outline-variant/30 bg-surface-container/50 flex justify-end">
            <button 
              onClick={() => window.location.href = `/admin/bookings/detail?id=${feedback.bookingId._id}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl font-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Xem Chi Tiết Lịch Hẹn Gốc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
