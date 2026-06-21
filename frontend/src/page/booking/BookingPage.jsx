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

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleConfirm = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt lịch.");
      router.push("/login?redirect=/booking");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      alert("Vui lòng chọn đầy đủ Dịch vụ và Thời gian.");
      return;
    }

    setIsLoading(true);
    try {
      // Build Payload matching backend expectations
      const payload = {
        serviceId: selectedService._id || selectedService.id,
        barberId: selectedBarber ? (selectedBarber._id || selectedBarber.id) : "auto", // Auto assign if none selected
        bookingDate: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        date: selectedDate, // YYYY-MM-DD
        timeSlot: selectedTime, // HH:MM
        bookingType: "user",
        durationMinutes: selectedService.durationMinutes || selectedService.duration || 30,
      };

      const response = await bookingService.createBookingSinglePage(payload);
      
      // Redirect to the success page with details
      const dateObj = new Date(selectedDate);
      const dateStr = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      
      const queryParams = new URLSearchParams({
        id: (response.booking && response.booking._id) || response._id || "NEW",
        service: selectedService.name,
        price: selectedService.price,
        barber: selectedBarber ? selectedBarber.name : "Barber Auto",
        title: selectedBarber ? (selectedBarber.title || "Stylist") : "Stylist",
        time: selectedTime,
        dateStr: dateStr
      });
      
      router.push(`/booking/success?${queryParams.toString()}`);
    } catch (error) {
      alert("Đặt lịch thất bại: " + (error.message || "Lỗi hệ thống"));
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
            hasService={!!selectedService} 
            hasBarber={!!selectedBarber} 
            hasTime={!!(selectedDate && selectedTime)} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            <div className="lg:col-span-8 space-y-12">
              <ServiceSelection selectedService={selectedService} setSelectedService={setSelectedService} />
              
              {selectedService && (
                <BarberSelection selectedBarber={selectedBarber} setSelectedBarber={setSelectedBarber} />
              )}
              
              {selectedService && selectedBarber && (
                <DateTimeSelection 
                  selectedBarber={selectedBarber}
                  selectedService={selectedService}
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate} 
                  selectedTime={selectedTime} 
                  setSelectedTime={setSelectedTime} 
                />
              )}
            </div>

            {selectedService && selectedBarber && selectedDate && selectedTime && (
              <BookingSummarySidebar 
                selectedService={selectedService} 
                selectedBarber={selectedBarber} 
                selectedDate={selectedDate} 
                selectedTime={selectedTime}
                onConfirm={handleConfirm}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
