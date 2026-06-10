import React from "react";

export default function BookingSummarySidebar({ selectedService, selectedBarber, selectedDate, selectedTime, onConfirm }) {
  const isReady = selectedService && selectedBarber && selectedDate && selectedTime;

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        <div className="glass-card overflow-hidden border border-outline-variant rounded-xl">
          <div className="bg-surface-container-highest p-6 border-b border-outline-variant">
            <h3 className="text-headline-sm font-headline-sm text-primary tracking-tight">Chi Tiết Đặt Lịch</h3>
          </div>
          <div className="p-6 space-y-6">
            
            {/* Service Detail */}
            <div className={`flex items-start space-x-4 ${!selectedService && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">content_cut</span>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold">DỊCH VỤ</p>
                <p className="text-body-lg font-bold text-on-surface">{selectedService ? selectedService.name : 'Chưa chọn'}</p>
                {selectedService && <p className="text-label-md text-outline">{selectedService.duration} • {selectedService.price.toLocaleString('vi-VN')}đ</p>}
              </div>
            </div>

            {/* Barber Detail */}
            <div className={`flex items-start space-x-4 ${!selectedBarber && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">person</span>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold">BARBER</p>
                <p className="text-body-lg font-bold text-on-surface">{selectedBarber ? selectedBarber.name : 'Chưa chọn'}</p>
                {selectedBarber && <p className="text-label-md text-outline">{selectedBarber.title}</p>}
              </div>
            </div>

            {/* Time Detail */}
            <div className={`flex items-start space-x-4 ${(!selectedDate || !selectedTime) && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">calendar_month</span>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold">THỜI GIAN</p>
                <p className="text-body-lg font-bold text-on-surface">{selectedTime ? `${selectedTime}` : 'Chưa chọn'}</p>
                {selectedDate && <p className="text-label-md text-outline">{selectedDate} Tháng 12, 2024</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <div className="flex justify-between items-end mb-8">
                <span className="text-headline-sm font-bold text-on-surface">Tổng cộng</span>
                <span className="text-display-lg text-[40px] font-bold text-primary leading-none">
                  {selectedService ? `${(selectedService.price / 1000)}k` : '0đ'}
                </span>
              </div>
              <button 
                onClick={onConfirm}
                disabled={!isReady}
                className={`w-full font-headline-md py-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
                  isReady 
                    ? 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(255,222,165,0.3)] active:scale-95 cursor-pointer' 
                    : 'bg-surface-variant text-outline cursor-not-allowed'
                }`}
              >
                <span>Xác Nhận Đặt Lịch</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-center text-[11px] text-outline mt-4 font-label-md tracking-tighter">
                Bằng cách nhấn xác nhận, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="glass-card p-6 bg-surface-container-low border-dashed border border-outline-variant rounded-xl">
          <h4 className="text-label-md font-bold text-primary mb-2 flex items-center">
            <span className="material-symbols-outlined text-sm mr-2">info</span> CHÍNH SÁCH HỦY LỊCH
          </h4>
          <p className="text-body-md text-on-surface-variant leading-relaxed italic">
            Quý khách vui lòng thông báo trước ít nhất 2 giờ nếu có thay đổi để chúng tôi phục vụ tốt nhất.
          </p>
        </div>
      </div>
    </aside>
  );
}
