"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function PersonalScheduleTab() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [roster, setRoster] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rosterRes = await axios.get(
          "http://localhost:5000/api/rosters/current/published",
          {
            withCredentials: true,
          },
        );

        if (rosterRes.data.success && rosterRes.data.roster) {
          setRoster(rosterRes.data.roster);
          if (rosterRes.data.registration) {
            setRegistration(rosterRes.data.registration);
          }
        }
      } catch (error) {
        console.error("Failed to fetch published roster:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!roster) {
    return (
      <div className="bg-surface-container border border-outline-variant p-10 rounded-xl text-center shadow-sm">
        <span className="material-symbols-outlined text-outline text-5xl mb-4">
          calendar_month
        </span>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
          Chưa có lịch làm việc
        </h3>
        <p className="text-on-surface-variant">
          Tuần này bạn chưa có lịch làm việc nào được phân công.
        </p>
      </div>
    );
  }

  // Generate days
  const days = [];
  const start = new Date(roster.weekStartDate);
  const end = new Date(roster.weekEndDate);
  const dayNames = [
    "CHỦ NHẬT",
    "THỨ 2",
    "THỨ 3",
    "THỨ 4",
    "THỨ 5",
    "THỨ 6",
    "THỨ 7",
  ];

  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const isClosed = roster.closedDays?.some(
      (cd) => new Date(cd.date).toISOString().split("T")[0] === dateStr,
    );

    // Find assigned shifts for this day if staff
    let assignedShifts = [];
    if (registration) {
      const regDay = registration.registeredShifts.find(
        (d) => new Date(d.date).toISOString().split("T")[0] === dateStr,
      );
      if (regDay) {
        assignedShifts = regDay.shifts; // ['morning', 'afternoon']
      }
    }

    days.push({
      dateStr,
      dayOfWeek: dayNames[current.getDay()],
      dateNum: current.getDate().toString().padStart(2, "0"),
      isClosed,
      assignedShifts,
    });
    current.setDate(current.getDate() + 1);
  }

  const shiftLabels = {
    morning: { title: "CA 1", time: "09:00 - 14:00" },
    afternoon: { title: "CA 2", time: "14:00 - 19:00" },
  };

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayStr();

  return (
    <div className="animate-fade-in font-body-md">
      <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl">
        {/* Header/Columns Grid */}
        <div className="grid grid-cols-7 border-b border-[#2A2A2A]">
          {days.map((day, idx) => (
            <div
              key={day.dateStr}
              className={`p-4 text-center border-[#2A2A2A] ${idx !== 6 ? "border-r" : ""} ${todayStr === day.dateStr ? "bg-primary/5" : ""}`}
            >
              <p className="text-[11px] font-medium text-[#888888] mb-1">
                {day.dayOfWeek}
              </p>
              <p
                className={`text-2xl font-light ${todayStr === day.dateStr ? "text-primary font-medium" : "text-[#DDDDDD]"}`}
              >
                {day.dateNum}
              </p>
              {todayStr === day.dateStr && (
                <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-7 min-h-[400px]">
          {days.map((day, idx) => (
            <div
              key={day.dateStr}
              className={`p-2 border-[#2A2A2A] ${idx !== 6 ? "border-r" : ""} ${todayStr === day.dateStr ? "bg-primary/5" : ""}`}
            >
              {day.isClosed ? (
                <div className="flex flex-col items-center justify-center h-32 border border-[#2A2A2A] bg-[#222222] rounded-lg mt-2 opacity-50">
                  <span className="material-symbols-outlined text-[#888888] mb-2">
                    store_closed
                  </span>
                  <p className="text-[10px] text-[#888888] uppercase tracking-wider">
                    Đóng cửa
                  </p>
                </div>
              ) : day.assignedShifts.length > 0 ? (
                <div className="flex flex-col gap-3 mt-2">
                  {day.assignedShifts.map((shiftId) => (
                    <div
                      key={shiftId}
                      className="border border-[#333333] bg-[#222222] p-4 rounded-xl relative overflow-hidden group hover:border-[#555555] transition-colors shadow-lg"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                      <p className="text-xs font-semibold text-primary mb-2 tracking-widest">
                        {shiftLabels[shiftId].title}
                      </p>
                      <p className="text-base font-medium text-[#DDDDDD] mb-4">
                        {shiftLabels[shiftId].time}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-[#888888]">
                          Đã xác nhận
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Off day / no shifts
                <div className="flex flex-col items-center justify-center h-32 mt-2 opacity-30">
                  <span className="material-symbols-outlined text-[#555555] mb-2 text-3xl">
                    event_busy
                  </span>
                  <p className="text-[10px] text-[#555555] uppercase tracking-wider">
                    Nghỉ
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
