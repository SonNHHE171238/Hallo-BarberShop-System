"use client";

import React, { useState } from "react";
import useSWR from "swr";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { bookingService } from "@/services/booking.service";
import toast from "react-hot-toast";

export default function CustomerHistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetcher = async () => {
    const response = await bookingService.getMyBookings();
    return response?.bookings || [];
  };

  const { data: bookings = [], error, isLoading, mutate: fetchBookings } = useSWR('/api/bookings/my-history', fetcher, { 
    revalidateOnFocus: true 
  });

  if (error) {
    toast.error("Không thể tải lịch sử đặt lịch.");
  }

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Bạn có chắc chắn muốn huỷ lịch hẹn này không?")) {
      try {
        await bookingService.cancelBooking(bookingId);
        toast.success("Đã huỷ lịch hẹn thành công!");
        fetchBookings(); // Tải lại danh sách
      } catch (error) {
        toast.error(error.message || "Không thể huỷ lịch hẹn.");
      }
    }
  };

  const handleRebook = () => {
    // Placeholder cho tính năng đặt lại
    router.push("/booking");
  };

  const handleReview = () => {
    // Placeholder cho tính năng review
    toast("Tính năng đánh giá đang được phát triển!", { icon: "🚧" });
  };

  // Filter & Search Logic
  const filteredBookings = bookings.filter((booking) => { const searchMatch = booking.serviceId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || booking.barberId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()); let filterMatch = true; if (filter === 'pending') { filterMatch = booking.status === 'pending' || booking.status === 'confirmed'; } else if (filter === 'completed') { filterMatch = booking.status === 'completed'; } else if (filter === 'cancelled') { filterMatch = booking.status === 'cancelled' || booking.status === 'no_show'; } return searchMatch && filterMatch; });



  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex-grow w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 serif-heading">Lịch sử đặt lịch</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Xem lại hành trình chăm sóc ngoại hình của bạn. Quản lý các cuộc hẹn sắp tới hoặc đặt lại những dịch vụ yêu thích từ quá khứ.
            </p>
          </div>
          {/* Search and Filter Bar */}
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[280px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface-container border border-outline-gold text-on-surface pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline transition-all"
                placeholder="Tìm dịch vụ hoặc barber..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="bg-surface-container border border-outline-gold px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors appearance-none pr-10 focus:outline-none focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23c5a059" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>') no-repeat right 12px center / 16px, #201f1f` }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </div>
        </div>

        {/* Appointment Grid/List */}
        <div className="grid grid-cols-1 gap-6 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20">
          {isLoading ? (
            <div className="text-center py-12 text-primary flex flex-col items-center gap-4">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
              <span>Đang tải lịch sử...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low border border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">event_busy</span>
              <p className="text-on-surface-variant font-body-lg">Không tìm thấy lịch hẹn nào phù hợp.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const isPending = booking.status === "pending" || booking.status === "confirmed";
              const isCompleted = booking.status === "completed";
              const isCancelled = booking.status === "cancelled" || booking.status === "no_show" || booking.status === "rejected";

              // Services
              const serviceName = booking.serviceId?.name || (booking.services && booking.services.length > 0 ? booking.services.map(s => s.name).join(", ") : "N/A");
              const price = booking.serviceId?.price || booking.totalPrice || 0;
              const barberName = booking.barberId?.userId?.name || "Khách Vãng Lai";

              // Format Date & Time
              const dateObj = new Date(booking.bookingDate);
              const dateStr = dateObj.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
              const timeStr = booking.timeSlot;

              return (
                <div
                  key={booking._id}
                  className={`bg-surface-container border border-outline-gold hover:border-primary hover:-translate-y-1 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all duration-300 ease-out ${isCancelled ? 'opacity-75 grayscale' : ''}`}
                >
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full">
                    <div>
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Dịch vụ</p>
                      <h3 className="font-headline-sm text-headline-sm text-primary">{serviceName}</h3>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Barber</p>
                      <p className="font-body-lg text-body-lg text-on-surface">{barberName}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Thời gian</p>
                      <p className="font-body-lg text-body-lg text-on-surface">{timeStr}<br />{dateStr}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-outline uppercase mb-1">Giá tiền</p>
                      <p className="font-headline-sm text-headline-sm text-on-surface">{price.toLocaleString()}đ</p>
                      <div className="mt-2">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                    {isPending && (
                      <>
                        <button className="w-full md:w-32 py-3 rounded-lg border border-primary text-primary font-bold text-label-md hover:bg-primary/10 transition-colors uppercase tracking-widest">Chi tiết</button>
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="w-full md:w-32 py-3 rounded-lg border border-error/50 text-error font-bold text-label-md hover:bg-error/10 transition-colors uppercase tracking-widest"
                        >
                          Huỷ Lịch
                        </button>
                      </>
                    )}
                    {isCompleted && (
                      <>
                        <button
                          onClick={handleRebook}
                          className="w-full md:w-32 py-3 rounded-lg bg-primary text-on-primary font-bold text-label-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest"
                        >
                          Đặt Lại
                        </button>
                        <button
                          onClick={handleReview}
                          className="w-full md:w-32 py-3 rounded-lg border border-outline-gold text-on-surface-variant font-bold text-label-md hover:bg-surface-container-high transition-colors uppercase tracking-widest"
                        >
                          Review
                        </button>
                      </>
                    )}
                    {isCancelled && (
                      <button
                        onClick={handleRebook}
                        className="w-full md:w-32 py-3 rounded-lg bg-primary text-on-primary font-bold text-label-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest"
                      >
                        Đặt Lại
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
