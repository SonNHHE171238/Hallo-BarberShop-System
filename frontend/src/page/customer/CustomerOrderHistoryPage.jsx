"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatPrice, formatDate } from "@/utils/formatters";
import { getOrderStatusConfig } from "@/constants/statusMaps";



export default function CustomerOrderHistoryPage() {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          withCredentials: true,
        });
        if (res.data.success) {
          setResults(res.data.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
           router.push('/login');
           return;
        }
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [router]);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-primary selection:text-on-primary">
      <Navbar />
      
      <main className="pt-32 pb-24 lg:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex-grow w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-outline-variant pb-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 serif-heading">Lịch sử mua hàng của bạn</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Quản lý và theo dõi trạng thái các đơn hàng bạn đã đặt mua tại Hallo Barber.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20">
          {loading ? (
            <div className="text-center py-12 text-primary flex flex-col items-center gap-4">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
              <span>Đang tải lịch sử...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-surface-container-low border border-error/30 rounded-xl">
              <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
              <p className="text-error font-body-lg">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low border border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">shopping_cart_off</span>
              <p className="text-on-surface-variant font-body-lg mb-6">Bạn chưa có đơn hàng nào.</p>
              <Link href="/shop" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-headline-sm hover:opacity-90 transition-all">
                <span className="material-symbols-outlined">shopping_bag</span>
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            results.map((order, idx) => {
              const statusInfo = getOrderStatusConfig(order.status);
              return (
                <div key={idx} className="bg-surface-container border border-outline-variant p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all duration-300 ease-out">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full items-center">
                    <div className="lg:col-span-1">
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Mã Đơn</p>
                      <h3 className="font-headline-sm text-headline-sm text-primary truncate">#{order.orderCode}</h3>
                    </div>
                    <div className="lg:col-span-1">
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Ngày đặt</p>
                      <p className="font-body-lg text-body-lg text-on-surface">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="lg:col-span-1">
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Tổng tiền</p>
                      <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div className="lg:col-span-1">
                        <p className="font-label-md text-label-md text-outline uppercase mb-1">Trạng thái</p>
                        <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest border rounded-full inline-block ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                    </div>
                    <div className="lg:col-span-1 flex flex-col justify-center">
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Sản phẩm</p>
                      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                          {order.items && order.items.slice(0, 3).map((item, i) => (
                            <img key={i} src={item.productId?.image || '/placeholder.png'} className="w-8 h-8 rounded-full object-cover border border-outline-variant flex-shrink-0" title={item.productId?.name} alt="Product" />
                          ))}
                          {order.items && order.items.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-on-surface-variant">+{order.items.length - 3}</span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Link href={`/shop/orders/${order.orderCode}?source=customer`} className="w-full md:w-32 py-3 rounded-lg border border-primary text-primary font-bold text-label-md hover:bg-primary/10 transition-colors uppercase tracking-widest text-center flex items-center justify-center">
                      Chi tiết
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
