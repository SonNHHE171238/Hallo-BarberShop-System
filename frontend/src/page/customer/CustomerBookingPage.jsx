"use client";

import React, { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import WelcomeHeader from "@/components/customer/booking/WelcomeHeader";
import QuickRebook from "@/components/customer/booking/QuickRebook";
import ServiceSelection from "@/components/customer/booking/ServiceSelection";
import BarberSelection from "@/components/customer/booking/BarberSelection";
import TimeSelection from "@/components/customer/booking/TimeSelection";
import BookingSummarySidebar from "@/components/customer/booking/BookingSummarySidebar";

export default function CustomerBookingPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant shadow-sm transition-all duration-300 ease-in-out">
        <nav className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary tracking-widest uppercase">
            HALLO BARBER
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-primary border-b-2 border-primary pb-1 font-headline-sm text-headline-sm tracking-tight" href="#">Appointments</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-headline-sm text-headline-sm tracking-tight" href="#">Services</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-headline-sm text-headline-sm tracking-tight" href="#">Hallo Barbers</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-headline-sm text-headline-sm tracking-tight" href="#">Gallery</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <Link href="/customer/dashboard" className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-all">
              <img 
                alt="Customer profile picture" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOqp_FdIQ9nCe04I_YgvenXyttKBbeszHUkDydzIpy4cux8y-qQa2pjjcR78fjT4E89tP89Rwlo8RK9yZoMCb3dv5gyDopDK4ZOCOY-3sx1Gj-FY-I4KRcRL-9rrbkXynphgl5fBeAQERaqgU3RpmW4r4lomCNbFsOi5JJDzROoRzBCQYRo_4iqVRasLfpBh5zdh9XfYCRibg9tD8BYAKNr46WsCdQHRE5d2--5ub8gRJhA44WqQ-gADMLf1XvU3uyL6MH2McX25bf"
              />
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex-grow">
        <WelcomeHeader />
        <QuickRebook />

        {/* New Booking Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
          {/* Left Column: Flow Steps */}
          <div className="lg:col-span-2 space-y-12">
            <ServiceSelection selectedService={selectedService} onSelectService={setSelectedService} />
            <BarberSelection selectedBarber={selectedBarber} onSelectBarber={setSelectedBarber} />
            <TimeSelection selectedTime={selectedTime} onSelectTime={setSelectedTime} />
          </div>

          {/* Right Column: Booking Summary */}
          <BookingSummarySidebar 
            selectedService={selectedService} 
            selectedBarber={selectedBarber} 
            selectedTime={selectedTime} 
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
