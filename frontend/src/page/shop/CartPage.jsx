"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy giỏ hàng
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
        
        if (localCart.length > 0) {
          try {
            const validatedCart = await Promise.all(localCart.map(async (item) => {
               try {
                 const pId = item.productId._id || item.productId;
                 const res = await axios.get(`http://localhost:5000/api/products/${pId}`);
                 if (res.data.success) {
                   const productInfo = res.data.data;
                   return {
                     ...item,
                     productId: productInfo
                   };
                 }
               } catch (err) {
                 // Sản phẩm không tồn tại (đã bị xóa)
                 return {
                   ...item,
                   productId: { ...item.productId, isActive: false, stock: 0, isDeleted: true }
                 };
               }
               return item;
            }));
            setCartItems(validatedCart);
          } catch (error) {
             console.error("Lỗi validate giỏ hàng guest:", error);
             setCartItems(localCart);
          }
        } else {
          setCartItems(localCart);
        }
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          withCredentials: true 
        });
        if (res.data.success) {
          setCartItems(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const updateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    if (!user) {
       const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
       const updated = localCart.map(i => {
           const pId = i.productId._id || i.productId;
           return pId === productId ? { ...i, quantity: newQuantity } : i;
       });
       localStorage.setItem('hallo_cart', JSON.stringify(updated));
       setCartItems(prev => prev.map(item => item.productId._id === productId ? { ...item, quantity: newQuantity } : item));
       return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/cart/${productId}`, { quantity: newQuantity }, { withCredentials: true });
      if (res.data.success) {
         setCartItems(prev => prev.map(item => item.productId._id === productId ? { ...item, quantity: newQuantity } : item));
      }
    } catch (error) {
       console.error(error);
    }
  };

  const removeItem = async (productId) => {
    if (!user) {
       const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
       const updated = localCart.filter(i => {
           const pId = i.productId._id || i.productId;
           return pId !== productId;
       });
       localStorage.setItem('hallo_cart', JSON.stringify(updated));
       setCartItems(prev => prev.filter(item => item.productId._id !== productId));
       return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/cart/${productId}`, { withCredentials: true });
      setCartItems(prev => prev.filter(item => item.productId._id !== productId));
    } catch (error) {
       console.error(error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const subTotal = cartItems.reduce((total, item) => total + ((item.productId?.price || 0) * item.quantity), 0);
  const shippingFee = subTotal > 2000000 ? 0 : 35000;
  const discount = 0; // Tương lai có thể áp mã giảm giá
  const total = subTotal + shippingFee - discount;

  const hasInvalidItems = cartItems.some(item => !item.productId?.isActive || item.productId?.stock === 0 || item.productId?.isDeleted);

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
      <Navbar />

      <main className="flex-grow pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Page Title */}
        <header className="mb-12">
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase tracking-widest mb-2">Giỏ Hàng Của Bạn</h1>
          <div className="w-24 h-1 bg-primary"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Product List */}
          <div className="lg:col-span-8 space-y-6">
            


            {/* Product List */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-on-surface-variant">Đang tải giỏ hàng...</div>
              ) : cartItems.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant border border-outline-variant/30 bg-surface-container/30">
                  Giỏ hàng của bạn đang trống.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item._id || item.productId?._id || Math.random()} className={`bg-surface-container/60 backdrop-blur-md border border-outline-variant p-6 flex flex-col md:flex-row gap-6 group ${(!item.productId?.isActive || item.productId?.stock === 0 || item.productId?.isDeleted) ? 'opacity-60' : ''}`}>
                    <div className="w-full md:w-32 h-32 overflow-hidden flex-shrink-0 bg-surface-container-high border border-outline-variant relative">
                      <img 
                        src={item.productId?.image || "/placeholder.png"} 
                        alt={item.productId?.name || "Product"}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      />
                      {(!item.productId?.isActive || item.productId?.stock === 0 || item.productId?.isDeleted) && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                          <span className="bg-error text-on-error text-[10px] font-bold uppercase px-2 py-1">Lỗi</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 uppercase tracking-tight">{item.productId?.name || "Sản phẩm không tồn tại"}</h3>
                          <p className="font-body-md text-on-surface-variant text-sm">{item.productId?.brand || ""}</p>
                        </div>
                        <span className="font-headline-sm text-primary">{formatPrice(item.productId?.price || 0)}</span>
                      </div>
                      
                      {(!item.productId?.isActive || item.productId?.stock === 0 || item.productId?.isDeleted) ? (
                        <div className="mt-2 text-error font-bold text-sm uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">error</span>
                          {item.productId?.isDeleted ? "Ngừng kinh doanh" : "Hết hàng"}
                        </div>
                      ) : null}

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-outline-variant">
                          <button 
                            onClick={() => updateQuantity(item.productId._id, item.quantity, -1)}
                            disabled={!item.productId?.isActive || item.productId?.stock === 0 || item.productId?.isDeleted}
                            className="p-2 hover:bg-outline-variant/30 text-on-surface transition-colors disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <input 
                            type="number" 
                            className="w-12 bg-transparent border-none text-center font-label-md text-on-surface focus:ring-0" 
                            min="1" 
                            value={item.quantity}
                            readOnly
                          />
                          <button 
                            onClick={() => updateQuantity(item.productId._id, item.quantity, 1)}
                            disabled={!item.productId?.isActive || item.productId?.stock === 0 || item.productId?.isDeleted}
                            className="p-2 hover:bg-outline-variant/30 text-on-surface transition-colors disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.productId._id || item.productId)}
                          className="flex items-center gap-2 text-on-surface-variant hover:text-error-container transition-colors text-sm uppercase font-bold tracking-tighter"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Back Link */}
            <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:text-primary transition-colors font-headline-sm text-sm uppercase tracking-widest mt-4">
              <span className="material-symbols-outlined">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant p-8 space-y-8">
              <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-4 uppercase tracking-tighter">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4">
                {/* Promo Code */}
                <div className="space-y-2">
                  <label className="font-label-md text-xs text-on-surface-variant uppercase">Mã giảm giá</label>
                  <div className="flex">
                    <input type="text" placeholder="NHẬP MÃ..." className="flex-grow bg-surface-container-lowest border-outline-variant text-on-surface placeholder:text-outline focus:ring-primary focus:border-primary px-4" />
                    <button className="bg-outline-variant text-primary px-4 py-2 font-bold hover:bg-primary hover:text-on-primary transition-all">ÁP DỤNG</button>
                  </div>
                </div>

                {/* Calculations */}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-on-surface-variant">
                    <span className="font-body-md">Tạm tính</span>
                    <span className="font-label-md">{formatPrice(subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span className="font-body-md">Phí vận chuyển</span>
                    <span className="font-label-md">{cartItems.length > 0 ? formatPrice(shippingFee) : '0 ₫'}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span className="font-body-md">Giảm giá</span>
                      <span className="font-label-md">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-outline-variant flex justify-between items-baseline">
                    <span className="font-headline-sm text-on-surface uppercase">Tổng cộng</span>
                    <span className="font-headline-lg text-primary">{cartItems.length > 0 ? formatPrice(total) : '0 ₫'}</span>
                  </div>
                </div>
              </div>

              {hasInvalidItems && (
                <div className="bg-error-container/20 border-l-2 border-error p-3 text-sm text-error mb-4">
                  Có sản phẩm hết hàng hoặc ngừng kinh doanh trong giỏ. Vui lòng xóa đi để tiếp tục.
                </div>
              )}

              <Link href={cartItems.length > 0 && !hasInvalidItems ? "/shop/checkout" : "#"}>
                <button 
                  disabled={cartItems.length === 0 || hasInvalidItems}
                  className="w-full mt-4 bg-primary text-on-primary font-headline-sm font-bold py-5 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  TIẾN HÀNH THANH TOÁN
                  <span className="material-symbols-outlined">trending_flat</span>
                </button>
              </Link>
              
              <div className="text-center">
                <p className="font-body-md text-xs text-outline leading-relaxed italic mt-4">
                  Giá đã bao gồm VAT. Miễn phí vận chuyển cho đơn hàng trên 2.000.000đ.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
