import React from "react";

export default function BookingSummarySidebar({ selectedServices = [], selectedBarber, selectedDate, selectedTime, paymentMethod, setPaymentMethod, onConfirm, isLoading, isGuest }) {
  const isReady = selectedServices.length > 0 && selectedBarber && selectedDate && selectedTime;
  
  const totalPrice = selectedServices.reduce((total, s) => total + (s.price || 0), 0);
  const depositAmount = isGuest ? Math.round(totalPrice / 2) : totalPrice;

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

            {/* Payment Method Selector */}
            <div className={`flex items-start space-x-4 pt-4 border-t border-outline-variant/30 ${!isReady && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">payments</span>
              <div className="w-full">
                <p className="text-label-md text-on-surface-variant font-bold mb-3">PHƯƠNG THỨC THANH TOÁN</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={!isReady}
                        className="peer appearance-none w-5 h-5 rounded-full border border-outline-variant checked:border-primary transition-colors cursor-pointer"
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                    <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">Thanh toán tại quán (Tiền mặt)</span>
                  </label>
                  
                  {isGuest && paymentMethod === 'cash' && (
                    <div className="mt-2 p-3 bg-surface-variant/50 border border-outline-variant rounded-lg">
                      <p className="text-body-sm text-on-surface-variant flex items-start">
                        <span className="material-symbols-outlined text-[16px] text-error mr-2 mt-0.5">warning</span>
                        <span>Nếu không cọc trước, hệ thống sẽ không giữ cứng chỗ. Nếu bạn đến muộn, chỗ có thể nhường cho khách khác và bạn sẽ bị đánh dấu Không tới (No-show).</span>
                      </p>
                    </div>
                  )}
                  
                  <label className="flex items-center space-x-3 cursor-pointer group mt-2">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="payos"
                        checked={paymentMethod === 'payos'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={!isReady}
                        className="peer appearance-none w-5 h-5 rounded-full border border-outline-variant checked:border-primary transition-colors cursor-pointer"
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                    <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">
                      Chuyển khoản QR ({isGuest ? 'Cọc 50% giữ chỗ' : 'Thanh toán 100%'})
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              {isGuest && paymentMethod === 'payos' ? (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-body-md font-bold text-on-surface-variant">Tạm tính</span>
                    <span className="text-body-md font-bold text-on-surface-variant">
                      {selectedServices.length > 0 ? `${(totalPrice / 1000)}k` : '0đ'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-headline-sm font-bold text-on-surface">Cọc 50%</span>
                    <span className="text-display-lg text-[32px] font-bold text-primary leading-none">
                      {selectedServices.length > 0 ? `${(depositAmount / 1000)}k` : '0đ'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-end mb-8">
                  <span className="text-headline-sm font-bold text-on-surface">Tổng cộng</span>
                  <span className="text-display-lg text-[32px] font-bold text-primary leading-none">
                    {selectedServices.length > 0 ? `${(totalPrice / 1000)}k` : '0đ'}
                  </span>
                </div>
              )}
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
