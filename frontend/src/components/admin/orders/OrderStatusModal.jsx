import React from "react";

export default function OrderStatusModal({ 
  isOpen, 
  onClose, 
  order, 
  shortId, 
  statusNote, 
  setStatusNote, 
  updateStatus, 
  openCancelModal 
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface-container border border-primary/20 max-w-2xl w-full p-10 shadow-2xl rounded-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="font-headline-md text-2xl text-primary mb-1">Cập nhật trạng thái xử lý</h3>
            <p className="text-[13px] text-outline">Thay đổi trạng thái thực hiện nội bộ cho đơn hàng #{shortId}</p>
          </div>
          <button className="text-outline hover:text-white transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => updateStatus("processing")} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === "processing" ? "border-primary bg-primary/10" : "border-white/10 hover:border-primary hover:bg-primary/5"}`}>
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            <div><p className="font-medium text-[14px]">Start Preparing</p><p className="text-[11px] text-outline">Bắt đầu soạn sản phẩm & đóng gói.</p></div>
          </button>
          <button onClick={() => updateStatus("shipped")} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === "shipped" ? "border-primary bg-primary/10" : "border-white/10 hover:border-primary hover:bg-primary/5"}`}>
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <div><p className="font-medium text-[14px]">Mark Shipped</p><p className="text-[11px] text-outline">Giao cho shipper / Đang vận chuyển.</p></div>
          </button>
          <button onClick={() => updateStatus("completed")} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === "completed" ? "border-green-500 bg-green-500/10" : "border-white/10 hover:border-green-500/50 hover:bg-green-500/5"}`}>
            <span className="material-symbols-outlined text-green-400">task_alt</span>
            <div><p className="font-medium text-[14px]">Mark Delivered</p><p className="text-[11px] text-outline">Xác nhận giao hàng thành công.</p></div>
          </button>
          {['pending', 'processing'].includes(order.status) && (
            <button onClick={openCancelModal} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === "cancelled" ? "border-error bg-error/10" : "border-white/10 hover:border-error hover:bg-error/5"}`}>
              <span className="material-symbols-outlined text-error">cancel</span>
              <div><p className="font-medium text-[14px] text-error">Cancel Order</p><p className="text-[11px] text-outline">Huỷ đơn hàng (yêu cầu nhập lý do).</p></div>
            </button>
          )}
        </div>
        <div className="mt-8 space-y-4">
          <label className="text-[11px] uppercase tracking-widest text-outline font-bold">Ghi chú trạng thái (Tùy chọn)</label>
          <textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            className="w-full bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-0 p-3 text-[14px] text-on-surface min-h-[80px] outline-none rounded"
            placeholder="Ghi chú người gửi, hoặc ghi chú đặc biệt..."
          />
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button className="px-6 py-2 text-[12px] font-label-md uppercase tracking-widest text-outline hover:text-white" onClick={onClose}>Hủy bỏ</button>
          <button className="bg-primary text-on-primary px-8 py-3 text-[12px] font-label-md font-bold uppercase tracking-widest rounded" onClick={() => updateStatus(order.status)}>Cập nhật Note (Giữ nguyên Status)</button>
        </div>
      </div>
    </div>
  );
}
