"use client";

import React, { useState } from "react";
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
import toast from 'react-hot-toast';
import GuestBookingModal from "@/components/booking/GuestBookingModal";

export default function BookingPage() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

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
          
          if (paymentRes && paymentRes.checkoutUrl) {
            window.location.href = paymentRes.checkoutUrl;
            return;
          }
        } catch (err) {
          toast.error("Lỗi khi tạo link thanh toán: " + err.message);
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
    </div>
  );
}
