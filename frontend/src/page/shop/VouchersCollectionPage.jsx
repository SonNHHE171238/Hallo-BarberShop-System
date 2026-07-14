"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function VouchersCollectionPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vouchers/public");
        if (res.data.success) {
          setVouchers(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const handleSaveVoucher = async (voucher) => {
    if (!user) {
      toast("Vui lòng đăng nhập để lưu mã giảm giá!", { icon: "ℹ️" });
      router.push("/login");
      return;
    }

    if (user.role !== "customer") {
      toast("Chỉ khách hàng mới có thể lưu mã giảm giá.", { icon: "⚠️" });
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/vouchers/save",
        { voucherId: voucher._id },
        { withCredentials: true }
      );
      if (res.data.success) {
        // Also copy to clipboard for convenience
        navigator.clipboard.writeText(voucher.code);
        toast.success(`Đã lưu mã ${voucher.code} vào tài khoản! (Đã sao chép)`);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message === "Voucher already saved") {
        toast("Bạn đã lưu mã này rồi!", { icon: "ℹ️" });
      } else {
        toast.error("Lỗi khi lưu mã. Vui lòng thử lại sau.");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none"></div>

      <main className="flex-grow pt-28 pb-16 px-4 md:px-8 lg:px-12 xl:px-20 max-w-[1600px] w-full mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4 animate-fade-in-up">
          <h1 className="text-display-sm md:text-display-md lg:text-display-lg font-display font-bold uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-text">
            Siêu Hội Khuyến Mãi
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto font-light">
            Sưu tầm ngay các đặc quyền giảm giá độc quyền dành riêng cho bạn tại HALLO BARBER. 
            Nâng tầm phong cách với mức giá cực hời!
          </p>
        </div>

        {/* Vouchers Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : vouchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vouchers.map((voucher, index) => (
              <div 
                key={voucher._id} 
                className="group relative bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col justify-between"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Neon Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Ticket Cutouts */}
                <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-r border-outline-variant/50 z-10"></div>
                <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-l border-outline-variant/50 z-10"></div>
                
                {/* Dashed Separator */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-outline-variant/30 z-0"></div>

                {/* Top Half */}
                <div className="relative z-10 pb-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-[32px] text-primary">local_offer</span>
                  </div>
                  <h3 className="text-title-lg font-bold text-on-surface mb-1 uppercase tracking-wider">
                    {voucher.discountType === 'percentage' ? `Giảm ${voucher.discountValue}%` : `Giảm ${formatCurrency(voucher.discountValue)}`}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {voucher.minOrderValue > 0 ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderValue)}` : 'Áp dụng cho mọi đơn hàng'}
                  </p>
                  {voucher.discountType === 'percentage' && voucher.maxDiscountAmount && (
                    <p className="text-body-xs text-on-surface-variant/70 mt-1">
                      Tối đa {formatCurrency(voucher.maxDiscountAmount)}
                    </p>
                  )}
                </div>

                {/* Bottom Half */}
                <div className="relative z-10 pt-8 flex flex-col items-center">
                  <div className="bg-surface-variant/50 px-6 py-2 rounded-lg border border-outline-variant/50 font-mono text-title-md tracking-[0.2em] font-bold text-primary mb-4 w-full text-center">
                    {voucher.code}
                  </div>
                  <div className="flex justify-between items-center w-full mb-6 text-label-sm text-on-surface-variant">
                    <span>HSD: {formatDate(voucher.validUntil)}</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">speed</span> 
                      Còn {voucher.usageLimit - voucher.usedCount} lượt
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleSaveVoucher(voucher)}
                    className="w-full py-3 bg-primary text-on-primary font-label-lg font-bold uppercase tracking-widest rounded-lg hover:bg-primary-fixed transition-colors duration-300 relative overflow-hidden group/btn shadow-lg shadow-primary/20"
                  >
                    <span className="relative z-10">Lưu Mã Ngay</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-low border border-outline-variant rounded-2xl">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50 mb-4 block">sentiment_dissatisfied</span>
            <h3 className="text-title-lg font-bold text-on-surface mb-2">Chưa có mã giảm giá nào</h3>
            <p className="text-body-md text-on-surface-variant">Hiện tại tiệm chưa có chương trình khuyến mãi nào. Vui lòng quay lại sau nhé!</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
