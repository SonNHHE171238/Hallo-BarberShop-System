"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminOrderDetailPage({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCodModalOpen, setIsCodModalOpen] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const confirmCOD = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/pay-cod`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success("Xác nhận thu tiền thành công!");
        setOrder(res.data.data);
        setIsCodModalOpen(false);
      }
    } catch (error) {
      toast.error("Lỗi xác nhận thu tiền COD");
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, { withCredentials: true });
      if (res.data.success) {
        setOrder(res.data.data);
        setInternalNote(res.data.data.internalNote || "");
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng", error);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const saveInternalNote = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/note`, { internalNote }, { withCredentials: true });
      if (res.data.success) {
        toast.success("Lưu ghi chú thành công");
      }
    } catch (error) {
      toast.error("Lỗi khi lưu ghi chú");
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus,
        note: statusNote
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        setOrder(res.data.data);
        setIsModalOpen(false);
        setStatusNote("");
      }
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;
  }

  if (!order) return <div className="p-8 text-center">Không tìm thấy đơn hàng</div>;

  // Format Helpers
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  const getPaymentMethod = (method) => {
    if (method === 'cod') return "Thanh toán khi nhận hàng (COD)";
    return "Chuyển khoản QR (PayOS)";
  };

  const shortId = order.orderCode ? order.orderCode : order._id.slice(-6).toUpperCase();

  // Stepper logic
  const steps = [
    { key: 'pending', label: 'Đã đặt', icon: 'shopping_bag' },
    { key: 'processing', label: 'Đang chuẩn bị', icon: 'inventory_2' },
    { key: 'shipped', label: 'Đang giao', icon: 'local_shipping' },
    { key: 'completed', label: 'Hoàn thành', icon: 'verified' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-[1400px] mx-auto w-full space-y-10 text-on-surface">
      {/* Header Inline */}
      <header className="bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/30 rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-2 text-[13px] font-medium text-on-surface-variant/70">
            <Link className="hover:text-primary transition-colors" href="/admin/orders">Về danh sách</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">#{shortId}</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-surface-container border border-outline-variant/30 text-on-surface px-5 py-2 text-[12px] font-label-md uppercase tracking-widest hover:bg-surface-variant transition-all flex items-center gap-2 rounded">
            <span className="material-symbols-outlined text-[18px]">print</span> In hóa đơn
          </button>
          {order.status === 'pending' && (
            <button
              className="bg-primary text-on-primary px-6 py-2 text-[12px] font-label-md font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg rounded"
              onClick={() => updateStatus('processing')}
            >
              Đã chuẩn bị hàng xong
            </button>
          )}
          {order.status === 'processing' && (
            <button
              className="bg-primary text-on-primary px-6 py-2 text-[12px] font-label-md font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg rounded"
              onClick={() => updateStatus('shipped')}
            >
              Đang giao hàng
            </button>
          )}
          {order.status === 'shipped' && (
            <div className="flex gap-2">
              <button
                className="bg-error/20 text-error border border-error/50 px-4 py-2 text-[11px] font-label-md font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-all rounded"
                onClick={() => updateStatus('cancelled')}
              >
                Giao không thành công
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 text-[11px] font-label-md font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg rounded"
                onClick={() => updateStatus('completed')}
              >
                Giao thành công
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Order Overview Summary */}
      <section className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 p-8 rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Order Code</p>
            <p className="font-headline-sm text-lg font-bold text-primary">#{shortId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Ngày tạo</p>
            <p className="text-[14px] text-on-surface font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Khách hàng</p>
            <p className="text-[14px] text-on-surface">{order.userId ? "Thành viên" : "Khách vãng lai"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Thanh toán</p>
            <p className="text-[14px] text-on-surface">{getPaymentMethod(order.paymentMethod)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Trạng thái TT</p>
            {order.paymentStatus === 'paid' ? (
              <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-green-900/20 text-green-400 border border-green-700/30">Đã thanh toán</span>
            ) : order.paymentStatus === 'failed' ? (
              <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-error/20 text-error border border-error/30">Thất bại</span>
            ) : (
              <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-error-container/20 text-error border border-error/20">Chờ TT</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Trạng thái ĐH</p>
            <span className={`inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider border ${isCancelled ? 'bg-error/20 text-error border-error/30' : 'bg-primary/10 text-primary border-primary/20'}`}>
              {order.status}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Fulfillment</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-surface-container-highest text-outline border border-outline-variant/30">In-house</span>
          </div>
        </div>
      </section>

      {/* Elegant Stepper */}
      <section className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 p-8 overflow-x-auto rounded-xl">
        <div className="flex items-center min-w-[800px]">
          {isCancelled ? (
            <div className="w-full text-center py-4">
              <span className="material-symbols-outlined text-4xl text-error mb-2">cancel</span>
              <p className="text-error font-bold tracking-widest uppercase">Đơn hàng đã bị hủy</p>
            </div>
          ) : steps.map((step, index) => {
            const isActive = currentStepIndex >= index;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-3 w-32 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-on-primary ring-4 ring-primary/5' : 'bg-surface-container-highest border border-outline-variant/30 text-outline'}`}>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{step.icon}</span>
                  </div>
                  <span className={`font-label-md text-[10px] uppercase tracking-tighter ${isActive ? 'text-primary font-bold' : 'text-outline'}`}>{step.label}</span>
                </div>
                {!isLast && <div className={`h-[1px] flex-grow ${isActive ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Order Items */}
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
            <div className="px-8 py-8 bg-white/[0.01] space-y-3">
              <div className="flex justify-end gap-12 pt-6 border-t border-white/10">
                <span className="font-headline-sm text-lg font-bold text-on-surface uppercase tracking-wider">Tổng cộng:</span>
                <span className="font-headline-sm text-2xl text-primary font-bold w-32 text-right">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 p-8 rounded-xl">
            <h3 className="font-headline-md text-xl text-on-surface mb-8">Lịch sử xử lý</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">

              {!order.historyLog || order.historyLog.length === 0 ? (
                <p className="text-outline text-sm italic pl-8">Chưa có lịch sử xử lý nào được ghi nhận.</p>
              ) : (
                [...order.historyLog].reverse().map((log, idx) => (
                  <div key={idx} className="flex gap-6 relative">
                    <div className={`w-[23px] h-[23px] rounded-full border-4 border-surface-container z-10 ${idx === 0 ? 'bg-primary' : 'bg-white/20'}`}></div>
                    <div className="flex-1 -mt-1">
                      <div className="flex justify-between items-start">
                        <p className={`font-semibold ${idx === 0 ? 'text-primary' : 'text-on-surface'}`}>{log.action}</p>
                        <span className="font-label-md text-[11px] text-outline uppercase">{formatDate(log.timestamp)}</span>
                      </div>
                      {log.note && (
                        <p className="mt-2 text-[12px] italic text-outline bg-white/[0.03] p-3 border-l-2 border-primary/30">
                          Ghi chú: {log.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 p-8 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-xl text-on-surface">Ghi chú nội bộ</h3>
              <span className="text-[10px] text-outline uppercase tracking-widest font-bold">Chỉ nhân viên</span>
            </div>
            <div className="space-y-4">
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-0 p-4 text-[14px] text-on-surface min-h-[100px] placeholder:text-outline/30 transition-all outline-none rounded"
                placeholder="Thêm ghi chú nội bộ cho nhân viên khác đọc..."
              ></textarea>
              <div className="flex justify-end">
                <button
                  onClick={saveInternalNote}
                  className="bg-surface-container-highest text-primary border border-primary/20 px-6 py-2 font-label-md text-[11px] uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all rounded"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Recipient Info */}
          <div className="bg-surface-container/60 backdrop-blur-md p-8 border-l-4 border-primary rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              <h4 className="font-headline-md text-lg text-on-surface">Thông tin người nhận</h4>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-outline uppercase font-bold tracking-widest block mb-1">Họ và tên</label>
                <p className="text-[16px] text-on-surface font-semibold">{order.customerName}</p>
              </div>
              <div>
                <label className="text-[10px] text-outline uppercase font-bold tracking-widest block mb-1">Số điện thoại</label>
                <p className="text-[15px] text-on-surface font-medium">{order.customerPhone}</p>
              </div>
              <div>
                <label className="text-[10px] text-outline uppercase font-bold tracking-widest block mb-1">Địa chỉ giao hàng</label>
                <p className="text-[14px] text-on-surface leading-relaxed">{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className={`bg-surface-container/60 backdrop-blur-md p-8 border-l-4 rounded-xl ${order.paymentStatus === 'paid' ? 'border-green-500/50' : 'border-error/50'}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className={`material-symbols-outlined text-[20px] ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-error'}`}>account_balance_wallet</span>
              <h4 className="font-headline-md text-lg text-on-surface">Thanh toán</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-outline text-[13px]">Phương thức:</span>
                <span className="text-primary font-label-md text-[12px]">{getPaymentMethod(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline text-[13px]">Trạng thái:</span>
                {order.paymentStatus === 'paid' ? (
                  <span className="text-green-400 font-bold uppercase text-[11px] font-label-md">Đã thanh toán</span>
                ) : (
                  <span className="text-error font-bold uppercase text-[11px] font-label-md">Chưa quyết toán</span>
                )}
              </div>
              <div className="pt-2 flex justify-between items-end">
                <span className="text-outline text-[13px]">Tổng thanh toán:</span>
                <span className="text-primary font-headline-sm font-bold text-xl">{formatPrice(order.totalAmount)}</span>
              </div>
              {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && !isCancelled && (
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => setIsCodModalOpen(true)}
                    className="w-full bg-green-500/10 text-green-400 border border-green-500/30 px-4 py-3 font-label-md uppercase tracking-widest text-[12px] hover:bg-green-500 hover:text-white transition-all rounded font-bold"
                  >
                    Xác nhận đã thu tiền
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Status Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-surface-container border border-primary/20 max-w-2xl w-full p-10 shadow-2xl rounded-xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-headline-md text-2xl text-primary mb-1">Cập nhật trạng thái xử lý</h3>
                <p className="text-[13px] text-outline">Thay đổi trạng thái thực hiện nội bộ cho đơn hàng #{shortId}</p>
              </div>
              <button className="text-outline hover:text-white transition-colors" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => updateStatus('processing')} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === 'processing' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary hover:bg-primary/5'}`}>
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                <div>
                  <p className="font-medium text-[14px]">Start Preparing</p>
                  <p className="text-[11px] text-outline">Bắt đầu soạn sản phẩm & đóng gói.</p>
                </div>
              </button>

              <button onClick={() => updateStatus('shipped')} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === 'shipped' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary hover:bg-primary/5'}`}>
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <div>
                  <p className="font-medium text-[14px]">Mark Shipped</p>
                  <p className="text-[11px] text-outline">Giao cho shipper / Đang vận chuyển.</p>
                </div>
              </button>

              <button onClick={() => updateStatus('completed')} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === 'completed' ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-green-500/50 hover:bg-green-500/5'}`}>
                <span className="material-symbols-outlined text-green-400">task_alt</span>
                <div>
                  <p className="font-medium text-[14px]">Mark Delivered</p>
                  <p className="text-[11px] text-outline">Xác nhận giao hàng thành công.</p>
                </div>
              </button>

              <button onClick={() => updateStatus('cancelled')} className={`flex items-center gap-4 p-4 border transition-all text-left rounded ${order.status === 'cancelled' ? 'border-error bg-error/10' : 'border-white/10 hover:border-error hover:bg-error/5'}`}>
                <span className="material-symbols-outlined text-error">cancel</span>
                <div>
                  <p className="font-medium text-[14px] text-error">Cancel Order</p>
                  <p className="text-[11px] text-outline">Hủy đơn hàng hoàn toàn.</p>
                </div>
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <label className="text-[11px] uppercase tracking-widest text-outline font-bold">Ghi chú trạng thái (Tùy chọn)</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-primary/50 focus:ring-0 p-3 text-[14px] text-on-surface min-h-[80px] outline-none rounded"
                placeholder="Ghi chú người gửi, lý do hủy đơn, hoặc ghi chú đặc biệt..."
              ></textarea>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button className="px-6 py-2 text-[12px] font-label-md uppercase tracking-widest text-outline hover:text-white" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
              <button className="bg-primary text-on-primary px-8 py-3 text-[12px] font-label-md font-bold uppercase tracking-widest rounded" onClick={() => updateStatus(order.status)}>Cập nhật Note (Giữ nguyên Status)</button>
            </div>
          </div>
        </div>
      )}

      {/* COD Payment Confirmation Modal */}
      {isCodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsCodModalOpen(false)}></div>
          <div className="relative bg-surface-container border border-green-500/30 max-w-md w-full p-8 shadow-2xl rounded-xl text-center">
            <span className="material-symbols-outlined text-5xl text-green-400 mb-4">payments</span>
            <h3 className="font-headline-md text-xl text-on-surface mb-2">Xác nhận thu tiền COD</h3>
            <p className="text-[13px] text-outline mb-8">
              Bạn có chắc chắn đã nhận được số tiền <strong className="text-primary">{formatPrice(order.totalAmount)}</strong> từ khách hàng hoặc đơn vị vận chuyển (shipper) cho đơn hàng này chưa?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-6 py-2 text-[12px] font-label-md uppercase tracking-widest text-outline hover:text-white transition-colors"
                onClick={() => setIsCodModalOpen(false)}
              >
                Hủy
              </button>
              <button
                className="bg-green-600 text-white px-8 py-2 text-[12px] font-label-md font-bold uppercase tracking-widest rounded hover:bg-green-500 transition-all shadow-lg"
                onClick={confirmCOD}
              >
                Chắc chắn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
