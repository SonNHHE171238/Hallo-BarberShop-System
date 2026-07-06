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
import { useRouter } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { voucherService } from "@/services/voucher.service";
import toast from 'react-hot-toast';
import GuestBookingModal from "@/components/booking/GuestBookingModal";
import { QRCodeSVG } from 'qrcode.react';
import axios from "axios";

export default function BookingPage() {
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
  
  // Voucher State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // Polling for Booking Payment Status
  useEffect(() => {
    let interval;
    if (showQR && currentBookingId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/bookings/${currentBookingId}`, { withCredentials: true });
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
            setQrData(paymentRes.qrCode);
            setOrderCode(paymentRes.orderCode);
            setAmountToPay(paymentRes.amount);
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
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      <GuestBookingModal 
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSubmit={handleGuestSubmit}
        selectedServices={selectedServices}
        selectedBarber={selectedBarber}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        isLoading={isLoading}
      />

      {/* ================= QR CODE MODAL ================= */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => {
                 setShowQR(false);
                 router.push(`/booking/success?${successQueryString}`);
              }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h3 className="font-headline-md text-primary text-center mb-6 uppercase tracking-widest">Thanh Toán Đặt Lịch</h3>
            
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
                <span className="text-primary font-bold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountToPay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Nội dung chuyển khoản</span>
                <span className="text-on-surface font-bold text-lg">{orderCode}</span>
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
