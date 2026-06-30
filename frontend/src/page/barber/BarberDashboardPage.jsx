"use client";
import React, { useState, useEffect } from "react";
import BarberHeaderControls from "@/components/barber/BarberHeaderControls";
import BarberStatsGrid from "@/components/barber/BarberStatsGrid";
import ScheduleTimeline from "@/components/barber/ScheduleTimeline";
import { barberService } from "@/services/barber.service";
import { bookingService } from "@/services/booking.service";

export default function BarberDashboardPage() {
  const [barberProfile, setBarberProfile] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, bookingsRes] = await Promise.all([
        barberService.getMeBarber(),
        bookingService.getBarberTodayBookings(selectedDate)
      ]);

      if (profileRes && profileRes.barber) {
        setBarberProfile(profileRes.barber);
      }
      if (bookingsRes && bookingsRes.bookings) {
        setTodayBookings(bookingsRes.bookings);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const handleToggleAvailability = async (isAvailable) => {
    try {
      await barberService.updateAvailability(isAvailable);
      setBarberProfile(prev => ({ ...prev, isAvailable }));
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  if (isLoading && !barberProfile) {
    return <div className="h-full flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col text-on-surface font-body-md h-full">
      {/* Main Dashboard Canvas */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-gutter py-section-gap flex flex-col gap-section-gap">
        <BarberHeaderControls 
          profile={barberProfile} 
          onToggleAvailability={handleToggleAvailability} 
        />
        
        <div className="flex items-center gap-4 bg-surface-container border border-outline-variant px-4 py-2 rounded-lg w-fit">
          <label className="font-label-md text-sm text-outline uppercase tracking-wider">Ngày xem lịch:</label>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent outline-none font-body-md text-sm text-primary font-bold [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
          />
        </div>

        <BarberStatsGrid 
          profile={barberProfile} 
          bookings={todayBookings} 
        />
        <ScheduleTimeline 
          bookings={todayBookings} 
          onRefresh={fetchDashboardData}
          selectedDate={selectedDate}
        />
      </main>
    </div>
  );
}
