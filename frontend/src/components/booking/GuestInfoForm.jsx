import React, { useState } from "react";

export default function GuestInfoForm({ guestInfo, setGuestInfo, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulating API call
    setTimeout(() => {
      window.location.href = '/'; // Replace with actual success redirect
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="glass-card p-8 md:p-10 rounded-xl bg-surface-container/60">
      <h1 className="font-headline-lg text-headline-lg mb-2 text-primary">Xác nhận thông tin</h1>
      <p className="text-on-surface-variant mb-10 font-body-md text-body-md">
        Vui lòng cung cấp thông tin liên hệ để chúng tôi gửi xác nhận đặt lịch qua SMS và Email.
      </p>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 group">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Họ và Tên</label>
            <input 
              required
              name="name"
              value={guestInfo.name}
              onChange={handleChange}
              className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
              placeholder="Nguyễn Văn A" 
              type="text" 
            />
          </div>
          <div className="space-y-2 group">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Số điện thoại</label>
            <input 
              required
              name="phone"
              value={guestInfo.phone}
              onChange={handleChange}
              className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
              placeholder="090 123 4567" 
              type="tel" 
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Email (Không bắt buộc)</label>
          <input 
            name="email"
            value={guestInfo.email}
            onChange={handleChange}
            className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
            placeholder="example@email.com" 
            type="email" 
          />
        </div>

        <div className="space-y-2 group">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">Ghi chú cho Barber</label>
          <textarea 
            name="notes"
            value={guestInfo.notes}
            onChange={handleChange}
            className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all resize-none" 
            placeholder="Bạn có yêu cầu đặc biệt nào không?..." 
            rows="4"
          ></textarea>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-on-primary py-5 px-8 font-headline-sm text-headline-sm font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(233,193,118,0.3)] active:scale-[0.98] transition-all duration-300 flex justify-center items-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                Đang xử lý... <span className="material-symbols-outlined animate-spin">refresh</span>
              </span>
            ) : (
              "Xác Nhận & Đặt Lịch"
            )}
          </button>
          <button 
            type="button"
            onClick={onBack}
            className="md:w-1/3 border-2 border-outline-variant text-on-surface-variant py-5 px-8 font-headline-sm text-headline-sm font-bold uppercase tracking-widest rounded-lg hover:border-primary hover:text-primary active:scale-[0.98] transition-all duration-300"
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}
