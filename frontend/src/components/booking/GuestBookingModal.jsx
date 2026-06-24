import React, { useState } from 'react';

export default function GuestBookingModal({ isOpen, onClose, onSubmit, selectedServices = [], selectedBarber, selectedDate, selectedTime, isLoading }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      return; // Basic validation handled by 'required' attributes
    }
    onSubmit({
      customerName,
      customerPhone,
      customerEmail,
      note
    });
  };

  const dateObj = new Date(selectedDate);
  const dateStr = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface/90 border border-outline-variant rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col md:flex-row">
        
        {/* Left: Form Area */}
        <div className="p-8 md:p-10 flex-1">
          <h2 className="font-headline-lg text-headline-lg mb-2 text-primary">Xác nhận thông tin</h2>
          <p className="text-on-surface-variant mb-8 font-body-md text-body-md">
            Vui lòng cung cấp thông tin liên hệ để chúng tôi giữ lịch và xưng hô cho tiện nhé!
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Họ và Tên *</label>
                <input 
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
                  placeholder="Nguyễn Văn A" 
                  type="text" 
                />
              </div>
              <div className="space-y-2 group">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Số điện thoại *</label>
                <input 
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
                  placeholder="090 123 4567" 
                  type="tel" 
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Email (Không bắt buộc)</label>
              <input 
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
                placeholder="example@email.com" 
                type="email" 
              />
            </div>
            <div className="space-y-2 group">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Ghi chú cho Barber</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all resize-none" 
                placeholder="Bạn có yêu cầu đặc biệt nào không?..." 
                rows="3"
              ></textarea>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-primary text-on-primary py-4 px-6 font-headline-sm text-headline-sm font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(233,193,118,0.3)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Đang xử lý...
                  </>
                ) : (
                  'Xác Nhận Đặt Lịch'
                )}
              </button>
              <button 
                type="button" 
                onClick={onClose}
                disabled={isLoading}
                className="sm:w-1/3 border-2 border-outline-variant text-on-surface-variant py-4 px-6 font-headline-sm text-headline-sm font-bold uppercase tracking-widest rounded-lg hover:border-primary hover:text-primary active:scale-[0.98] transition-all duration-300"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="bg-surface-container-low p-8 border-l border-outline-variant hidden md:block w-80 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5">
            <span className="material-symbols-outlined text-[150px]" style={{ fontVariationSettings: "'FILL' 1" }}>content_cut</span>
          </div>
          <h3 className="font-headline-md text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">receipt_long</span>
            Tóm tắt
          </h3>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Dịch vụ ({selectedServices.length})</p>
              {selectedServices.map(service => (
                <div key={service._id} className="flex justify-between items-center mb-1 border-b border-outline-variant/20 pb-1 last:border-0">
                  <p className="font-bold text-on-surface text-sm">{service.name}</p>
                  <p className="text-sm text-primary">{service.price?.toLocaleString()}đ</p>
                </div>
              ))}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant">
                 <p className="font-bold text-on-surface">Tổng:</p>
                 <p className="font-bold text-primary text-lg">{selectedServices.reduce((total, s) => total + (s.price || 0), 0).toLocaleString()}đ</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Barber</p>
              <p className="font-bold text-on-surface">{selectedBarber ? selectedBarber.name : 'Barber (Tự động)'}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Thời gian</p>
              <p className="font-bold text-on-surface">{selectedTime}</p>
              <p className="text-sm text-on-surface-variant">{dateStr}</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
