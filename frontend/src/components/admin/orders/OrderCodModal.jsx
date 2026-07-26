import React from "react";
import { formatPrice } from "@/utils/formatters";

export default function OrderCodModal({ isOpen, onClose, order, confirmCOD }) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface-container border border-green-500/30 max-w-md w-full p-8 shadow-2xl rounded-xl text-center">
        <span className="material-symbols-outlined text-5xl text-green-400 mb-4">payments</span>
        <h3 className="font-headline-md text-xl text-on-surface mb-2">Xác nhận thu tiền COD</h3>
        <p className="text-[13px] text-outline mb-8">
          Bạn có chắc chắn đã nhận được số tiền <strong className="text-primary">{formatPrice(order.totalAmount)}</strong> từ khách hàng hoặc đơn vị vận chuyển cho đơn hàng này chưa?
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-2 text-[12px] font-label-md uppercase tracking-widest text-outline hover:text-white transition-colors" onClick={onClose}>Hủy</button>
          <button className="bg-green-600 text-white px-8 py-2 text-[12px] font-label-md font-bold uppercase tracking-widest rounded hover:bg-green-500 transition-all shadow-lg" onClick={confirmCOD}>Chắc chắn</button>
        </div>
      </div>
    </div>
  );
}
