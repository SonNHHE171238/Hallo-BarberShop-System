import React from "react";

export default function BookingSummarySidebar({ currentStep, selectedService, selectedBarber, selectedDate, selectedTime, onNext }) {
  const isReadyForNext = () => {
    if (currentStep === 1) return !!selectedService;
    if (currentStep === 2) return !!selectedBarber;
    if (currentStep === 3) return !!(selectedDate && selectedTime);
    return false; // Step 4 has its own submit button
  };

  const calculateTotal = () => {
    return selectedService ? selectedService.price.toLocaleString('vi-VN') : '0';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 rounded-xl sticky top-28 overflow-hidden bg-surface-container/40">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>content_cut</span>
        </div>
        
        <h2 className="font-headline-md text-headline-md mb-8 pb-4 border-b border-outline-variant text-primary flex items-center gap-3">
          <span className="material-symbols-outlined">receipt_long</span>
          Chi tiết đặt lịch
        </h2>
        
        <div className="space-y-8 relative z-10">
          {/* Service Detail */}
          <div className={`flex gap-6 items-start transition-opacity ${!selectedService && 'opacity-40 grayscale'}`}>
            <div className="w-16 h-16 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0">
              {selectedService ? (
                <span className="material-symbols-outlined text-primary text-3xl">content_cut</span>
              ) : (
                <span className="material-symbols-outlined text-outline text-2xl">question_mark</span>
              )}
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Dịch vụ</p>
              <p className="font-headline-sm text-headline-sm text-primary font-bold">
                {selectedService ? selectedService.name : 'Chưa chọn'}
              </p>
              {selectedService && (
                <p className="text-on-surface-variant text-sm mt-1">{selectedService.duration} • Bao gồm Gội, Cắt, Cạo & Massage</p>
              )}
            </div>
          </div>

          {/* Barber Detail */}
          <div className={`flex gap-6 items-start transition-opacity ${!selectedBarber && 'opacity-40 grayscale'}`}>
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex-shrink-0 flex items-center justify-center">
              {selectedBarber ? (
                <img src={selectedBarber.imageUrl} alt={selectedBarber.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-outline text-2xl">person</span>
              )}
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Barber</p>
              <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {selectedBarber ? selectedBarber.name : 'Chưa chọn'}
              </p>
              {selectedBarber && (
                <p className="text-on-surface-variant text-sm mt-1">{selectedBarber.title}</p>
              )}
            </div>
          </div>

          {/* Time Detail */}
          <div className={`flex gap-6 items-start transition-opacity ${(!selectedDate || !selectedTime) && 'opacity-40 grayscale'}`}>
            <div className="w-16 h-16 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center flex-shrink-0">
              <span className={`material-symbols-outlined ${selectedDate ? 'text-primary' : 'text-outline'} text-3xl`}>calendar_today</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Thời gian</p>
              <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {selectedTime ? `${selectedTime}` : 'Chưa chọn'}
              </p>
              {selectedDate && (
                <p className="text-on-surface-variant text-sm mt-1">Ngày {selectedDate} Tháng 12, 2024</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-outline-variant flex justify-between items-center">
          <span className="font-headline-sm text-headline-sm">Tổng cộng:</span>
          <span className="font-headline-md text-headline-md text-primary font-bold">{calculateTotal()}đ</span>
        </div>

        {currentStep < 4 && (
          <div className="mt-8">
            <button 
              onClick={onNext}
              disabled={!isReadyForNext()}
              className={`w-full py-4 rounded-lg font-headline-sm text-headline-sm font-bold uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 ${
                isReadyForNext() 
                  ? 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(233,193,118,0.3)] active:scale-[0.98]' 
                  : 'bg-surface-variant text-outline cursor-not-allowed'
              }`}
            >
              Tiếp Tục
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-on-surface-variant/60 font-label-md italic">
          * Thanh toán trực tiếp tại cửa hàng sau khi sử dụng dịch vụ.
        </p>
      </div>

      {/* Trust Badge */}
      <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-4">
        <span className="material-symbols-outlined text-gold-dim text-3xl">verified_user</span>
        <p className="text-sm text-on-surface-variant">Thông tin của bạn được bảo mật tuyệt đối theo chính sách của HALLO BARBER.</p>
      </div>
    </div>
  );
}
