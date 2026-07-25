"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { QRCodeSVG } from 'qrcode.react';
import ProductReviewModal from "@/components/shop/ProductReviewModal";

function OrderDetailContent({ orderCode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);
  const [payosData, setPayosData] = useState(null);
  const [loadingPayos, setLoadingPayos] = useState(false);
  
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonId, setCancelReasonId] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const CANCEL_REASONS = [
    { id: 'wrong_item', label: 'Đặt sai sản phẩm', reorder: true },
    { id: 'wrong_quantity', label: 'Đặt sai số lượng', reorder: true },
    { id: 'forgot_voucher', label: 'Muốn thêm mã giảm giá', reorder: true },
    { id: 'changed_mind', label: 'Không thích sản phẩm này nữa', reorder: false },
    { id: 'better_price', label: 'Tôi tìm thấy bên khác bán giá tốt hơn', reorder: false },
    { id: 'complex_payment', label: 'Thủ tục thanh toán rắc rối', reorder: false },
    { id: 'other', label: 'Lý do khác', reorder: false },
  ];

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/track/${orderCode}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrder();
    }
  }, [orderCode]);

  const fetchReviewedProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderCode}/reviewed-products`);
      if (res.data.success) {
        setReviewedProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (order?.status === 'completed') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReviewedProducts();
    }
  }, [order?.status, orderCode]);

  // Polling check payment status
  useEffect(() => {
    let interval;
    if (payosData && order?.paymentStatus !== 'paid') {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/orders/track/${orderCode}`);
          if (res.data.success && res.data.data.paymentStatus === 'paid') {
            setOrder(res.data.data);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [payosData, orderCode, order?.paymentStatus]);

  const handleGenerateQR = async () => {
    try {
      setLoadingPayos(true);
      const res = await axios.post(`http://localhost:5000/api/orders/track/${orderCode}/recreate-payment`);
      if (res.data.success) {
        setPayosData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Không thể tạo mã QR. Vui lòng thử lại sau.");
    } finally {
      setLoadingPayos(false);
    }
  };

  const confirmCancel = async () => {
    let finalReasonText = "";
    let isReorder = false;

    if (cancelReasonId) {
      const selectedReason = CANCEL_REASONS.find(r => r.id === cancelReasonId);
      finalReasonText = selectedReason.label;
      isReorder = selectedReason.reorder;
      
      if (cancelReasonId === 'other') {
        if (!otherReason.trim()) return;
        finalReasonText = otherReason.trim();
      }
    }

    setIsCancelling(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/track/${orderCode}/cancel`, {
        cancelReason: finalReasonText
      });
      if (res.data.success) {
        if (isReorder && order.items && order.items.length > 0) {
           // Khôi phục giỏ hàng
           const isGuest = !order.userId;
           if (isGuest) {
             const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
             order.items.forEach(item => {
                const existing = localCart.find(c => (c.productId._id || c.productId) === item.productId._id);
                if (existing) {
                   existing.quantity += item.quantity;
                } else {
                   localCart.push({ productId: item.productId._id, quantity: item.quantity });
                }
             });
             localStorage.setItem('hallo_cart', JSON.stringify(localCart));
             router.push('/shop/cart');
             return;
           } else {
             // Dành cho user đăng nhập
             await Promise.all(order.items.map(item => 
                axios.post('http://localhost:5000/api/cart', {
                   productId: item.productId._id,
                   quantity: item.quantity
                }, { withCredentials: true }).catch(e => console.error("Lỗi thêm vào giỏ", e))
             ));
             router.push('/shop/cart');
             return;
           }
        }
        
        setOrder(res.data.data);
        setIsCancelModalOpen(false);
        setCancelReasonId("");
        setOtherReason("");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Không thể huỷ đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Đã bỏ hiệu ứng hover theo yêu cầu

  // Calculate review eligibility - must be before early returns to comply with rules-of-hooks
  const completedLog = order?.historyLog?.find(log => log.action === 'Đơn hàng giao dịch thành công') || order?.historyLog?.[order?.historyLog?.length - 1];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isReviewExpired = useMemo(() => {
    const base = completedLog?.timestamp || order?.updatedAt || order?.createdAt;
    const completedDate = base ? new Date(base) : new Date(0);
    const diffTime = Math.abs(Date.now() - completedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  }, [completedLog, order?.updatedAt, order?.createdAt]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-on-surface flex flex-col items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        <p className="mt-4 text-on-surface-variant font-label-md tracking-widest uppercase">Đang tra cứu đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
        <Navbar />
        <main className="flex-grow pt-32 pb-section-padding px-margin-mobile flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[80px] text-error mb-6">error</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">Không tìm thấy đơn hàng</h1>
          <p className="text-on-surface-variant max-w-md mx-auto mb-8">{error}</p>
          <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 font-bold tracking-widest text-sm rounded hover:scale-105 active:scale-95 transition-all">
            QUAY LẠI CỬA HÀNG
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Formatting helpers
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Tính toán phí
  const discountAmount = order.discountAmount || 0;
  const totalAmount = order.totalAmount;
  const subTotal = order.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

  // Status mapping
  const statusMap = {
    'pending': { label: 'Đơn mới', color: 'bg-primary text-on-primary' },
    'confirmed': { label: 'Đã xác nhận', color: 'bg-secondary text-on-secondary' },
    'processing': { label: 'Đang xử lý', color: 'bg-secondary text-on-secondary' },
    'shipped': { label: 'Đang giao', color: 'bg-tertiary text-on-tertiary' },
    'completed': { label: 'Đã giao', color: 'bg-success text-on-success' },
    'cancelled': { label: 'Đã hủy', color: 'bg-error text-on-error' },
  };

  // Calculate eligible products (isReviewExpired already computed above)
  const eligibleProductsToReview = order?.status === 'completed' && !isReviewExpired
    ? order.items.filter(item => item.productId && !reviewedProducts.includes(item.productId._id)).map(i => i.productId)
    : [];

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md overflow-x-hidden selection:bg-primary selection:text-on-primary">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
            background: rgba(32, 31, 31, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid #4e4639;
        }
        .step-active { color: #ffdea5; }
        .step-active .icon-container { background-color: #ffdea5; color: #412d00; }
        .step-inactive { color: #9a8f80; }
        .step-inactive .icon-container { background-color: #353534; color: #9a8f80; }
      `}} />

      <Navbar />

      <main className="flex-grow pt-32 pb-section-padding">
        {/* Order Detail Hero */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-12">
            <div>
              <button 
                onClick={() => {
                  if (source === 'customer') {
                    router.push('/customer/orders');
                  } else {
                    // For guests, we don't have the phone number in this context unless we pass it, 
                    // but we can just use router.back() or go to lookup
                    router.push('/lookup/orders');
                  }
                }} 
                className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-md text-xs uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Quay lại danh sách
              </button>
              <h1 className="font-headline-lg md:text-6xl text-primary mb-4 italic">Chi tiết đơn hàng</h1>
              <p className="text-on-surface-variant font-body-lg text-body-lg">Cảm ơn bạn đã mua hàng tại Hallo BarberShop.</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-3">
                <span className={`${statusMap[order.status]?.color || 'bg-surface-variant'} px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm`}>
                  {statusMap[order.status]?.label || order.status}
                </span>
                <span className="font-label-md text-label-md text-primary tracking-tighter">#{order.orderCode}</span>
              </div>
              <p className="text-on-surface-variant text-sm">Ngày đặt: {formatDate(order.createdAt)}</p>
              
              {['pending', 'processing'].includes(order.status) && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="bg-error/10 text-error border border-error/40 px-4 py-2 mt-2 font-label-md text-[11px] uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-md rounded active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  YÊU CẦU HUỶ ĐƠN
                </button>
              )}
            </div>
          </div>

          {/* Order Progress Timeline */}
          {order.status === 'cancelled' ? (
            <div className="py-12 text-center border-b border-outline-variant">
              <span className="material-symbols-outlined text-[60px] text-error mb-4">cancel</span>
              <h2 className="text-headline-sm font-bold text-error uppercase tracking-widest">ĐƠN HÀNG ĐÃ BỊ HỦY</h2>
              <p className="text-on-surface-variant mt-2">Vui lòng liên hệ hỗ trợ nếu bạn cần biết thêm chi tiết.</p>
            </div>
          ) : (
            <div className="py-8 border-b border-outline-variant flex flex-col items-center">
              <button 
                onClick={() => setShowTimeline(!showTimeline)}
                className="bg-surface-container-high border border-outline-variant text-on-surface px-6 py-4 rounded-lg font-label-md hover:text-primary transition-colors flex items-center gap-3 shadow-md w-full max-w-2xl justify-between"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span className="text-left font-bold text-sm text-on-surface truncate">
                    {order.historyLog && order.historyLog.length > 0 
                      ? order.historyLog[order.historyLog.length - 1].action 
                      : 'Cập nhật đơn hàng'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0">
                  {showTimeline ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showTimeline && (
                <div className="w-full mt-8 max-w-2xl text-left border border-outline-variant bg-surface-container rounded-lg p-6">
                  <div className="flex flex-col gap-6 relative">
                    {/* Vertical line */}
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                    
                    {order.historyLog && order.historyLog.length > 0 ? (
                      [...order.historyLog].reverse().map((log, idx) => (
                        <div key={idx} className="flex gap-4 relative z-10">
                          <div className={`w-6 h-6 rounded-full flex-shrink-0 border-4 border-surface-container mt-1 ${idx === 0 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                          <div>
                            <p className={`font-bold ${idx === 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>{log.action}</p>
                            <p className="text-xs text-primary mb-1">{new Date(log.timestamp).toLocaleString('vi-VN')}</p>
                            <p className="text-sm text-on-surface-variant">{log.note}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-on-surface-variant text-sm italic pl-8">Chưa có lịch sử cập nhật.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Content: Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="glass-panel p-8 rounded-lg">
                <div className="flex justify-between items-end border-b border-outline-variant pb-4 mb-8">
                  <h2 className="font-headline-md text-headline-md text-primary">Sản phẩm đã mua</h2>
                  {eligibleProductsToReview.length > 0 && (
                    <button 
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-primary text-on-primary px-6 py-2 rounded font-label-md uppercase tracking-widest text-xs hover:bg-primary-fixed-dim transition-colors shadow-md flex items-center gap-2 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">reviews</span>
                      Đánh giá ({eligibleProductsToReview.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-8">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-center">
                      <div className="w-24 h-24 bg-surface-container-highest rounded-sm flex-shrink-0 overflow-hidden group">
                        <div 
                          className="w-full h-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500" 
                          style={{ backgroundImage: `url('${item.productId?.image || '/placeholder.png'}')` }}
                        ></div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-headline-sm text-base text-on-surface line-clamp-2">{item.productId?.name || 'Sản phẩm không xác định'}</h3>
                        <p className="text-on-surface-variant text-sm mt-1">Số lượng: {item.quantity}</p>
                        
                        {/* Logic hiển thị nút Đánh giá */}
                        {order.status === 'completed' && item.productId && (
                          <div className="mt-3">
                            {reviewedProducts.includes(item.productId._id) ? (
                               <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-success bg-success/10 px-2 py-1 rounded">
                                 <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                 Đã đánh giá
                               </span>
                            ) : isReviewExpired ? (
                               <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant bg-surface-variant/20 px-2 py-1 rounded">
                                 <span className="material-symbols-outlined text-[14px]">history</span>
                                 Hết hạn đánh giá
                               </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-headline-sm text-base text-primary">{formatPrice(item.priceAtPurchase * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mt-1">{formatPrice(item.priceAtPurchase)} / cái</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Totals */}
                <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col gap-4">
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Tạm tính</span>
                    <span className="font-label-md text-label-md">{formatPrice(subTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-success">
                      <span>
                        Giảm giá {order.discountType === 'new_user' ? '(Khách mới)' : order.discountType === 'loyalty_points' ? '(Điểm thưởng)' : order.voucherCode ? `(${order.voucherCode})` : ''}
                      </span>
                      <span className="font-label-md text-label-md">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant">
                    <span className="font-headline-md text-headline-md text-primary">Tổng cộng</span>
                    <span className="font-headline-md text-headline-md text-primary">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary & Payment */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Payment Info */}
              <div className="glass-panel p-8 rounded-lg overflow-hidden relative">
                <h2 className="font-headline-sm text-base text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">payments</span>
                  Thanh toán
                </h2>
                
                {order.paymentStatus === 'paid' ? (
                  <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-6 text-center">
                     <p className="text-xs uppercase tracking-widest text-success mb-2">
                       ĐÃ THANH TOÁN
                     </p>
                     <p className="text-xs text-on-surface-variant italic leading-relaxed">
                       {order.paymentMethod === 'cod' 
                          ? 'Đơn hàng COD đã được thanh toán tiền mặt thành công.' 
                          : 'Đơn hàng đã được thanh toán trực tuyến thành công.'}
                     </p>
                   </div>
                ) : order.paymentMethod === 'cod' ? (
                   <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-6 text-center">
                     <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">
                       THANH TOÁN KHI NHẬN HÀNG (COD)
                     </p>
                     <p className="text-xs text-on-surface-variant italic leading-relaxed">
                       Vui lòng chuẩn bị tiền mặt thanh toán cho Shipper.
                     </p>
                   </div>
                ) : order.status === 'cancelled' ? (
                   <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-6 text-center">
                     <p className="text-xs uppercase tracking-widest text-error mb-2">
                       ĐÃ HỦY THANH TOÁN
                     </p>
                     <p className="text-xs text-on-surface-variant italic leading-relaxed">
                       Giao dịch thanh toán đã bị hủy.
                     </p>
                   </div>
                ) : (
                  <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-6 text-center">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">CHỜ CHUYỂN KHOẢN</p>
                    
                    {!payosData ? (
                      <div className="flex flex-col items-center">
                        <div className="w-48 h-48 mx-auto bg-surface-container p-2 rounded-sm mb-4 flex items-center justify-center border border-outline-variant">
                          <span className="material-symbols-outlined text-surface-variant text-[60px]">qr_code_scanner</span>
                        </div>
                        <button 
                          onClick={handleGenerateQR}
                          disabled={loadingPayos}
                          className="bg-primary text-on-primary px-4 py-3 rounded font-label-md text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-3 w-full hover:bg-primary-fixed-dim transition-all shadow-md active:scale-95"
                        >
                          {loadingPayos ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">qr_code_2</span>}
                          {loadingPayos ? 'Đang tạo mã...' : 'Lấy mã QR thanh toán'}
                        </button>
                        <p className="text-xs text-on-surface-variant italic leading-relaxed">
                          Giao dịch chuyển khoản chưa được ghi nhận. Nhấn nút bên trên để lấy thông tin.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center animate-in fade-in duration-500">
                        <div className="w-48 h-48 mx-auto bg-white p-2 rounded-sm mb-4 flex items-center justify-center border-4 border-primary/20">
                          {payosData.qrCode ? (
                            <QRCodeSVG value={payosData.qrCode} size={170} />
                          ) : (
                            <span className="material-symbols-outlined text-surface-variant text-[60px]">qr_code_scanner</span>
                          )}
                        </div>
                        <div className="w-full text-left space-y-2 mb-3 bg-surface-container p-3 rounded-lg text-sm border border-outline-variant">
                          <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                            <span className="text-on-surface-variant text-xs uppercase tracking-widest">Ngân hàng</span>
                            <span className="font-bold text-on-surface">{payosData.bin}</span>
                          </div>
                          <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                            <span className="text-on-surface-variant text-xs uppercase tracking-widest">Tên TK</span>
                            <span className="font-bold text-on-surface">{payosData.accountName}</span>
                          </div>
                          <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                            <span className="text-on-surface-variant text-xs uppercase tracking-widest">Số TK</span>
                            <span className="font-bold text-primary">{payosData.accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant text-xs uppercase tracking-widest">Nội dung</span>
                            <span className="font-bold text-primary bg-primary/10 px-2 rounded">{payosData.orderCode}</span>
                          </div>
                        </div>
                        <p className="text-xs text-on-surface-variant italic leading-relaxed mb-3">
                          Vui lòng dùng App ngân hàng quét mã QR hoặc chuyển khoản với nội dung chính xác.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-warning bg-warning/10 px-3 py-2 rounded-lg border border-warning/30 w-full shadow-inner">
                          <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>
                          <span className="font-label-md text-xs uppercase tracking-widest">Đang chờ tiền...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-outline-variant pt-4 mt-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-primary">
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Cần thanh toán'}
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="glass-panel p-8 rounded-lg">
                <h2 className="font-headline-sm text-base text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">person_pin_circle</span>
                  Thông tin người nhận
                </h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Họ tên</p>
                    <p className="font-headline-sm text-base text-on-surface">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Số điện thoại</p>
                    <p className="font-headline-sm text-base text-on-surface">{order.customerPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 *** $3')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Địa chỉ</p>
                    <p className="font-headline-sm text-base text-on-surface leading-tight">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Support Block - Full Width */}
          <div className="mt-12 mb-24">
            <div className="glass-panel p-8 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-on-surface font-bold text-lg mb-1">Bạn cần hỗ trợ về đơn hàng này?</p>
                <p className="text-on-surface-variant text-sm">Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                <div className="flex items-center gap-3 text-primary whitespace-nowrap">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                  <span className="font-headline-sm text-headline-sm font-bold">0329 888 777</span>
                </div>
                <button className="w-full sm:w-auto border border-primary text-primary px-8 py-3 font-bold tracking-widest text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2 rounded whitespace-nowrap">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  LIÊN HỆ NGAY
                </button>
              </div>
            </div>
          </div>

        </section>
      </main>

      <Footer />
      <ProductReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        products={eligibleProductsToReview}
        orderCode={orderCode}
        onSuccess={(productId) => {
           setReviewedProducts(prev => [...prev, productId]);
        }}
      />

      {/* ====== CANCEL REASON MODAL ====== */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsCancelModalOpen(false)}></div>
          <div className="relative bg-surface-container border border-error/30 max-w-lg w-full p-8 shadow-2xl rounded-xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-error/10 border border-error/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-error text-2xl">cancel</span>
              </div>
              <div>
                <h3 className="font-headline-md text-xl text-error">Xác nhận huỷ đơn hàng</h3>
                <p className="text-[12px] text-outline mt-1">Đơn hàng #{order.orderCode} — Hành động này không thể hoàn tác.</p>
              </div>
              <button className="ml-auto text-outline hover:text-white transition-colors" onClick={() => setIsCancelModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 mb-6">
              <label className="text-[12px] uppercase tracking-widest text-outline font-bold block mb-2">
                Vui lòng chọn lý do huỷ <span className="text-outline font-normal lowercase">(không bắt buộc)</span>
              </label>
              
              <div className="space-y-3">
                {CANCEL_REASONS.map(reason => (
                  <label key={reason.id} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                        type="radio" 
                        name="cancelReason" 
                        value={reason.id}
                        checked={cancelReasonId === reason.id}
                        onChange={() => setCancelReasonId(reason.id)}
                        className="peer appearance-none w-4 h-4 border border-outline-variant rounded-full checked:border-primary checked:border-4 transition-all"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[14px] ${cancelReasonId === reason.id ? 'text-primary font-bold' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                        {reason.label}
                      </span>
                      {reason.reorder && (
                        <span className="text-[11px] text-success italic mt-0.5">Cho phép đặt lại đơn (Tự động thêm hàng vào giỏ)</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {cancelReasonId === 'other' && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="w-full bg-black/40 border border-error/20 focus:border-error/60 focus:ring-0 p-4 text-[14px] text-on-surface min-h-[100px] placeholder:text-outline/40 outline-none rounded transition-all resize-none mt-4 animate-in fade-in"
                  placeholder="Vui lòng nhập lý do cụ thể của bạn..."
                  autoFocus
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-6 py-2.5 text-[12px] font-label-md uppercase tracking-widest text-outline hover:text-white transition-colors rounded border border-white/10 hover:border-white/30"
              >
                Không huỷ
              </button>
              <button
                onClick={confirmCancel}
                disabled={(cancelReasonId === 'other' && !otherReason.trim()) || isCancelling}
                className="bg-error text-white px-8 py-2.5 text-[12px] font-label-md font-bold uppercase tracking-widest rounded hover:bg-error/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-error/20"
              >
                {isCancelling && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                {CANCEL_REASONS.find(r => r.id === cancelReasonId)?.reorder ? 'HUỶ & ĐẶT LẠI' : 'XÁC NHẬN HUỶ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerOrderDetailPage({ orderCode }) {
  return (
    <Suspense fallback={
      <div className="bg-background min-h-screen text-on-surface flex flex-col items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    }>
      <OrderDetailContent orderCode={orderCode} />
    </Suspense>
  );
}
