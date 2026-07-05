"use client";

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingHistoryCard from "@/components/customer/BookingHistoryCard";

export default function LookupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }
    
    setError("");
    setLoading(true);
    setSearched(true);
    
    try {
      const endpoint = `http://localhost:5000/api/orders/lookup/${phone}`;
        
      const res = await axios.get(endpoint);
      if (res.data.success) {
        setResults(res.data.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setResults([]);
      setError("Có lỗi xảy ra trong quá trình tra cứu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setResults([]);
    setSearched(false);
    setError("");
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const orderStatusMap = {
    'pending': { label: 'Đơn mới', color: 'text-primary border-primary bg-primary/10' },
    'processing': { label: 'Đang chuẩn bị', color: 'text-secondary border-secondary bg-secondary/10' },
    'shipped': { label: 'Đang giao hàng', color: 'text-tertiary border-tertiary bg-tertiary/10' },
    'completed': { label: 'Hoàn thành', color: 'text-success border-success bg-success/10' },
    'cancelled': { label: 'Đã hủy', color: 'text-error border-error bg-error/10' }
  };



  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden selection:bg-primary selection:text-on-primary">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(32, 31, 31, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid #4e4639;
        }
        .gold-glow:focus {
            box-shadow: 0 0 15px rgba(197, 160, 89, 0.3);
            border-color: #c5a059;
        }
      `}} />

      <Navbar />

      <main className="flex-grow flex flex-col items-center pt-32 pb-section-padding px-margin-mobile relative">
        <div className="w-full max-w-3xl z-10">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="font-headline-lg text-headline-lg md:text-5xl text-primary mb-4 tracking-tight italic">Tra cứu đơn hàng</h1>
            <p className="text-on-surface-variant font-body-lg text-body-lg max-w-md mx-auto">
              Nhập số điện thoại bạn đã dùng để kiểm tra thông tin các đơn hàng đã đặt tại Hallo Barber.
            </p>
          </div>

          {/* Lookup Form Card */}
          <div className="glass-card p-8 md:p-12 rounded-xl shadow-2xl relative group overflow-hidden mx-auto max-w-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <form onSubmit={handleSearch} className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-primary uppercase tracking-widest" htmlFor="phone">Số điện thoại</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within/input:text-primary transition-colors">call</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface py-4 pl-12 pr-4 rounded-lg focus:outline-none gold-glow transition-all duration-300 font-body-md text-body-md placeholder:text-outline/50" 
                    id="phone" 
                    placeholder="Nhập số điện thoại của bạn" 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {error && <p className="text-error text-sm mt-1">{error}</p>}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/10 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">search</span>
                )}
                {loading ? "ĐANG TÌM KIẾM..." : "TRA CỨU"}
              </button>

              <div className="flex items-start gap-3 mt-2">
                <span className="material-symbols-outlined text-outline text-[18px] mt-0.5">info</span>
                <p className="text-outline font-body-md text-[13px] leading-relaxed italic">
                  Kết quả tra cứu sẽ hiển thị 20 giao dịch gần nhất tương ứng với số điện thoại được cung cấp.
                </p>
              </div>
            </form>
          </div>

          {/* Results Area */}
          <div className="mt-16 transition-all duration-1000 w-full max-w-2xl mx-auto">
            
            {searched && !loading && results.length === 0 && (
              <div className="animate-fade-in text-center p-8 border border-outline-variant rounded-lg bg-surface-container-lowest">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30">
                    <span className="material-symbols-outlined text-outline text-[48px]" style={{ fontVariationSettings: "'wght' 200" }}>search_off</span>
                  </div>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Không tìm thấy kết quả</h3>
                <p className="text-on-surface-variant font-body-md text-body-md mb-8">
                  Có vẻ như không có đơn hàng nào liên kết với số điện thoại này. Vui lòng kiểm tra lại.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 border border-outline-variant rounded-lg bg-surface-container hover:border-primary transition-colors group cursor-pointer text-center">
                    <span className="material-symbols-outlined text-primary mb-2">support_agent</span>
                    <h4 className="font-headline-sm text-base text-on-surface mb-1">Hotline Hỗ Trợ</h4>
                    <p className="text-on-surface-variant text-sm">0329 888 777</p>
                  </div>
                  <Link href="/shop" className="p-6 border border-outline-variant rounded-lg bg-surface-container hover:border-primary transition-colors group cursor-pointer text-center block">
                    <span className="material-symbols-outlined text-primary mb-2">shopping_bag</span>
                    <h4 className="font-headline-sm text-base text-on-surface mb-1">Tiếp tục mua sắm</h4>
                    <p className="text-on-surface-variant text-sm">Khám phá sản phẩm</p>
                  </Link>
                </div>
              </div>
            )}

            {searched && !loading && results.length > 0 && (
              <div className="animate-fade-in flex flex-col gap-6">
                <h2 className="font-headline-sm text-xl text-primary border-b border-outline-variant pb-2 mb-4">Kết quả tra cứu đơn hàng ({results.length})</h2>
                {results.map((order, idx) => {
                  const statusInfo = orderStatusMap[order.status] || { label: order.status, color: 'text-outline border-outline bg-surface-container' };
                  return (
                    <div key={idx} className="glass-card p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-headline-sm font-bold text-on-surface">Đơn hàng #{order.orderCode}</span>
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest border rounded-sm ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">Ngày đặt: {formatDate(order.createdAt)}</p>
                        
                        {/* Preview items */}
                        {order.items && order.items.length > 0 && (
                          <div className="flex items-center gap-2 mt-4 overflow-x-auto custom-scrollbar pb-2">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-center gap-2 bg-surface-container-high pr-3 rounded-full border border-outline-variant/50 flex-shrink-0">
                                <img src={item.productId?.image || '/placeholder.png'} className="w-8 h-8 rounded-full object-cover" alt="Product" />
                                <span className="text-xs text-on-surface-variant truncate max-w-[100px]">{item.productId?.name}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-xs text-on-surface-variant italic">+ {order.items.length - 3} sản phẩm</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t md:border-t-0 border-outline-variant pt-4 md:pt-0">
                        <span className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Tổng tiền</span>
                        <span className="font-headline-md text-primary text-xl font-bold mb-4">{formatPrice(order.totalAmount)}</span>
                        <Link href={`/shop/orders/${order.orderCode}`} className="w-full md:w-auto border border-primary text-primary px-6 py-2 font-bold tracking-widest text-xs hover:bg-primary hover:text-on-primary transition-all text-center rounded">
                          XEM CHI TIẾT
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
