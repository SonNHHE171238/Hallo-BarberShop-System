"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/utils/formatters";
import { getOrderStatusConfig } from "@/constants/statusMaps";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Bộ lọc
  const [filterTab, setFilterTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PT Thanh toán");
  const [paymentStatus, setPaymentStatus] = useState("Trạng thái TT");
  const [orderStatus, setOrderStatus] = useState("Trạng thái ĐH");
  const [filterDate, setFilterDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Stats cho cards
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipped: 0,
    completed: 0
  });

  const TABS = [
    "Tất cả", "Chờ xử lý", "Đang chuẩn bị", "Đang giao", "Hoàn thành", "Đã hủy"
  ];

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/stats/overview", { withCredentials: true });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê đơn hàng", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(false);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        searchTerm,
        orderStatus: filterTab !== "Tất cả" ? filterTab : orderStatus,
        paymentStatus,
        paymentMethod,
        filterDate
      });
      const res = await axios.get(`http://localhost:5000/api/orders?${queryParams.toString()}`, { withCredentials: true });
      if (res.data.success) {
        if (Array.isArray(res.data.data)) {
          setOrders(res.data.data);
        } else {
          setOrders(res.data.data.orders || []);
          setTotalPages(res.data.data.totalPages || 1);
          setTotal(res.data.data.total || 0);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn hàng", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  useEffect(() => {
    // Reset page to 1 when filters change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [filterTab, searchTerm, paymentMethod, paymentStatus, orderStatus, filterDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [page, filterTab, searchTerm, paymentMethod, paymentStatus, orderStatus, filterDate]);

  // Payment Maps
  const mapPaymentStatus = (status) => {
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

  const filteredOrders = orders; // Backend already filtered


  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full">
      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="glass-panel p-6 border-l-4 border-l-primary hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-body-lg text-on-surface-variant font-medium">Tổng số đơn hàng</h3>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">shopping_bag</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-sm font-display-sm font-bold text-on-surface">{stats.total}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-panel p-6 border-l-4 border-l-yellow-500 hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-body-lg text-on-surface-variant font-medium">Đơn mới/Chờ xử lý</h3>
            <span className="material-symbols-outlined text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">hourglass_empty</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-sm font-display-sm font-bold text-on-surface">{stats.pending}</span>
          </div>
        </div>

        {/* Shipped */}
        <div className="glass-panel p-6 border-l-4 border-l-blue-500 hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-body-lg text-on-surface-variant font-medium">Đang giao hàng</h3>
            <span className="material-symbols-outlined text-blue-500 bg-blue-500/10 p-2 rounded-lg">local_shipping</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-sm font-display-sm font-bold text-on-surface">{stats.shipped}</span>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-panel p-6 border-l-4 border-l-green-500 hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-body-lg text-on-surface-variant font-medium">Hoàn thành</h3>
            <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-2 rounded-lg">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-sm font-display-sm font-bold text-on-surface">{stats.completed}</span>
          </div>
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
            <option>Chờ xử lý</option>
            <option>Đang chuẩn bị</option>
            <option>Đang giao</option>
            <option>Hoàn thành</option>
            <option>Đã hủy</option>
          </select>
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary outline-none text-on-surface"
              title="Lọc theo ngày tạo đơn"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate("")}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-error-container/20 text-error hover:bg-error-container/50 transition-colors"
                title="Xóa bộ lọc ngày"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
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
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-error font-body-md">
                    Lỗi tải dữ liệu. Vui lòng thử lại sau.
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant font-body-md">
                    Không có dữ liệu.
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
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-body-md text-on-surface-variant">
              Hiển thị trang <span className="font-bold text-on-surface">{page}</span> trên tổng <span className="font-bold text-on-surface">{totalPages}</span> trang ({total} đơn hàng)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-all ${page === p ? "bg-primary text-on-primary font-bold" : "text-on-surface-variant hover:text-primary"
                    }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
