"use client";

import React, { useState } from 'react';

const CANCEL_REASONS = [
  "Tôi bận việc đột xuất",
  "Tôi muốn đổi giờ/ngày khác",
  "Tôi tìm được chỗ khác",
  "Tôi đặt nhầm lịch",
  "Lý do khác"
];

export default function CancelBookingModal({ isOpen, onClose, onConfirm, isCanceling }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const reason = selectedReason === "Lý do khác" ? customReason : selectedReason;
    if (!reason.trim()) {
      alert("Vui lòng chọn hoặc nhập lý do huỷ lịch.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-surface-container-low border border-outline-variant w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Huỷ lịch hẹn</h3>
        <p className="text-body-md text-on-surface-variant mb-6">Vui lòng cho chúng tôi biết lý do bạn muốn huỷ lịch hẹn này:</p>
        
        <div className="space-y-3 mb-6 flex-1 overflow-y-auto">
          {CANCEL_REASONS.map((reason, idx) => (
            <label key={idx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedReason === reason ? 'border-primary bg-primary/10' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-variant'}`}>
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="cancelReason" 
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="peer appearance-none w-5 h-5 border border-outline-variant rounded-full checked:border-primary shrink-0 transition-colors cursor-pointer"
                />
                <div className="absolute inset-0 m-auto w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform pointer-events-none"></div>
              </div>
              <span className={`text-body-md ${selectedReason === reason ? 'text-primary font-bold' : 'text-on-surface'}`}>{reason}</span>
            </label>
          ))}
          
          {selectedReason === "Lý do khác" && (
            <div className="mt-3">
              <textarea
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:border-primary outline-none resize-none transition-colors"
                placeholder="Vui lòng nhập lý do của bạn..."
                rows="3"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
              ></textarea>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant shrink-0">
          <button 
            onClick={onClose}
            disabled={isCanceling}
            className="px-5 py-2.5 rounded-lg text-body-md font-bold text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-50"
          >
            Đóng
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === "Lý do khác" && !customReason.trim()) || isCanceling}
            className="px-5 py-2.5 rounded-lg text-body-md font-bold bg-error text-on-error hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isCanceling && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            Xác nhận huỷ
          </button>
        </div>
      </div>
    </div>
  );
}
