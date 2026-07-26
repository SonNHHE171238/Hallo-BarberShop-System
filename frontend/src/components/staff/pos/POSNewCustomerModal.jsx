import React from "react";
import toast from "react-hot-toast";

export default function POSNewCustomerModal({
  show,
  onClose,
  newCustomerInfo,
  setNewCustomerInfo,
  handleSaveNewCustomer,
  normalizePhone,
  handlePhonePaste,
  isValidEmail,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-surface-obsidian/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-fade-in slide-in-from-bottom-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary">person_add</span>
          </div>
          <h2 className="font-headline-sm text-xl text-on-surface">Thêm Khách Mới</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-outline-variant">Tên khách hàng <span className="text-error">*</span></label>
            <input 
              type="text" 
              className="bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
              value={newCustomerInfo.name}
              onChange={(e) => setNewCustomerInfo({...newCustomerInfo, name: e.target.value})}
              placeholder="Nguyễn Văn A..."
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-outline-variant">Số điện thoại <span className="text-error">*</span></label>
            <input 
              type="tel" 
              className="bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
              value={newCustomerInfo.phone}
              onChange={(e) => setNewCustomerInfo({...newCustomerInfo, phone: normalizePhone(e.target.value)})}
              onPaste={(e) => handlePhonePaste(e, (val) => setNewCustomerInfo(prev => ({ ...prev, phone: val })))}
              placeholder="0912345678"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-outline-variant">Email / Ghi chú</label>
            <input 
              type="text" 
              className="bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
              value={newCustomerInfo.emailOrNote}
              onChange={(e) => setNewCustomerInfo({...newCustomerInfo, emailOrNote: e.target.value})}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v.includes('@') && !isValidEmail(v)) {
                  toast.error('Email không hợp lệ.');
                }
              }}
              placeholder="email@example.com hoặc ghi chú đặc biệt"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-outline-variant/30">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-surface-variant transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSaveNewCustomer}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Lưu Khách Hàng
          </button>
        </div>
      </div>
    </div>
  );
}
