"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/utils/formatters";
import { getOrderStatusConfig } from "@/constants/statusMaps";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [filterTab, setFilterTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PT Thanh toán");
  const [paymentStatus, setPaymentStatus] = useState("Trạng thái TT");
  const [orderStatus, setOrderStatus] = useState("Trạng thái ĐH");

  // Tạm ẩn phân trang phức tạp, dùng chung 1 page cho MVP

  const TABS = [
    "Tất cả", "Đơn mới", "Chờ thanh toán", "Đã thanh toán", "Đã xác nhận",
    "Đang chuẩn bị", "Chờ gửi ship", "Đã gửi cho ship", "Đang giao",
    "Giao thành công", "Giao thất bại", "Đã hủy"
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/orders", { withCredentials: true });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Payment Maps
  const map = {
    pending: { label: "Chờ TT", color: "bg-error-container/20 text-error border-error/20" },
    paid: { label: "Đã TT", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    failed: { label: "Thất bại", color: "bg-error/20 text-error border-error/30" }
  };
  return map[status] || { label: "Chưa TT", color: "bg-outline-variant/20 text-outline border-outline-variant/30" };
};

const mapPaymentMethod = (method) => {
  if (method === 'cod') return "COD";
  if (method === 'payos' || method === 'bank_transfer') return "QR Pay";
  return method;
};

// Logic lọc đơn hàng
const filteredOrders = orders.filter(order => {
  const matchSearch = searchTerm === "" ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone?.includes(searchTerm) ||
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.orderCode && String(order.orderCode).includes(searchTerm));

  let matchTab = true;
  if (filterTab === "Đơn mới") matchTab = order.status === "pending";
  if (filterTab === "Đã hủy") matchTab = order.status === "cancelled";
  if (filterTab === "Chờ thanh toán") matchTab = order.paymentStatus === "pending" && mapPaymentMethod(order.paymentMethod) === "QR Pay";
  if (filterTab === "Đã thanh toán") matchTab = order.paymentStatus === "paid";

  return matchSearch && matchTab;
});

return (
  <div className="space-y-8 max-w-[1400px] mx-auto w-full">
    {/* PAGE TITLE & CTA */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="text-headline-lg font-headline-lg text-primary italic">Quản Lý Đơn Hàng Online</h2>
        <p className="text-body-md text-on-surface-variant mt-1">Theo dõi và xử lý quy trình vận hành đơn hàng từ đặt hàng đến giao hàng.</p>
      </div>
    </div>

    {/* TABS SYSTEM */}
    <div className="border-b border-outline-variant overflow-x-auto custom-scrollbar">
      <nav className="flex gap-8 min-w-max">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`pb-4 whitespace-nowrap text-label-md uppercase transition-colors ${filterTab === tab
              ? 'text-primary font-bold border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>

    {/* TOOLBAR */}
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-5 relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50"
          placeholder="Tìm Mã đơn, tên khách, SĐT..."
          type="text"
        />
      </div>
      <div className="xl:col-span-7 flex flex-wrap gap-3">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary outline-none min-w-[140px]"
        >
          <option>PT Thanh toán</option>
          <option>Tất cả</option>
          <option>COD</option>
          <option>QR Pay</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary outline-none min-w-[140px]"
        >
          <option>Trạng thái TT</option>
          <option>Tất cả</option>
          <option>Chờ thanh toán</option>
          <option>Đã thanh toán</option>
          <option>Thất bại</option>
        </select>
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary outline-none min-w-[160px]"
        >
          <option>Trạng thái ĐH</option>
          <option>Tất cả</option>
          <option>Đơn mới</option>
          <option>Đang chuẩn bị</option>
          <option>Đang giao</option>
          <option>Hoàn thành</option>
          <option>Đã hủy</option>
        </select>
        <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-md gap-2 cursor-pointer hover:border-primary/50 transition-colors">
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          <span>01/10/2023 - 31/10/2023</span>
        </div>
      </div>
    </div>

    {/* ORDERS TABLE */}
    <div className="bg-surface-container/60 backdrop-blur-md rounded-xl overflow-hidden border border-outline-variant">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/50 border-b border-outline-variant text-label-md text-on-surface-variant">
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Đơn hàng</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Thanh toán</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tiến độ đơn hàng</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Xử lý bởi</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant font-body-md">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const orderStat = getOrderStatusConfig(order.status);
                const paymentStat = mapPaymentStatus(order.paymentStatus);
                const isGuest = !order.userId;
                const shortId = order.orderCode ? order.orderCode : order._id.slice(-6).toUpperCase();

                return (
                  <tr key={order._id} className="hover:bg-surface-variant/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-label-md text-primary">#{shortId}</span>
                        <span className="text-[11px] text-on-surface-variant">{formatDateTime(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{order.customerName}</span>
                        <div className="flex gap-2 mt-1">
                          {isGuest ? (
                            <span className="text-[10px] px-1.5 py-0.5 bg-surface-variant text-on-surface-variant border border-outline-variant rounded">Guest</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">Customer</span>
                          )}
                          <span className="text-on-surface-variant text-[12px]">{order.customerPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-on-surface font-semibold">{mapPaymentMethod(order.paymentMethod)}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 border rounded ${paymentStat.color}`}>
                            {paymentStat.label}
                          </span>
                        </div>
                        <span className="text-primary font-bold">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[11px] font-bold border ${orderStat.color}`}>
                          {orderStat.label}
                        </span>
                        {/* Dòng text mô tả phụ trợ, tạm thời để tĩnh */}
                        <span className="inline-flex w-fit px-2 py-0.5 rounded text-[11px] font-bold bg-surface-variant text-on-surface-variant border border-outline-variant/30">
                          Chưa xử lý
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-[13px]">
                      Auto-system
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order._id}`} className="text-primary hover:underline text-[12px] font-bold uppercase active:scale-95 transition-transform inline-block">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
        <p className="text-body-md text-on-surface-variant">
          Hiển thị <span className="font-bold text-on-surface">1 - {filteredOrders.length}</span> trong <span className="font-bold text-on-surface">{filteredOrders.length}</span> đơn hàng
        </p>
        <div className="flex items-center gap-1 opacity-50 pointer-events-none">
          <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary font-bold rounded">1</button>
          <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

