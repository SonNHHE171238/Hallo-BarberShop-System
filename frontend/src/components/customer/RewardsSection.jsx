"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function RewardsSection() {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vouchers/my-vouchers", {
          withCredentials: true
        });
        if (res.data.success) {
          setVouchers(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch rewards", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getVoucherTypeLabel = (voucher) => {
    const hasProducts = voucher.applicableProducts && voucher.applicableProducts.length > 0;
    const hasServices = voucher.applicableServices && voucher.applicableServices.length > 0;

    if (hasProducts && !hasServices) {
      return { text: "Dành cho Sản Phẩm", icon: "inventory_2" };
    }
    if (hasServices && !hasProducts) {
      return { text: "Dành cho Dịch Vụ", icon: "content_cut" };
    }
    return { text: "Áp dụng Toàn Bộ", icon: "stars" };
  };

  return (
    <section className="flex flex-col gap-8 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-headline-md text-3xl text-on-surface serif-title">Phần Thưởng Tri Ân</h2>
          <p className="text-on-surface-variant italic mt-1">Các mã giảm giá và đặc quyền hiện có của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant rounded-lg p-8 h-32 animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-surface-variant rounded-full"></div>
              <div className="flex flex-col gap-2 flex-grow">
                <div className="h-6 bg-surface-variant rounded w-3/4"></div>
                <div className="h-4 bg-surface-variant rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : vouchers.length > 0 ? (
          vouchers.map((voucher) => {
            const typeInfo = getVoucherTypeLabel(voucher);
            return (
              <div key={voucher._id} className="bg-surface-container-low border border-primary-container/40 rounded-lg p-8 flex items-center gap-6 glow-accent relative overflow-hidden group">
                {/* Background Icon */}
                <div className="absolute right-0 top-0 text-[120px] text-primary-container/5 leading-none pointer-events-none material-symbols-outlined transition-transform group-hover:rotate-12 group-hover:scale-110">
                  {typeInfo.icon}
                </div>
                
                {/* Icon */}
                <div className="h-16 w-16 bg-primary-container/10 border border-primary-container/20 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                  <span className="material-symbols-outlined text-primary-container text-3xl">{typeInfo.icon}</span>
                </div>
                
                {/* Content */}
                <div className="z-10 flex-grow">
                  <div className="inline-flex items-center gap-1 bg-surface-variant px-2 py-0.5 rounded text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[12px]">{typeInfo.icon}</span>
                    {typeInfo.text}
                  </div>
                  <h3 className="font-headline-sm text-xl font-bold text-on-surface serif-title mb-1 uppercase">
                    {voucher.discountType === 'percentage' ? `Giảm ${voucher.discountValue}%` : `Giảm ${formatCurrency(voucher.discountValue)}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30 text-xs font-bold tracking-widest">
                      {voucher.code}
                    </span>
                    <span className="text-on-surface-variant text-xs">
                      (Đơn tối thiểu {formatCurrency(voucher.minOrderValue)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg p-8 flex items-center justify-center text-center opacity-60">
            <div>
              <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2">sentiment_dissatisfied</span>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface serif-title mb-2">Chưa có mã giảm giá nào</h3>
              <p className="text-on-surface-variant text-sm">Hãy quay lại sau để nhận thêm nhiều ưu đãi hấp dẫn nhé.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
