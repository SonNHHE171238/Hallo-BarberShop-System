import React from "react";
import { formatPrice } from "@/utils/formatters";

export default function OrderItemsTable({ order }) {
  if (!order || !order.items) return null;

  return (
    <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 overflow-hidden rounded-xl">
      <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-headline-md text-xl text-on-surface">Sản phẩm trong đơn</h3>
        <span className="font-label-md text-[12px] text-outline uppercase tracking-widest">
          {order.items.length < 10 ? `0${order.items.length}` : order.items.length} Sản phẩm
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] font-label-md text-[10px] uppercase tracking-[0.15em] text-outline border-b border-white/5">
            <tr>
              <th className="px-8 py-4">Sản phẩm</th>
              <th className="px-4 py-4 text-right">Đơn giá</th>
              <th className="px-4 py-4 text-center">Số lượng</th>
              <th className="px-8 py-4 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-surface-container border border-white/5 flex items-center justify-center overflow-hidden rounded">
                      {item.productId?.image ? (
                        <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-primary/40 italic">HB</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{item.productId?.name || "Sản phẩm không rõ"}</p>
                      <p className="text-[12px] text-outline">SKU: {item.productId?._id?.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-6 text-right font-label-md text-[14px]">{formatPrice(item.priceAtPurchase)}</td>
                <td className="px-4 py-6 text-center text-on-surface">{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</td>
                <td className="px-8 py-6 text-right font-semibold text-primary">{formatPrice(item.priceAtPurchase * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-8 py-8 bg-white/[0.01]">
        <div className="flex justify-end gap-12 pt-6 border-t border-white/10">
          <span className="font-headline-sm text-lg font-bold text-on-surface uppercase tracking-wider">Tổng cộng:</span>
          <span className="font-headline-sm text-2xl text-primary font-bold w-32 text-right">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
