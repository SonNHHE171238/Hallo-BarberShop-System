"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Nếu có truyền param từ trang checkout sang, ta sẽ ưu tiên hiển thị
  const orderCode = searchParams.get('orderCode') || "HB-98231-VN";
  const totalAmount = searchParams.get('total') 
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(searchParams.get('total')) 
    : "1.250.000₫";

  // Ngày giao dự kiến (2 ngày sau)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDate = deliveryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    // Micro-interaction for the loyalty progress bar
    const progressBar = document.querySelector('.loyalty-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
      setTimeout(() => {
        progressBar.style.transition = 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)';
        progressBar.style.width = '75%';
      }, 500);
    }

    // Lấy danh sách sản phẩm gợi ý
    const fetchRandomProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products?limit=20");
        const data = await res.json();
        if (data.success && data.data.products) {
          const shuffled = data.data.products.sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 10));
        }
      } catch (err) {
        console.error("Lỗi lấy sản phẩm gợi ý", err);
      }
    };
    fetchRandomProducts();
  }, []);

  return (
    <div className="bg-surface-obsidian text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(32, 31, 31, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid #4e4639;
        }
        .gold-glow {
            text-shadow: 0 0 15px rgba(255, 222, 165, 0.3);
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
      `}} />

      {/* Top Navigation */}
      <Navbar />

      <main className="flex-grow pt-32 pb-section-padding flex flex-col items-center px-margin-mobile">
        {/* Hero Success Section */}
        <div className="max-w-container-max w-full text-center flex flex-col items-center">
          <div className="mb-8 animate-float">
            <span className="material-symbols-outlined text-[80px] md:text-[120px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary gold-glow mb-4 tracking-tight uppercase">
            CẢM ƠN BẠN ĐÃ MUA SẮM!
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Chúng tôi sẽ thông báo cho bạn ngay khi kiện hàng được gửi đi.
          </p>

          {/* Layout Grid: Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter w-full max-w-4xl">
            {/* Order Summary Card */}
            <div className="md:col-span-8 glass-card p-base md:p-8 rounded-lg text-left flex flex-col justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">receipt_long</span>
                  Chi Tiết Đơn Hàng
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                    <span className="font-label-md text-label-md text-on-surface-variant">MÃ ĐƠN HÀNG</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold tracking-widest uppercase">#{orderCode}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                    <span className="font-label-md text-label-md text-on-surface-variant">DỰ KIẾN GIAO HÀNG</span>
                    <span className="font-label-md text-label-md text-on-surface">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">TỔNG CỘNG</span>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty / Rewards Card */}
            <div className="md:col-span-4 glass-card p-base md:p-8 rounded-lg flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-primary">star</span>
              </div>
              <span className="material-symbols-outlined text-4xl text-primary mb-4">loyalty</span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Thành Viên</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Bạn vừa tích lũy thêm <span className="text-primary font-bold">+150 điểm</span> cho đơn hàng này.
              </p>
              <div className="w-full h-1 bg-outline-variant rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-primary shadow-[0_0_10px_rgba(255,222,165,0.5)] loyalty-progress-bar"></div>
              </div>
              <p className="mt-4 font-label-md text-label-md text-gold-dim">950 / 1200 điểm tới Hạng Vàng</p>
            </div>

            {/* Action Section */}
            <div className="md:col-span-12 mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/shop" className="bg-primary text-on-primary font-headline-sm text-headline-sm px-12 py-4 rounded-lg hover:brightness-110 active:scale-95 transition-all duration-300 uppercase tracking-widest shadow-lg shadow-primary/20 text-center">
                TIẾP TỤC MUA SẮM
              </Link>
              <button className="border-2 border-primary text-primary font-headline-sm text-headline-sm px-12 py-4 rounded-lg hover:bg-primary/5 active:scale-95 transition-all duration-300 uppercase tracking-widest">
                THEO DÕI ĐƠN HÀNG
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="mt-24 w-full max-w-container-max overflow-hidden">
          <div className="flex justify-between items-end mb-8">
            <h3 className="font-headline-md text-2xl text-on-surface uppercase tracking-widest">Sản phẩm gợi ý cho bạn</h3>
            <Link href="/shop" className="text-primary font-label-md text-[12px] uppercase tracking-widest hover:underline whitespace-nowrap ml-4">
              Xem tất cả
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-8 snap-x">
            {relatedProducts.length > 0 ? relatedProducts.map(product => (
              <div key={product._id} className="min-w-[260px] max-w-[260px] snap-start flex flex-col bg-surface-container-low border border-outline-variant/30 rounded-lg overflow-hidden group hover:border-outline-variant transition-all duration-500 shrink-0">
                <Link href={`/shop/${product._id}`} className="block relative aspect-square overflow-hidden bg-background flex items-center justify-center p-4">
                  <img 
                    alt={product.name} 
                    className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
                    src={product.image || "/placeholder.png"} 
                  />
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <span className="font-label-md text-[10px] text-primary uppercase tracking-[0.2em] mb-2">{product.brand}</span>
                  <Link href={`/shop/${product._id}`}>
                    <h4 className="font-body-lg text-base font-bold mb-2 text-white group-hover:text-primary transition-colors line-clamp-2">{product.name}</h4>
                  </Link>
                  <p className="font-label-md text-base font-semibold text-on-surface-variant">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="w-full text-center text-outline py-8">Đang tải sản phẩm gợi ý...</div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
