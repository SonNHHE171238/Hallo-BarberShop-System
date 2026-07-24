"use client";
import React from 'react';

export default function BarberHeaderControls({ profile }) {
  const name = profile?.userId?.name || "Barber";

  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-gold pb-6">
      <div>
        <p className="font-label-md text-label-md text-gold-dim uppercase mb-2 tracking-[0.3em]">Truy cập Studio / Hôm nay</p>
        <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface serif-heading">Chào Buổi Sáng, {name}.</h1>
      </div>
    </section>
  );
}
