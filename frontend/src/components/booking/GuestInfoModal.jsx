import React, { useState } from "react";

export default function GuestInfoModal({ onClose, bookingData }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="glass-card bg-surface-container-high p-8 rounded-xl max-w-md w-full border border-primary text-center shadow-[0_0_30px_rgba(233,193,118,0.2)]">
          <span className="material-symbols-outlined text-primary text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h2 className="text-headline-md font-headline-md text-primary mb-2">Đặt Lịch Thành Công!</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Cảm ơn anh {name} đã đặt lịch. Chúng tôi sẽ liên hệ lại qua số {phone} để xác nhận trong ít phút tới.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline-sm hover:bg-primary-container transition-all"
          >
            Quay về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card bg-surface-container p-8 rounded-xl max-w-md w-full border border-outline-variant relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Thông Tin Liên Hệ</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          Vui lòng để lại thông tin để chúng tôi xác nhận lịch hẹn của bạn.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Họ và Tên</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Số Điện Thoại</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="VD: 0912345678"
              className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline-sm mt-6 hover:bg-primary-container transition-all flex justify-center items-center gap-2"
          >
            <span>Hoàn Tất</span>
            <span className="material-symbols-outlined">done</span>
          </button>
        </form>
      </div>
    </div>
  );
}
