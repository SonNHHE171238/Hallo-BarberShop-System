"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPrice, formatDateTime } from "@/utils/formatters";
import { getOrderStatusConfig } from "@/constants/statusMaps";
import OrderStatusModal from "@/components/admin/orders/OrderStatusModal";
import OrderCodModal from "@/components/admin/orders/OrderCodModal";
import OrderCancelModal from "@/components/admin/orders/OrderCancelModal";
import OrderItemsTable from "@/components/admin/orders/OrderItemsTable";
import OrderTimeline from "@/components/admin/orders/OrderTimeline";

export default function AdminOrderDetailPage({
  orderId,
  role = "admin",
  baseRoute = "/admin/orders",
}) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCodModalOpen, setIsCodModalOpen] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [statusNote, setStatusNote] = useState("");

  // Cancel reason modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmingCOD, setIsConfirmingCOD] = useState(false);

  const confirmCOD = async () => {
    if (isConfirmingCOD) {
      toast.error("Hệ thống đang xử lý, vui lòng đợi...");
      return;
    }
    setIsConfirmingCOD(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/pay-cod`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success("Xác nhận thu tiền thành công!");
        setOrder(res.data.data);
        setIsCodModalOpen(false);
      }
    } catch (error) {
      toast.error("Lỗi xác nhận thu tiền COD");
    } finally {
      setIsConfirmingCOD(false);
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrder();
    }
  }, [orderId]);

  const saveInternalNote = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/note`, { internalNote }, { withCredentials: true });
      if (res.data.success) toast.success("Lưu ghi chú thành công");
    } catch (error) {
      toast.error("Lỗi khi lưu ghi chú");
    }
  };

  const updateStatus = async (newStatus, noteOverride) => {
    if (isUpdating) {
      toast.error("Hệ thống đang xử lý, vui lòng đợi...");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus,
        note: noteOverride !== undefined ? noteOverride : statusNote,
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        setOrder(res.data.data);
        setIsModalOpen(false);
        setStatusNote("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  // Mở modal nhập lý do huỷ
  const openCancelModal = () => {
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  // Xác nhận huỷ đơn với lý do
  const confirmCancel = async () => {
    setIsCancelling(true);
    try {
      await updateStatus("cancelled", cancelReason.trim());
      setIsCancelModalOpen(false);
      setCancelReason("");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;
  }

  if (!order) return <div className="p-8 text-center">Không tìm thấy đơn hàng</div>;

  const getPaymentMethod = (method) => {
    if (method === "cod") return "Thanh toán khi nhận hàng (COD)";
    return "Chuyển khoản QR (PayOS)";
  };

  const shortId = order.orderCode ? order.orderCode : order._id.slice(-6).toUpperCase();

  // Stepper logic
  const steps = [
    { key: "pending",    label: "Đã đặt",         icon: "shopping_bag" },
    { key: "processing", label: "Đang chuẩn bị",  icon: "inventory_2" },
    { key: "shipped",    label: "Đang giao",       icon: "local_shipping" },
    { key: "completed",  label: "Hoàn thành",      icon: "verified" },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-[1400px] mx-auto w-full space-y-10 text-on-surface">
      {/* Header */}
      <header className="bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/30 rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-2 text-[13px] font-medium text-on-surface-variant/70">
            <button onClick={() => router.back()} className="hover:text-primary transition-colors">Về danh sách</button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">#{shortId}</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-surface-container border border-outline-variant/30 text-on-surface px-5 py-2 text-[12px] font-label-md uppercase tracking-widest hover:bg-surface-variant transition-all flex items-center gap-2 rounded">
            <span className="material-symbols-outlined text-[18px]">print</span> In hóa đơn
          </button>
          {['pending', 'processing'].includes(order.status) && (
            <button
              onClick={openCancelModal}
              className="bg-surface-container border border-error/50 text-error px-5 py-2 text-[12px] font-label-md uppercase tracking-widest hover:bg-error hover:text-white transition-all flex items-center gap-2 rounded"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span> Huỷ đơn
            </button>
          )}
          {order.status === "pending" && (
            <button
              className="bg-primary text-on-primary px-6 py-2 text-[12px] font-label-md font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg rounded"
              onClick={() => updateStatus("processing")}
            >
              Đã chuẩn bị hàng xong
            </button>
          )}
          {order.status === "processing" && (
            <button
              className="bg-primary text-on-primary px-6 py-2 text-[12px] font-label-md font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg rounded"
              onClick={() => updateStatus("shipped")}
            >
              Đang giao hàng
            </button>
          )}
          {order.status === "shipped" && (
            <div className="flex gap-2">
              <button
                className="bg-error/20 text-error border border-error/50 px-4 py-2 text-[11px] font-label-md font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-all rounded"
                onClick={openCancelModal}
              >
                Giao không thành công
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 text-[11px] font-label-md font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg rounded"
                onClick={() => updateStatus("completed")}
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
            <p className="text-[14px] text-on-surface font-medium">{formatDateTime(order.createdAt)}</p>
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
            {order.paymentStatus === "paid" ? (
              <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-green-900/20 text-green-400 border border-green-700/30">Đã thanh toán</span>
            ) : order.paymentStatus === "failed" ? (
              <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-error/20 text-error border border-error/30">Thất bại</span>
            ) : (
              <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-error-container/20 text-error border border-error/20">Chờ TT</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Trạng thái ĐH</p>
            <span className={`inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider border ${getOrderStatusConfig(order.status).color}`}>
              {getOrderStatusConfig(order.status).label}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Fulfillment</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-label-md uppercase tracking-wider bg-surface-container-highest text-outline border border-outline-variant/30">In-house</span>
          </div>
        </div>
      </section>

      {/* Stepper */}
      <section className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 p-8 overflow-x-auto rounded-xl">
        <div className="flex items-center min-w-[800px]">
          {isCancelled ? (
            <div className="w-full text-center py-4">
              <span className="material-symbols-outlined text-4xl text-error mb-2">cancel</span>
              <p className="text-error font-bold tracking-widest uppercase">Đơn hàng đã bị hủy</p>
              {/* Hiện lý do huỷ nếu có */}
              {order.historyLog?.find(l => l.action?.includes("hủy") || l.action?.includes("Hủy"))?.note && (
                <p className="text-on-surface-variant text-sm mt-2 italic">
                  Lý do: {order.historyLog.find(l => l.action?.includes("hủy") || l.action?.includes("Hủy")).note}
                </p>
              )}
            </div>
          ) : (
            steps.map((step, index) => {
              const isActive = currentStepIndex >= index;
              const isLast = index === steps.length - 1;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-3 w-32 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-on-primary ring-4 ring-primary/5" : "bg-surface-container-highest border border-outline-variant/30 text-outline"}`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{step.icon}</span>
                    </div>
                    <span className={`font-label-md text-[10px] uppercase tracking-tighter ${isActive ? "text-primary font-bold" : "text-outline"}`}>{step.label}</span>
                  </div>
                  {!isLast && <div className={`h-[1px] flex-grow ${isActive ? "bg-primary" : "bg-surface-container-highest"}`}></div>}
                </React.Fragment>
              );
            })
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <OrderItemsTable order={order} />

          {/* Timeline / Lịch sử xử lý */}
          <OrderTimeline historyLog={order.historyLog} />

          {/* Internal Note - chỉ hiện với admin */}
          {role === "admin" && (
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
                />
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
          )}
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
          <div className={`bg-surface-container/60 backdrop-blur-md p-8 border-l-4 rounded-xl ${order.paymentStatus === "paid" ? "border-green-500/50" : "border-error/50"}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className={`material-symbols-outlined text-[20px] ${order.paymentStatus === "paid" ? "text-green-400" : "text-error"}`}>account_balance_wallet</span>
              <h4 className="font-headline-md text-lg text-on-surface">Thanh toán</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-outline text-[13px]">Phương thức:</span>
                <span className="text-primary font-label-md text-[12px]">{getPaymentMethod(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline text-[13px]">Trạng thái:</span>
                {order.paymentStatus === "paid" ? (
                  <span className="text-green-400 font-bold uppercase text-[11px] font-label-md">Đã thanh toán</span>
                ) : (
                  <span className="text-error font-bold uppercase text-[11px] font-label-md">Chưa quyết toán</span>
                )}
              </div>
              <div className="pt-2 flex justify-between items-end">
                <span className="text-outline text-[13px]">Tổng thanh toán:</span>
                <span className="text-primary font-headline-sm font-bold text-xl">{formatPrice(order.totalAmount)}</span>
              </div>
              {order.paymentMethod === "cod" && order.paymentStatus !== "paid" && !isCancelled && (
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
      <OrderStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={order}
        shortId={shortId}
        statusNote={statusNote}
        setStatusNote={setStatusNote}
        updateStatus={updateStatus}
        openCancelModal={openCancelModal}
      />

      {/* COD Confirmation Modal */}
      <OrderCodModal
        isOpen={isCodModalOpen}
        onClose={() => setIsCodModalOpen(false)}
        order={order}
        confirmCOD={confirmCOD}
      />

      {/* Cancel Reason Modal */}
      <OrderCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        shortId={shortId}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        confirmCancel={confirmCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
}
