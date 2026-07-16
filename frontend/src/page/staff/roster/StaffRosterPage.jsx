"use client";

import React, { useState, useEffect } from "react";

// --- MOCK DATA ---
const MOCK_WEEK = {
  startDate: "25/11",
  endDate: "01/12",
  days: [
    { dayOfWeek: "T2", date: "25" },
    { dayOfWeek: "T3", date: "26" },
    { dayOfWeek: "T4", date: "27" },
    { dayOfWeek: "T5", date: "28" },
    { dayOfWeek: "T6", date: "29" },
    { dayOfWeek: "T7", date: "30" },
    { dayOfWeek: "CN", date: "01" },
  ],
};

const SHIFTS = [
  { id: "ca1", label: "Ca 1" },
  { id: "ca2", label: "Ca 2" },
];

export default function StaffRosterPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState({}); // { "T2-ca1": true, "T3-ca2": true, ... }
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleShift = (dayOfWeek, shiftId) => {
    const key = `${dayOfWeek}-${shiftId}`;
    setSelectedShifts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const totalShifts = Object.values(selectedShifts).filter(Boolean).length;

  return (
    <div className="text-on-surface font-body-md selection:bg-primary selection:text-on-primary">
      <main className="pt-8 pb-section-padding px-4 md:px-margin-desktop max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <p className="font-label-md text-label-md text-primary tracking-widest uppercase mb-2">
            Internal Portal
          </p>
          <h1 className="font-headline-lg text-headline-lg md:text-display-md md:font-display-md text-on-surface mb-4">
            Đăng Ký Lịch Làm
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Cập nhật khung thời gian làm việc hàng tuần của bạn. Lưu ý lịch đăng ký sẽ được Admin phê duyệt dựa trên nhu cầu của cửa hàng.
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-surface-container border-l-4 border-primary p-6 rounded-r-xl mb-10 flex items-start gap-4 shadow-sm">
          <span className="material-symbols-outlined text-primary text-3xl">info</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
              Trạng thái đăng ký
            </h3>
            <p className="text-on-surface-variant">
              Lịch đăng ký mong muốn, admin sẽ duyệt. Hiện tại hệ thống đang mở nhận lịch cho tuần: <span className="text-primary font-bold">{MOCK_WEEK.startDate} - {MOCK_WEEK.endDate}</span>
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            
            {/* Weekly Schedule */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline-md text-headline-md text-on-surface">Lịch Tuần</h2>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
                  </button>
                  <button className="w-10 h-10 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {MOCK_WEEK.days.map((day) => (
                  <div key={day.dayOfWeek} className="flex flex-col items-center">
                    <div className="mb-6 text-center">
                      <p className="text-label-md text-outline uppercase mb-1">{day.dayOfWeek}</p>
                      <p className="font-headline-sm text-headline-sm text-on-surface">{day.date}</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full">
                      {SHIFTS.map((shift) => {
                        const isSelected = selectedShifts[`${day.dayOfWeek}-${shift.id}`];
                        return (
                          <button
                            key={shift.id}
                            onClick={() => toggleShift(day.dayOfWeek, shift.id)}
                            className={`w-full py-2.5 rounded border transition-all duration-200 text-sm font-label-md
                              ${isSelected 
                                ? "bg-primary border-primary text-on-primary shadow-sm" 
                                : "bg-transparent border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                              }
                            `}
                          >
                            {shift.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Ghi chú đăng ký</h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Xin nghỉ phép ngày Thứ 4 để giải quyết việc gia đình..."
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-4 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-y min-h-[120px]"
              />
            </div>
            
          </div>

          {/* Right Column - Summary */}
          <div className="h-fit sticky top-28">
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 md:p-8">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-8">Xác nhận lịch</h2>
              
              <div className="flex items-center justify-between py-4 border-b border-outline-variant/50">
                <span className="text-on-surface-variant">Tổng số ca:</span>
                <span className="font-headline-sm text-primary">{totalShifts} ca</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-outline-variant/50 mb-8">
                <span className="text-on-surface-variant">Hạn chót:</span>
                <span className="text-error">Hết hạn sau 4h</span>
              </div>

              <div className="flex flex-col gap-4 mb-10">
                <button className="w-full bg-primary text-on-primary font-label-lg uppercase tracking-widest py-4 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  LƯU ĐĂNG KÝ
                </button>
                <button className="w-full bg-transparent text-on-surface border border-outline font-label-lg uppercase tracking-widest py-4 rounded-lg hover:bg-surface-variant hover:text-primary hover:border-primary transition-colors">
                  CẬP NHẬT
                </button>
              </div>

              <div>
                <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-6">Quy định</p>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                    <span className="text-sm text-on-surface-variant">Đăng ký trước Thứ 6 hàng tuần.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                    <span className="text-sm text-on-surface-variant">Mỗi tuần tối thiểu 5 ca làm việc.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                    <span className="text-sm text-on-surface-variant">Ca 1 bắt đầu từ 09:00 - 14:00.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                    <span className="text-sm text-on-surface-variant">Ca 2 bắt đầu từ 14:00 - 19:00.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
