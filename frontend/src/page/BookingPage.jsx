"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingStepper from "@/components/booking/BookingStepper";
import ServiceSelection from "@/components/booking/ServiceSelection";
import BarberSelection from "@/components/booking/BarberSelection";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import BookingSummarySidebar from "@/components/booking/BookingSummarySidebar";
import GuestInfoModal from "@/components/booking/GuestInfoModal";

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = () => {
    setIsModalOpen(true);
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
              <BarberSelection selectedBarber={selectedBarber} setSelectedBarber={setSelectedBarber} />
              <DateTimeSelection 
                selectedDate={selectedDate} 
                setSelectedDate={setSelectedDate} 
                selectedTime={selectedTime} 
                setSelectedTime={setSelectedTime} 
              />
            </div>

            <BookingSummarySidebar 
              selectedService={selectedService} 
              selectedBarber={selectedBarber} 
              selectedDate={selectedDate} 
              selectedTime={selectedTime}
              onConfirm={handleConfirm}
            />
          </div>
        </div>
      </main>

      <Footer />

      {isModalOpen && (
        <GuestInfoModal 
          onClose={() => setIsModalOpen(false)}
          bookingData={{ selectedService, selectedBarber, selectedDate, selectedTime }}
        />
      )}
    </div>
  );
}
