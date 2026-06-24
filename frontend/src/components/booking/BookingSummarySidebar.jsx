import React from "react";

export default function BookingSummarySidebar({ selectedServices = [], selectedBarber, selectedDate, selectedTime, onConfirm, isLoading }) {
  const isReady = selectedServices.length > 0 && selectedBarber && selectedDate && selectedTime;

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        <div className="glass-card overflow-hidden border border-outline-variant rounded-xl">
          <div className="bg-surface-container-highest p-6 border-b border-outline-variant">
            <h3 className="text-headline-sm font-headline-sm text-primary tracking-tight">Chi Tiết Đặt Lịch</h3>
          </div>
          <div className="p-6 space-y-6">
            
            {/* Service Detail */}
            <div className={`flex items-start space-x-4 ${selectedServices.length === 0 && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">content_cut</span>
              <div className="w-full">
                <p className="text-label-md text-on-surface-variant font-bold mb-2">DỊCH VỤ ĐÃ CHỌN ({selectedServices.length})</p>
                {selectedServices.length > 0 ? (
                  <div className="space-y-3">
                    {selectedServices.map(service => (
                      <div key={service._id} className="flex justify-between items-start border-b border-outline-variant/30 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-body-md font-bold text-on-surface leading-tight">{service.name}</p>
                          <p className="text-label-sm text-outline mt-0.5">{service.durationMinutes || service.duration} Phút</p>
                        </div>
                        <p className="text-body-sm font-semibold text-primary">{service.price ? service.price.toLocaleString('vi-VN') : '0'}đ</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-lg font-bold text-on-surface">Chưa chọn</p>
                )}
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
                <p className="text-label-md text-on-surface-variant font-bold">THỜI GIAN BẮT ĐẦU</p>
                <p className="text-body-lg font-bold text-on-surface">{selectedTime ? `${selectedTime}` : 'Chưa chọn'}</p>
                {selectedDate && <p className="text-label-md text-outline">{selectedDate}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <div className="flex justify-between items-end mb-8">
                <span className="text-headline-sm font-bold text-on-surface">Tổng cộng</span>
                <span className="text-display-lg text-[32px] font-bold text-primary leading-none">
                  {selectedServices.length > 0 ? `${(selectedServices.reduce((total, s) => total + (s.price || 0), 0) / 1000)}k` : '0đ'}
                </span>
              </div>
              <button 
                onClick={onConfirm}
                disabled={!isReady || isLoading}
                className={`w-full font-headline-md py-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
                  isReady && !isLoading
                    ? 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(255,222,165,0.3)] active:scale-95 cursor-pointer' 
                    : 'bg-surface-variant text-outline cursor-not-allowed'
                }`}
              >
                <span>{isLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}</span>
                {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
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
