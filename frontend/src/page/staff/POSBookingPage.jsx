"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import CustomerInfoInput from '@/components/staff/pos/CustomerInfoInput';
import POSServiceSelection from '@/components/staff/pos/POSServiceSelection';
import POSStaffSelection from '@/components/staff/pos/POSStaffSelection';
import POSBookingSummary from '@/components/staff/pos/POSBookingSummary';

export default function POSBookingPage() {
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleConfirm = () => {
    // Show toast
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      // Reset form
      setCustomerInfo({ name: '', phone: '' });
      setSelectedServices([]);
      setSelectedStaff(null);
    }, 3000);
  };

  const handlePrint = () => {
    alert("Printing receipt... heritage quality paper selection in progress.");
  };

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-hidden h-screen flex flex-col selection:bg-primary selection:text-on-primary">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full bg-surface-obsidian/80 backdrop-blur-xl border-b border-outline-variant shadow-sm h-20 z-50">
        <div className="flex justify-between items-center px-4 md:px-margin-desktop h-full max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary uppercase">HALLO BARBER</span>
            <nav className="hidden md:flex gap-6 items-center h-full">
              <Link href="#" className="font-headline-sm text-headline-sm text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
              <Link href="#" className="font-headline-sm text-headline-sm text-primary border-b-2 border-primary pb-1">Walk-in POS</Link>
              <Link href="#" className="font-headline-sm text-headline-sm text-on-surface-variant hover:text-primary transition-colors">Appointments</Link>
              <Link href="#" className="font-headline-sm text-headline-sm text-on-surface-variant hover:text-primary transition-colors">Staff</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-bright/10 rounded-full transition-transform active:scale-95 text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 hover:bg-surface-bright/10 rounded-full transition-transform active:scale-95 text-on-surface-variant">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-gold">
              <img className="w-full h-full object-cover" alt="Staff Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm3HX1mYoIobhNfIzeQyuI91EiyPjILstNxroLRcvvK4uODt_ZVxNoUlzjyxVpEHvq4eJJYS6DSq5ijiaTmPn8kwfe5_CEqIgBOFYU02T-l5BTWaf05mdWIxeG3pa8i_QFgHiE-VWUmuyIaVcvSjSYAFxps_U_4tnG3cDXrCE_jobP5qud_nWBKNbpqhhbDmwTve2cBdGYTSNEB6qEOHd8VLIsGfH5DueQpU6e9w-zp-RtQviH-cn7HQQMyanPyfF60L60ehWXlmYM"/>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 h-screen flex flex-col md:flex-row max-w-[1400px] w-full mx-auto overflow-hidden">
        {/* Left Side: Selection */}
        <section className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar border-r border-outline-variant">
          <header className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Walk-in Booking</h1>
            <p className="text-on-surface-variant">Handle quick bookings for Khách vãng lai with heritage precision.</p>
          </header>

          <CustomerInfoInput customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} />
          
          <POSServiceSelection selectedServices={selectedServices} toggleService={toggleService} />
          
          <POSStaffSelection selectedStaff={selectedStaff} setSelectedStaff={setSelectedStaff} />
        </section>

        {/* Right Side: Booking Summary & Checkout */}
        <POSBookingSummary 
          selectedServices={selectedServices} 
          selectedStaff={selectedStaff}
          onConfirm={handleConfirm}
          onPrint={handlePrint}
        />
      </main>

      {/* Success Toast */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 glass-card px-8 py-4 rounded-full flex items-center gap-3 pointer-events-none transition-all duration-500 z-[100] ${
        showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <span className="font-headline-sm text-on-surface">Booking Confirmed Successfully</span>
      </div>
    </div>
  );
}
