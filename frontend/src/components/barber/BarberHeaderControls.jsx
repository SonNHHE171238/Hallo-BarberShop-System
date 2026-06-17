"use client";
import React, { useState } from 'react';

export default function BarberHeaderControls() {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-gold pb-8">
      <div>
        <p className="font-label-md text-label-md text-gold-dim uppercase mb-2 tracking-[0.3em]">Truy cập Studio / Hôm nay</p>
        <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface serif-heading">Chào Buổi Sáng, Marcus.</h1>
      </div>
      
      {/* Availability Toggle */}
      <div className="flex items-center gap-4 bg-surface-container p-4 rounded border border-outline-gold">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase">Nhận Khách Vãng Lai</span>
        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
          <input 
            checked={isAvailable} 
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-surface border-2 border-outline-gold appearance-none cursor-pointer z-10 transition-transform duration-300" 
            id="availability-toggle" 
            name="toggle" 
            type="checkbox" 
          />
          <label 
            className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer transition-colors duration-300" 
            htmlFor="availability-toggle"
          ></label>
        </div>
      </div>
    </section>
  );
}
