import React from "react";

export default function OrderCancelModal({
  isOpen,
  onClose,
  shortId,
  cancelReason,
  setCancelReason,
  confirmCancel,
  isCancelling
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface-container border border-error/30 max-w-lg w-full p-8 shadow-2xl rounded-xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-error/10 border border-error/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-error text-2xl">cancel</span>
          </div>
          <div>
            <h3 className="font-headline-md text-xl text-error">Xác nhận huỷ đơn hàng</h3>
            <p className="text-[12px] text-outline mt-1">Đơn hàng #{shortId} — Hành động này không thể hoàn tác.</p>
          </div>
          <button className="ml-auto text-outline hover:text-white transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 mb-6">
          <label className="text-[11px] uppercase tracking-widest text-outline font-bold block">
            Lý do huỷ đơn <span className="text-outline font-normal lowercase">(không bắt buộc)</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full bg-black/40 border border-error/20 focus:border-error/60 focus:ring-0 p-4 text-[14px] text-on-surface min-h-[120px] placeholder:text-outline/40 outline-none rounded transition-all resize-none"
            placeholder="Ví dụ: Khách hàng yêu cầu huỷ, hàng hết kho, địa chỉ giao không hợp lệ..."
            autoFocus
          />
          <p className="text-[11px] text-outline italic">
            Lý do sẽ được ghi vào lịch sử xử lý của đơn hàng.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[12px] font-label-md uppercase tracking-widest text-outline hover:text-white transition-colors rounded border border-white/10 hover:border-white/30"
          >
            Không huỷ
          </button>
          <button
            onClick={confirmCancel}
            disabled={isCancelling}
            className="bg-error text-white px-8 py-2.5 text-[12px] font-label-md font-bold uppercase tracking-widest rounded hover:bg-error/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-error/20"
          >
            {isCancelling && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
            Xác nhận huỷ đơn
          </button>
        </div>
      </div>
    </div>
  );
}
