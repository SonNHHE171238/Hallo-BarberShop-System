"use client";

import React from "react";
import BarberHeaderControls from "@/components/barber/BarberHeaderControls";
import BarberStatsGrid from "@/components/barber/BarberStatsGrid";
import ScheduleTimeline from "@/components/barber/ScheduleTimeline";

export default function BarberDashboardPage() {
  return (
    <div className="flex flex-col text-on-surface font-body-md h-full">
      {/* Main Dashboard Canvas */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-gutter py-section-gap flex flex-col gap-section-gap">
        <BarberHeaderControls />
        <BarberStatsGrid />
        <ScheduleTimeline />
      </main>


    </div>
  );
}
