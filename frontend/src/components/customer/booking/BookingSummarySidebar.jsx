import React from 'react';

export default function BookingSummarySidebar({ selectedService, selectedBarber, selectedTime }) {
  // In a real app, these values would be looked up from the selections
  const serviceName = selectedService ? 'Classic Gentleman' : 'Chưa chọn';
  const servicePrice = selectedService ? '350.000đ' : '0đ';
  const barberName = selectedBarber ? 'Hùng Trần' : 'Chưa chọn';
  const timeStr = selectedTime ? `${selectedTime}, Thứ Hai 25/10` : 'Chưa chọn';

  return (
    <aside className="sticky top-28">
      <div className="glass-panel rounded-xl overflow-hidden shadow-2xl border border-primary/30">
        <div className="p-6 border-b border-outline-variant bg-surface-container-high/60">
          <h3 className="font-headline-sm text-primary uppercase tracking-widest">Tóm Tắt Đặt Lịch</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-label-md text-on-surface-variant font-label-md uppercase mb-1">Dịch Vụ</p>
              <p className="font-headline-sm text-on-surface">{serviceName}</p>
            </div>
            <p className="text-primary font-label-md">{servicePrice}</p>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-label-md text-on-surface-variant font-label-md uppercase mb-1">Hallo Barber</p>
              <p className="font-headline-sm text-on-surface">{barberName}</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-label-md text-on-surface-variant font-label-md uppercase mb-1">Thời Gian</p>
              <p className="font-headline-sm text-on-surface">{timeStr}</p>
            </div>
          </div>
          <div className="pt-6 border-t border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <p className="text-on-surface-variant font-body-md">Điểm sẽ nhận:</p>
              <p className="text-primary font-headline-sm">+50 Điểm Obsidian</p>
            </div>
            <p className="text-xs text-on-surface-variant opacity-70 italic">Sử dụng điểm Obsidian để đổi các ưu đãi đặc quyền cho lần sau.</p>
          </div>
          <div className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <p className="font-headline-sm">Tổng cộng</p>
              <p className="text-headline-md text-primary font-bold">{servicePrice}</p>
            </div>
            <button className="w-full bg-primary text-on-primary py-5 font-headline-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-gold-dim transition-all active:scale-95">
              Xác Nhận Đặt Lịch
            </button>
          </div>
        </div>
        <div className="p-4 bg-primary/5 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
          <span className="text-xs font-label-md text-on-surface-variant">Thanh toán sau tại cửa hàng</span>
        </div>
      </div>
      
      {/* Loyalty Teaser */}
      <div className="mt-6 p-6 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-start gap-4">
        <span className="material-symbols-outlined text-primary mt-1">diamond</span>
        <div>
          <h4 className="font-headline-sm text-sm mb-1">Quyền lợi Member</h4>
          <p className="text-xs text-on-surface-variant">Bạn chỉ còn 1,550 điểm để đạt hạng Gold Status với ưu đãi -10% vĩnh viễn.</p>
        </div>
      </div>
    </aside>
  );
}
