"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingStepper from "@/components/booking/BookingStepper";
import ServiceSelection from "@/components/booking/ServiceSelection";
import BarberSelection from "@/components/booking/BarberSelection";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import BookingSummarySidebar from "@/components/booking/BookingSummarySidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { voucherService } from "@/services/voucher.service";
import toast from 'react-hot-toast';
import GuestBookingModal from "@/components/booking/GuestBookingModal";
import { QRCodeSVG } from 'qrcode.react';
import axios from "axios";
import { Suspense } from "react";

function BookingPageContent() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [successQueryString, setSuccessQueryString] = useState("");
  const [payosData, setPayosData] = useState(null);
  
  // Voucher State
  const [discountType, setDiscountType] = useState('none');
  const [pointsToUseInput, setPointsToUseInput] = useState(0);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");

  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-fill voucher from URL
  useEffect(() => {
    const code = searchParams.get('voucherCode') || localStorage.getItem('auto_voucher');
    if (code) {
      setVoucherCodeInput(code);
      if (localStorage.getItem('auto_voucher')) {
        localStorage.removeItem('auto_voucher');
      }
    }
  }, [searchParams]);

  // Polling for Booking Payment Status
  useEffect(() => {
    let interval;
    if (showQR && currentBookingId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/bookings/${currentBookingId}/payment-status`);
          if (res.data.success && (res.data.data.paymentStatus === 'paid' || res.data.data.paymentStatus === 'partial_paid')) {
            clearInterval(interval);
            setShowQR(false);
            router.push(`/booking/success?${successQueryString}&status=PAID`);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [showQR, currentBookingId, router, successQueryString]);

    const handleConfirm = async () => {
    if (!user) {
      setIsGuestModalOpen(true);
      return;
    }
    
    await submitBooking({ bookingType: "user" });
  };

  const handleGuestSubmit = async (guestData) => {
    await submitBooking({
      bookingType: "guest",
      ...guestData
    });
  };

  const submitBooking = async (additionalPayload) => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
      toast.error("Vui lòng chọn đầy đủ Dịch vụ và Thời gian.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        services: selectedServices.map(s => s._id || s.id),
        barberId: selectedBarber ? (selectedBarber._id || selectedBarber.id) : "auto", 
        bookingDate: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        date: selectedDate, 
        timeSlot: selectedTime, 
        durationMinutes: selectedServices.reduce((total, s) => total + (s.durationMinutes || s.duration || 30), 0),
        voucherCode: appliedVoucher,
        discountType: discountType,
        pointsToUse: pointsToUseInput,
        discountAmount: discountAmount,
        ...additionalPayload
      };

      const response = await bookingService.createBookingSinglePage(payload);
      const bookingId = (response.booking && response.booking._id) || response._id || "NEW";
      
      const dateObj = new Date(selectedDate);
      const dateStr = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      
      const queryParams = new URLSearchParams({
        id: bookingId,
        service: selectedServices.map(s => s.name).join(', '),
        price: selectedServices.reduce((total, s) => total + (s.price || 0), 0),
        barber: selectedBarber ? selectedBarber.name : "Barber Auto",
        title: selectedBarber ? (selectedBarber.title || "Stylist") : "Stylist",
        time: selectedTime,
        dateStr: dateStr
      });

      if (additionalPayload?.phone) {
        queryParams.append("phone", additionalPayload.phone);
      }

      if (response.paymentLinkData && response.paymentLinkData.checkoutUrl) {
        if (response.noShowCount && response.noShowCount > 0) {
          toast.error(`Yêu cầu đặt cọc: Hệ thống ghi nhận bạn đã không đến ${response.noShowCount} lần trước đó! Đang chuyển hướng thanh toán...`, { duration: 4000 });
        } else {
          toast.success("Vui lòng thanh toán cọc để giữ chỗ!");
        }
        
        setTimeout(() => {
          window.location.href = response.paymentLinkData.checkoutUrl;
        }, 3000);
        return;
      }

      if (paymentMethod === 'payos' && bookingId !== "NEW") {
        toast.success("Đang tạo link thanh toán...");
        try {
          const successUrl = `${window.location.origin}/booking/success?${queryParams.toString()}`;
          const cancelUrl = `${window.location.origin}/booking/success?${queryParams.toString()}&payment=cancelled`;

          const { fetchWithAuth } = await import('@/services/api');
          const paymentRes = await fetchWithAuth('/payment/create-link', {
            method: 'POST',
            body: JSON.stringify({ 
              bookingId,
              returnUrl: successUrl,
              cancelUrl: cancelUrl
            })
          });
          
          if (paymentRes && paymentRes.qrCode) {
            setPayosData({
              qrCode: paymentRes.qrCode,
              orderCode: paymentRes.orderCode,
              amount: paymentRes.amount,
              accountName: paymentRes.accountName,
              accountNumber: paymentRes.accountNumber,
              bin: paymentRes.bin
            });
            setSuccessQueryString(queryParams.toString());
            setCurrentBookingId(bookingId);
            setShowQR(true);
            setIsGuestModalOpen(false);
            return;
          } else if (paymentRes && paymentRes.checkoutUrl) {
            window.location.href = paymentRes.checkoutUrl;
            return;
          }
        } catch (err) {
          toast.error("Lỗi khi tạo mã QR thanh toán: " + err.message);
        }
      }
      
      toast.success("Đặt lịch thành công!");
      setIsGuestModalOpen(false);
      router.push(`/booking/success?${queryParams.toString()}`);
    } catch (error) {
      toast.error("Đặt lịch thất bại: " + (error.message || "Vui lòng thử lại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md flex flex-col">
      <Navbar />

      <main className="pt-24 pb-32 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4 md:px-16">
          <BookingStepper 
            hasService={selectedServices.length > 0} 
            hasBarber={!!selectedBarber} 
            hasTime={!!(selectedDate && selectedTime)} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            <div className="lg:col-span-8 space-y-12">
              <ServiceSelection selectedServices={selectedServices} setSelectedServices={setSelectedServices} />
              
              {selectedServices.length > 0 && (
                <BarberSelection selectedBarber={selectedBarber} setSelectedBarber={setSelectedBarber} />
              )}
              
              {selectedServices.length > 0 && selectedBarber && (
                <DateTimeSelection 
                  selectedBarber={selectedBarber}
                  selectedServices={selectedServices}
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate} 
                  selectedTime={selectedTime} 
                  setSelectedTime={setSelectedTime} 
                />
              )}
            </div>

            {selectedServices.length > 0 && selectedBarber && selectedDate && selectedTime && (
              <BookingSummarySidebar 
                selectedServices={selectedServices} 
                selectedBarber={selectedBarber} 
                selectedDate={selectedDate} 
                selectedTime={selectedTime}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onConfirm={handleConfirm}
                isLoading={isLoading}
                isGuest={!user}
                user={user}
                discountType={discountType}
                setDiscountType={setDiscountType}
                pointsToUseInput={pointsToUseInput}
                setPointsToUseInput={setPointsToUseInput}
                voucherCodeInput={voucherCodeInput}
                setVoucherCodeInput={setVoucherCodeInput}
                appliedVoucher={appliedVoucher}
                setAppliedVoucher={setAppliedVoucher}
                discountAmount={discountAmount}
                setDiscountAmount={setDiscountAmount}
                voucherError={voucherError}
                setVoucherError={setVoucherError}
                applyingVoucher={applyingVoucher}
                setApplyingVoucher={setApplyingVoucher}
                setVerifiedPhone={setVerifiedPhone}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {isGuestModalOpen && (
        <GuestBookingModal
          isOpen={isGuestModalOpen}
          onClose={() => setIsGuestModalOpen(false)}
          onSubmit={handleGuestSubmit}
          selectedServices={selectedServices}
          selectedBarber={selectedBarber}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          isLoading={isLoading}
          discountAmount={discountAmount}
          finalTotal={selectedServices.reduce((acc, curr) => acc + (curr.price || 0), 0) - discountAmount}
          initialPhone={verifiedPhone}
        />
      )}

      {/* ================= QR CODE MODAL ================= */}
      {showQR && payosData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            {/* Đã xóa nút Close theo yêu cầu để ép khách hàng thanh toán xong mới được thoát (hoặc phải tắt tab) */}
            
            <h3 className="font-headline-md text-primary text-center mb-6 uppercase tracking-widest">Thanh Toán Đặt Lịch</h3>
            
            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
              <QRCodeSVG value={payosData.qrCode} size={250} />
            </div>

            <div className="space-y-4 mb-8 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant text-center">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Ngân hàng</span>
                <span className="text-on-surface font-bold text-lg">{payosData.bin || 'PayOS Bank'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Chủ tài khoản</span>
                <span className="text-on-surface font-bold text-lg">{payosData.accountName || 'Hệ Thống'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Số tài khoản</span>
                <span className="text-primary font-bold text-lg">{payosData.accountNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Số tiền</span>
                <span className="text-primary font-bold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payosData.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Nội dung chuyển khoản</span>
                <span className="text-on-surface font-bold text-lg">{payosData.orderCode}</span>
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

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="bg-background min-h-screen text-on-surface flex flex-col items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
