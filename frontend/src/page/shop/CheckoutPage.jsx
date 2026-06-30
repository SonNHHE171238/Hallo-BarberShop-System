"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "bank_transfer"
  });

  // QR Modal State
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
        setCartItems(localCart);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/cart", { withCredentials: true });
        if (res.data.success) {
          setCartItems(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const subTotal = cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0);
  const shippingFee = subTotal > 2000000 ? 0 : 35000;
  const discount = 0; 
  const totalAmount = subTotal + shippingFee - discount;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!formData.customerName || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    try {
      const items = cartItems.map(item => ({
        product: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
      }));

      // Gọi API tạo Order
      const res = await axios.post("http://localhost:5000/api/orders", {
        items,
        totalAmount,
        shippingAddress: formData.address,
        paymentMethod: formData.paymentMethod,
        returnUrl: "http://localhost:3000/shop/checkout/success",
        cancelUrl: "http://localhost:3000/shop/checkout"
      }, { withCredentials: true });

      if (res.data.success) {
        const orderData = res.data.data;
        
        if (formData.paymentMethod === 'bank_transfer') {
          // Hiện QR Code
          setQrData(orderData.qrCode);
          setCurrentOrder(orderData.order);
          setShowQR(true);
        } else {
          // COD - Thành công luôn
          alert("Đặt hàng thành công!");
          localStorage.removeItem('hallo_cart');
          router.push(`/shop/checkout/success?orderCode=${orderData.order.orderCode}&total=${totalAmount}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi tạo đơn hàng.");
    }
  };

  // Polling check trạng thái đơn hàng khi đang mở QR
  useEffect(() => {
    let interval;
    if (showQR && currentOrder) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/orders/${currentOrder._id}`, { withCredentials: true });
          if (res.data.success && res.data.data.status !== 'pending') {
            // Đã thanh toán thành công
            clearInterval(interval);
            setShowQR(false);
            localStorage.removeItem('hallo_cart');
            router.push(`/shop/checkout/success?orderCode=${currentOrder.orderCode}&total=${totalAmount}`);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [showQR, currentOrder, router]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-40 bg-surface-obsidian/80 backdrop-blur-md border-b border-outline-variant shadow-sm h-20">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-full">
          <div className="flex items-center gap-4">
            <Link href="/shop/cart" className="text-on-surface hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label-md text-label-md group-hover:translate-x-[-2px] transition-transform">QUAY LẠI</span>
            </Link>
          </div>
          <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight">HALLO BARBER</div>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-gutter">
            {/* Thông tin giao hàng */}
            <section className="bg-surface-container/60 backdrop-blur-md border border-outline-variant p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">Thông tin giao hàng</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block">HỌ VÀ TÊN</label>
                    <input name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Nhập họ và tên của bạn" type="text" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block">SỐ ĐIỆN THOẠI</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="090 123 4567" type="tel" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block">EMAIL</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all focus:border-primary focus:ring-1 focus:ring-primary" placeholder="example@email.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block">ĐỊA CHỈ NHẬN HÀNG</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all resize-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." rows="3"></textarea>
                </div>
              </div>
            </section>

            {/* Phương thức thanh toán */}
            <section className="bg-surface-container/60 backdrop-blur-md border border-outline-variant p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">Phương thức thanh toán</h2>
              </div>
              <div className="space-y-4">
                <label className="group cursor-pointer block">
                  <input type="radio" name="paymentMethod" value="bank_transfer" checked={formData.paymentMethod === 'bank_transfer'} onChange={handleInputChange} className="hidden peer" />
                  <div className="flex items-center gap-4 p-5 rounded border border-outline-variant bg-surface-container-lowest peer-checked:border-primary peer-checked:bg-surface-container-high transition-all">
                    <div className="w-5 h-5 border-2 border-outline rounded-full flex items-center justify-center peer-checked:border-primary group-hover:border-primary">
                      <div className={`w-2.5 h-2.5 bg-primary rounded-full opacity-0 ${formData.paymentMethod === 'bank_transfer' ? 'opacity-100' : ''}`}></div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">qr_code_2</span>
                    <div className="flex-1">
                      <p className="font-body-md text-on-surface font-medium">Chuyển khoản ngân hàng (QR Code)</p>
                      <p className="text-xs text-on-surface-variant">Tự động xác nhận giao dịch trong 30 giây</p>
                    </div>
                  </div>
                </label>

                <label className="group cursor-pointer block">
                  <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleInputChange} className="hidden peer" />
                  <div className="flex items-center gap-4 p-5 rounded border border-outline-variant bg-surface-container-lowest peer-checked:border-primary peer-checked:bg-surface-container-high transition-all">
                    <div className="w-5 h-5 border-2 border-outline rounded-full flex items-center justify-center peer-checked:border-primary group-hover:border-primary">
                      <div className={`w-2.5 h-2.5 bg-primary rounded-full opacity-0 ${formData.paymentMethod === 'cash' ? 'opacity-100' : ''}`}></div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">local_atm</span>
                    <div className="flex-1">
                      <p className="font-body-md text-on-surface font-medium">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-on-surface-variant">Kiểm tra hàng trước khi thanh toán</p>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant p-8 rounded-lg flex flex-col gap-8">
              <div className="border-b border-outline-variant pb-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">Đơn hàng của bạn</h2>
              </div>
              
              {/* Products List */}
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.productId._id} className="flex gap-4">
                    <div className="w-20 h-24 bg-surface-container-high rounded overflow-hidden flex-shrink-0">
                      <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-body-md text-on-surface font-semibold">{item.productId.name}</p>
                        <p className="text-xs text-on-surface-variant">{item.productId.brand}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-on-surface-variant italic">SL: {item.quantity}</p>
                        <p className="font-label-md text-label-md text-primary">{formatPrice(item.productId.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-outline-variant">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-md">Tạm tính</span>
                  <span className="font-body-md">{formatPrice(subTotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-md">Phí vận chuyển</span>
                  <span className="font-body-md">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between pt-4 mt-2 border-t border-outline-variant">
                  <span className="font-headline-sm text-on-surface font-bold">TỔNG CỘNG</span>
                  <span className="font-headline-sm text-primary font-bold">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* CTA */}
              <button 
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full bg-primary text-on-primary py-5 rounded-lg font-headline-sm uppercase tracking-widest hover:bg-primary-fixed-dim active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
              >
                THANH TOÁN NGAY
              </button>
              <div className="flex items-center justify-center gap-2 text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="text-xs uppercase tracking-tighter">Bảo mật giao dịch bởi SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant w-full mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin-mobile md:px-margin-desktop py-section-padding max-w-container-max mx-auto">
          <div className="space-y-4">
            <div className="font-headline-sm text-headline-sm text-primary font-bold">HALLO BARBER</div>
            <p className="text-on-surface-variant max-w-xs">Di sản ngành tóc hiện đại. Nâng tầm phong cách quý ông với sự tỉ mỉ và đẳng cấp nhất.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Operating Hours</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Us</a>
          </div>
          <div className="space-y-6">
            <div className="text-on-surface-variant opacity-50 text-xs">© 2024 HALLO BARBER. ALL RIGHTS RESERVED.</div>
          </div>
        </div>
      </footer>

      {/* ================= QR CODE MODAL ================= */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h3 className="font-headline-md text-primary text-center mb-6 uppercase tracking-widest">Thanh Toán Đơn Hàng</h3>
            
            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
              <QRCodeSVG value={qrData} size={250} />
            </div>

            <div className="space-y-4 mb-8 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant text-center">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Ngân hàng</span>
                <span className="text-on-surface font-bold text-lg">MB BANK</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Số tài khoản</span>
                <span className="text-primary font-bold text-lg">012345678999</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Số tiền</span>
                <span className="text-primary font-bold text-lg">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Nội dung chuyển khoản</span>
                <span className="text-on-surface font-bold text-lg">{currentOrder?.orderCode}</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-on-surface-variant text-sm animate-pulse">
                Hệ thống đang chờ nhận tiền. Vui lòng không tắt hộp thoại này...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
