"use client";
import React from 'react';

export default function BarberHeaderControls({ profile, subtitle, title }) {
  const name = profile?.userId?.name || "Barber";
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào Buổi Sáng";
    if (hour < 18) return "Chào Buổi Chiều";
    return "Chào Buổi Tối";
  };

  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-gold pb-6">
      <div>
        <p className="font-label-md text-label-md text-gold-dim uppercase mb-2 tracking-[0.3em]">
          {subtitle || "KHÔNG GIAN LÀM VIỆC / BARBER"}
        </p>
        <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface serif-heading">
          {title || `${getGreeting()}, ${name}.`}
        </h1>
      </div>
    </section>
  );
}
