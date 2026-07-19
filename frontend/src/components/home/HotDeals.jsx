"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function HotDeals() {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/vouchers/public`);
        if (res.data && res.data.success) {
          setVouchers(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải vouchers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  if (isLoading) {
    return (
      <section id="deals" className="py-24 bg-surface max-w-[1200px] mx-auto px-4 md:px-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-12 text-center">Ưu Đãi Đặc Biệt</h2>
        <div className="flex justify-center items-center py-12">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </div>
      </section>
    );
  }

  if (vouchers.length === 0) {
    return null; // Không hiển thị nếu không có voucher
  }

  return (
    <section id="deals" className="py-24 bg-surface max-w-[1200px] mx-auto px-4 md:px-16">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-12 text-center">Ưu Đãi Đặc Biệt</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vouchers.map((v, index) => {
          const isPrimary = index % 2 === 0;
          const borderColor = isPrimary ? "border-primary" : "border-secondary";
          const badgeColor = isPrimary ? "text-primary bg-primary/10" : "text-secondary bg-secondary/10";
          const buttonColor = isPrimary 
            ? "bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-on-primary" 
            : "bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary hover:text-on-secondary";
          
          let title = "Voucher giảm giá";
          let subtitle = "";
          
          if (v.discountType === 'percentage') {
             title = `Giảm ${v.discountValue}%`;
             if (v.maxDiscountAmount) {
               subtitle = `Tối đa ${(v.maxDiscountAmount / 1000)}k`;
             }
          } else {
             title = `Giảm ${(v.discountValue / 1000)}k`;
          }

          if (v.minOrderValue > 0) {
            subtitle += subtitle ? ` - Đơn tối thiểu ${(v.minOrderValue / 1000)}k` : `Đơn tối thiểu ${(v.minOrderValue / 1000)}k`;
          }

          let badgeText = "HOT DEAL";
          if (v.voucherType === 'product_only') badgeText = "SẢN PHẨM";
          if (v.voucherType === 'booking_only') badgeText = "DỊCH VỤ";

          return (
            <div key={v._id} className={`bg-gradient-to-r from-[#2a2a2a] to-[#3a3a3a] border-l-4 ${borderColor} p-8 rounded-xl flex items-center justify-between shadow-lg hover:-translate-y-1 transition-transform`}>
              <div>
                <span className={`font-label-md text-label-md px-3 py-1 rounded mb-4 inline-block ${badgeColor}`}>
                  {badgeText}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{title}</h3>
                <p className="text-on-surface-variant font-body-md text-body-md">Mã: <strong className="text-on-surface">{v.code}</strong></p>
                {subtitle && <p className="text-on-surface-variant font-body-md text-xs mt-1">{subtitle}</p>}
              </div>
              <button 
                onClick={() => handleCopy(v.code)}
                className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all active:scale-95 whitespace-nowrap ml-4 ${buttonColor}`}
              >
                Sao chép
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
