"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingStepper from "@/components/booking/BookingStepper";
import ServiceSelection from "@/components/booking/ServiceSelection";
import BarberSelection from "@/components/booking/BarberSelection";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import BookingSummarySidebar from "@/components/booking/BookingSummarySidebar";
import GuestInfoForm from "@/components/booking/GuestInfoForm";

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '', notes: '' });

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md flex flex-col">
      <Navbar />

      <main className="pt-32 pb-32 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4 md:px-16">
          <BookingStepper currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 items-start">
            <div className="lg:col-span-7 space-y-12">
              {currentStep === 1 && (
                <ServiceSelection selectedService={selectedService} setSelectedService={setSelectedService} />
              )}
              {currentStep === 2 && (
                <BarberSelection selectedBarber={selectedBarber} setSelectedBarber={setSelectedBarber} />
              )}
              {currentStep === 3 && (
                <DateTimeSelection 
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate} 
                  selectedTime={selectedTime} 
                  setSelectedTime={setSelectedTime} 
                />
              )}
              {currentStep === 4 && (
                <GuestInfoForm 
                  guestInfo={guestInfo}
                  setGuestInfo={setGuestInfo}
                  onBack={handlePrevStep}
                />
              )}
            </div>

            <div className="lg:col-span-5">
              <BookingSummarySidebar 
                currentStep={currentStep}
                selectedService={selectedService} 
                selectedBarber={selectedBarber} 
                selectedDate={selectedDate} 
                selectedTime={selectedTime}
                onNext={handleNextStep}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
