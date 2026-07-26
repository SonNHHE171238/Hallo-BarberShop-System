"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import toast from "react-hot-toast";
import axios from "axios";
import { QRCodeSVG } from 'qrcode.react';
import { getBookingStatusConfig } from "@/constants/statusMaps";
import { extractTimeSlot, formatDate } from "@/utils/formatters";

export default function GuestBookingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const phone = searchParams.get("phone");
  const source = searchParams.get("source");

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Payment States
  const [showQR, setShowQR] = useState(false);
  const [payosData, setPayosData] = useState(null);
  const [paymentType, setPaymentType] = useState("deposit");

  const fetchBooking = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      if (source === "customer" && !phone) {
        res = await bookingService.getBookingById(id);
      } else {
        res = await bookingService.getGuestBookingDetail(id, phone || "");
      }
      if (res) {
        setBooking(res.data || res);
      }
    } catch (error) {
      toast.error(error.message || "Không thể lấy thông tin lịch hẹn");
    } finally {
      setIsLoading(false);
    }
  }, [id, phone, source]);

  useEffect(() => {
    if (!id || (!phone && source !== "customer")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    fetchBooking();
  }, [id, phone, source, fetchBooking]);

  // Payment Polling
  useEffect(() => {
    let interval;
    if (showQR && id && booking) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/bookings/${id}/payment-status`);
          if (res.data.success && (res.data.data.paymentStatus === "paid" || res.data.data.paymentStatus === "partial_paid")) {
            clearInterval(interval);
            setShowQR(false);
            toast.success("Thanh toán thành công!");
            
            const serviceName = booking.services?.map(s => s.name).join(", ") || "Dịch vụ";
            const timeStr = booking.date ? new Date(booking.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : (booking.time || "N/A");
            const dateStr = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
            
            const queryParams = new URLSearchParams({
              bookingId: booking._id,
              service: serviceName,
              price: booking.totalPrice || 0,
              barber: booking.barberName || "Sắp xếp tự động",
              time: timeStr,
              dateStr: dateStr,
              status: "PAID"
            });
            if (phone) {
              queryParams.append("phone", phone);
            } else if (booking.customerPhone) {
              queryParams.append("phone", booking.customerPhone);
            }
            
            router.push(`/booking/success?${queryParams.toString()}`);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [showQR, id, booking, router]);

  const handlePayment = async (type) => {
    try {
      const amountPaid = booking.amountPaid || 0;
      const remainingVal = Math.max(0, booking.totalPrice - amountPaid);
      const amount = type === "full" ? remainingVal : (booking.totalPrice / 2);
      
      setPaymentType(type);
      toast.loading("Đang khởi tạo mã thanh toán...");

      const serviceName = booking.services?.map(s => s.name).join(", ") || "Dịch vụ";
      const timeStr = booking.date ? new Date(booking.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : (booking.time || "N/A");
      const dateStr = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
      
      const queryParams = new URLSearchParams({
        bookingId: booking._id,
        service: serviceName,
        price: booking.totalPrice || 0,
        barber: booking.barberName || "Sắp xếp tự động",
        time: timeStr,
        dateStr: dateStr,
      });
      if (phone) {
        queryParams.append("phone", phone);
      } else if (booking.customerPhone) {
        queryParams.append("phone", booking.customerPhone);
      }

      const successUrl = `${window.location.origin}/booking/success?${queryParams.toString()}&status=PAID`;
      const cancelUrl = `${window.location.origin}/booking/success?${queryParams.toString()}&payment=cancelled`;

      const paymentRes = await axios.post("http://localhost:5000/api/payment/create-link", {
        bookingId: id,
        amount: Math.round(amount),
        returnUrl: successUrl,
        cancelUrl: cancelUrl
      });
      
      toast.dismiss();
      const resData = paymentRes.data.data || paymentRes.data;
      setPayosData({ ...resData });
      setShowQR(true);
    } catch (error) {
      toast.dismiss();
      console.error("Payment creation error:", error);
      toast.error("Lỗi khi tạo mã thanh toán. Vui lòng thử lại.");
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason) {
      toast.error("Vui lòng nhập lý do hủy lịch.");
      return;
    }
    setIsCancelling(true);
    try {
      await bookingService.guestCancelBooking(id, phone, cancelReason);
      toast.success("Hủy lịch thành công!");
      setShowCancelModal(false);
      fetchBooking();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi hủy lịch.");
    } finally {
      setIsCancelling(false);
    }
  };

  const fetchSlots = useCallback(async (date) => {
    if (!booking?.barberId?._id || !date) return;
    setLoadingSlots(true);
    setSelectedTimeSlot("");
    try {
      const duration = booking.durationMinutes || 30;
      const data = await bookingService.getAvailableSlotsForReschedule(booking.barberId._id, date, duration);
      const slots = Array.isArray(data) ? data : data?.slots || [];
      setAvailableSlots(slots);
    } catch {
      setAvailableSlots([]);
      toast.error("Không thể tải khung giờ.");
    } finally {
      setLoadingSlots(false);
    }
  }, [booking]);

  useEffect(() => {
    if (showRescheduleModal && selectedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSlots(selectedDate);
    }
  }, [selectedDate, showRescheduleModal, fetchSlots]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Vui lòng chọn ngày và giờ mới.");
      return;
    }
    setIsRescheduling(true);
    try {
      await bookingService.guestRescheduleBooking(id, {
        phone,
        bookingDate: selectedDate,
        barberId: booking.barberId._id,
        durationMinutes: booking.durationMinutes
      });
      toast.success("Đổi lịch thành công!");
      setShowRescheduleModal(false);
      fetchBooking();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi đổi lịch.");
    } finally {
      setIsRescheduling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-primary selection:text-on-primary">
        <Navbar />
        <main className="flex-grow w-full pt-32 pb-24 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">autorenew</span>
            <span className="font-label-md text-on-surface-variant uppercase tracking-widest text-sm animate-pulse">Đang tải dữ liệu...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-primary selection:text-on-primary">
        <Navbar />
        <main className="flex-grow w-full pt-32 pb-24 flex justify-center items-center px-4">
          <div className="bg-surface-container-low border border-outline-variant p-8 text-center max-w-md w-full rounded-2xl flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-50">search_off</span>
            <h3 className="font-headline-sm text-on-surface">Không tìm thấy lịch hẹn</h3>
            <p className="font-body-md text-on-surface-variant mb-4">Lịch hẹn này có thể đã bị xóa hoặc bạn nhập sai số điện thoại.</p>
            <button onClick={() => router.push("/lookup/bookings")} className="px-6 py-2.5 rounded-lg bg-surface-container hover:bg-surface-variant text-primary font-label-md tracking-wider uppercase transition-all duration-300 active:scale-95 border border-outline-variant/50">
              Quay lại Tra Cứu
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCompleted = booking.status === "completed";
  const isCancelledOrNoShow = booking.status === "cancelled" || booking.status === "no_show";
  const amountPaid = booking.amountPaid || 0;
  const remaining = Math.max(0, booking.totalPrice - amountPaid);

  const statusInfo = getBookingStatusConfig(booking.status);
  const todayDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-primary selection:text-on-primary">
      <Navbar />
      <main className="flex-grow w-full pt-32 pb-24 lg:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <header className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <button 
              onClick={() => {
                if (source === 'customer') {
                  router.push('/customer/history');
                } else {
                  router.push(`/lookup/bookings?phone=${phone}`);
                }
              }} 
              className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4 font-label-md text-xs uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Quay lại danh sách
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-full border ${statusInfo.color} font-label-md text-xs uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm shadow-sm`}>
                <span className="material-symbols-outlined text-[14px]">{statusInfo.icon}</span>
                {statusInfo.label}
              </span>
              <span className="text-on-surface-variant font-mono text-sm tracking-wider">#{booking._id.slice(-6).toUpperCase()}</span>
            </div>
            <h1 className="font-headline-lg text-headline-md md:text-headline-lg text-on-surface tracking-tight uppercase group">
              Chi tiết lịch hẹn
              <span className="block h-1 w-24 bg-gradient-to-r from-primary to-transparent mt-2 rounded-full opacity-70 group-hover:w-48 transition-all duration-500"></span>
            </h1>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-2xl p-4 md:px-6 md:py-4 flex items-center gap-5 min-w-[220px] shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Thời gian hẹn</span>
              <div className="flex flex-col">
                <span className="font-display-md text-2xl font-bold text-primary tracking-tighter drop-shadow-sm">
                  {extractTimeSlot(booking.timeSlot || booking.bookingDate)}
                </span>
                <span className="font-body-sm text-on-surface-variant/80 mt-0.5">
                  Ngày: {formatDate(booking.bookingDate)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-0">
          
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Action Card for Guest */}
            {!isCancelledOrNoShow && !isCompleted && (
              <div className="bg-surface-container-low border border-primary/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(212,175,55,0.05)]">
                <h2 className="font-label-md text-xs font-bold tracking-widest text-primary uppercase flex items-center gap-2 mb-5 pb-3 border-b border-outline-variant/30">
                  <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                  Tùy Chỉnh Lịch Hẹn
                </h2>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setSelectedDate(new Date(booking.bookingDate).toISOString().split('T')[0]);
                      setShowRescheduleModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                    Đổi ngày / giờ
                  </button>
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-error text-error font-bold uppercase tracking-widest text-sm hover:bg-error/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Hủy lịch hẹn
                  </button>
                </div>
              </div>
            )}

            {/* Barber Card */}
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h2 className="font-label-md text-xs font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-5 pb-3 border-b border-outline-variant/30">
                <span className="material-symbols-outlined text-[18px]">content_cut</span>
                Barber Phụ Trách
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center font-display-sm text-xl text-primary overflow-hidden">
                  {booking.barberId?.userId?.avatarUrl ? (
                    <img src={booking.barberId.userId.avatarUrl} alt="Barber" className="w-full h-full object-cover" />
                  ) : (
                    (booking.barberName && booking.barberName !== "Auto") ? booking.barberName.charAt(0) : "A"
                  )}
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface text-lg mb-1">{booking.barberId?.userId?.name || booking.barberName || "Sắp xếp tự động"}</h3>
                  <p className="font-label-md text-[10px] text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">stars</span>
                    {(booking.barberName === "Auto" || booking.barberName === "Sắp xếp tự động" || !booking.barberName) ? "Hệ thống sắp xếp" : "Chuyên gia Barber"}
                  </p>
                </div>
              </div>
            </div>

            {/* Note Card */}
            {booking.note && (
              <div className="bg-surface-container border border-outline-variant hover:border-primary/30 rounded-2xl p-6 shadow-sm transition-colors">
                <h2 className="font-label-md text-xs font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/30">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Ghi chú của khách
                </h2>
                <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/30">
                  <p className="font-body-md text-sm text-on-surface leading-relaxed italic">
                    &quot;{booking.note}&quot;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Services & Total */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8 flex flex-col h-full shadow-lg relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                  <h2 className="font-label-md text-sm font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
                    Chi Tiết Dịch Vụ
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6 pr-2 max-h-[400px]">
                  {booking.services?.map((service, index) => (
                    <div 
                      key={service._id} 
                      className="bg-surface-container border border-outline-variant rounded-xl p-4 md:p-5 flex justify-between items-center gap-4 hover:border-primary/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-headline-sm text-on-surface text-base md:text-lg mb-1">{service.name}</h4>
                        <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">timer</span>
                          {service.durationMinutes} phút
                        </p>
                      </div>
                      <span className="font-display-md text-lg md:text-xl font-bold text-on-surface tracking-tight whitespace-nowrap">
                        {(service.price || 0).toLocaleString("vi-VN")} <span className="text-sm font-normal text-on-surface-variant">đ</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 border-t border-outline-variant/50 pt-6 mt-auto flex flex-col gap-4">
                  <div className="flex flex-col gap-2 bg-surface-container p-6 rounded-xl border border-outline-variant shadow-inner">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Tổng Dịch Vụ</span>
                      </div>
                      <span className="font-display-md text-xl md:text-2xl font-bold text-on-surface tracking-tighter">
                        {((booking.totalPrice || 0) + (booking.discountAmount || 0)).toLocaleString("vi-VN")} <span className="text-lg font-normal">đ</span>
                      </span>
                    </div>

                    {booking.discountAmount > 0 && (
                      <div className="flex justify-between items-end text-success">
                        <div className="flex flex-col gap-1">
                          <span className="font-label-md text-[11px] font-bold uppercase tracking-widest">
                            Giảm giá {booking.discountType === 'new_user' ? '(Khách mới)' : booking.discountType === 'loyalty_points' ? '(Điểm thưởng)' : booking.voucherCode ? `(${booking.voucherCode})` : ''}
                          </span>
                        </div>
                        <span className="font-display-md text-xl md:text-2xl font-bold tracking-tighter">
                          -{(booking.discountAmount || 0).toLocaleString("vi-VN")} <span className="text-lg font-normal">đ</span>
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-end border-t border-outline-variant/30 pt-4 mt-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Tổng Cộng</span>
                        <span className="font-body-md text-xs text-on-surface-variant opacity-70">Tổng thanh toán</span>
                      </div>
                      <span className="font-display-lg text-3xl md:text-4xl font-extrabold text-primary tracking-tighter drop-shadow-md">
                        {(booking.totalPrice || 0).toLocaleString("vi-VN")} <span className="text-xl text-primary/70 font-normal">đ</span>
                      </span>
                    </div>
                  </div>

                  {!isCancelledOrNoShow && (
                    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 flex flex-col gap-4 shadow-sm">
                      <div className="flex justify-between text-sm text-on-surface-variant">
                        <span>Đã thanh toán</span>
                        <span className="font-mono text-error">- {(amountPaid || 0).toLocaleString("vi-VN")} đ</span>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-outline-variant/30">
                        <span className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">Cần thanh toán thêm</span>
                        <span className="text-2xl font-extrabold text-primary font-mono tracking-tight">{(remaining || 0).toLocaleString("vi-VN")} đ</span>
                      </div>

                      {!isCompleted && remaining > 0 && (
                        <div className={`grid grid-cols-1 ${amountPaid > 0 ? '' : 'md:grid-cols-2'} gap-4 mt-4`}>
                          {amountPaid === 0 && (
                            <button 
                              onClick={() => handlePayment("deposit")}
                              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-primary bg-primary/10 text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-on-primary transition-all duration-300"
                            >
                              <span className="material-symbols-outlined text-[20px]">account_balance</span>
                              Cọc 50%
                            </button>
                          )}
                          <button 
                            onClick={() => handlePayment("full")}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
                          >
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                            {amountPaid === 0 ? "Thanh toán 100%" : "Thanh toán phần còn lại"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container rounded-2xl w-full max-w-md border border-error/30 shadow-2xl overflow-hidden p-6">
            <h2 className="font-headline-md text-error mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">warning</span>
              Xác nhận hủy lịch
            </h2>
            <p className="text-on-surface-variant mb-4">Bạn có chắc chắn muốn hủy lịch hẹn này? Xin lưu ý: chỉ có thể hủy trước giờ hẹn ít nhất 2 tiếng.</p>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-on-surface mb-6 focus:border-error focus:ring-1 focus:ring-error outline-none resize-none"
              placeholder="Nhập lý do hủy (bắt buộc)..."
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-bright"
              >
                Quay lại
              </button>
              <button 
                onClick={handleCancelBooking}
                disabled={isCancelling || !cancelReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-error text-white font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {isCancelling ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                Hủy lịch ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-surface-container rounded-2xl w-full max-w-md border border-primary shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-headline-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit_calendar</span>
                Đổi Lịch Hẹn
              </h2>
              <button onClick={() => setShowRescheduleModal(false)} className="text-on-surface-variant hover:text-error">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="font-label-md text-on-surface block">Chọn ngày mới</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={todayDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-on-surface block">Chọn giờ mới</label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-primary py-2">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span> Đang tải...
                  </div>
                ) : availableSlots.filter(s => s.available).length === 0 ? (
                  <p className="text-error italic py-2">Không có giờ trống cho ngày này.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.filter(s => s.available).map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`py-2 px-3 rounded-lg text-center font-label-md transition-all duration-200 ${selectedTimeSlot === slot.time ? "bg-primary text-on-primary font-bold scale-105" : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"}`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-surface-container-high px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
              <button onClick={() => setShowRescheduleModal(false)} className="px-6 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-bright">Hủy</button>
              <button 
                onClick={handleReschedule}
                disabled={isRescheduling || !selectedTimeSlot || loadingSlots}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {isRescheduling ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Payment */}
      {showQR && payosData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-high rounded-2xl p-8 max-w-md w-full border border-primary shadow-[0_0_40px_rgba(212,175,55,0.15)] flex flex-col items-center relative animate-fade-in">
            <h3 className="font-headline-sm text-primary mb-2 text-center">Thanh toán qua cổng PayOS</h3>
            <p className="font-body-md text-on-surface-variant text-center mb-6">Sử dụng App ngân hàng để quét mã QR</p>
            <div className="bg-white p-4 rounded-xl border-4 border-primary/20 mb-6 flex justify-center w-[240px] h-[240px]">
              {payosData.qrCode ? (
                <QRCodeSVG value={payosData.qrCode} size={200} />
              ) : (
                <div className="w-[240px] h-[240px] flex items-center justify-center bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined text-4xl text-gray-400">qr_code_2</span>
                </div>
              )}
            </div>
            <div className="w-full space-y-3 mb-6 bg-surface-container p-4 rounded-xl border border-outline-variant/30">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-label-md">Ngân hàng:</span>
                <span className="text-on-surface font-bold">{payosData.bin || "PayOS Partner"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-label-md">Chủ tài khoản:</span>
                <span className="text-on-surface font-bold">{payosData.accountName || "HALLO BARBER"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-label-md">Số tài khoản:</span>
                <span className="text-primary font-bold text-lg font-mono tracking-wider">{payosData.accountNumber || "..."}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-outline-variant/30">
                <span className="text-on-surface-variant font-label-md">Số tiền:</span>
                <span className="text-primary font-bold text-xl">{payosData.amount?.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-warning bg-warning/10 px-4 py-3 rounded-lg border border-warning/30 w-full mb-6">
              <span className="material-symbols-outlined animate-pulse">hourglass_top</span>
              <p className="font-label-md text-sm">Hệ thống đang chờ thanh toán...</p>
            </div>
            <p className="text-xs text-on-surface-variant text-center opacity-70">
              *Không thể tắt hộp thoại này khi đang chờ thanh toán. Vui lòng hoàn tất hoặc đóng trình duyệt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
