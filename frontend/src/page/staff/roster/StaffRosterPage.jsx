"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const SHIFTS = [
  { id: "morning", label: "Ca 1" },
  { id: "afternoon", label: "Ca 2" },
];

export default function StaffRosterPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  
  const [roster, setRoster] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [selectedShifts, setSelectedShifts] = useState({}); // { "2026-07-19-morning": true }
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rosterRes = await axios.get("http://localhost:5000/api/rosters/current/active", {
          withCredentials: true
        });
        
        if (rosterRes.data.success && rosterRes.data.roster) {
          const currentRoster = rosterRes.data.roster;
          setRoster(currentRoster);
          
          // Fetch user's registration for this roster
          const regRes = await axios.get(`http://localhost:5000/api/rosters/${currentRoster._id}/my-registration`, {
            withCredentials: true
          });
          
          if (regRes.data.success && regRes.data.registration) {
            setRegistration(regRes.data.registration);
            setNotes(regRes.data.registration.adjustmentNote || "");
            
            // Pre-fill selected shifts
            const initialShifts = {};
            regRes.data.registration.registeredShifts.forEach(day => {
              const dateStr = new Date(day.date).toISOString().split('T')[0];
              day.shifts.forEach(shift => {
                initialShifts[`${dateStr}-${shift}`] = true;
              });
            });
            setSelectedShifts(initialShifts);
          }
        }
      } catch (error) {
        console.error("Failed to fetch roster data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  if (!mounted) return null;

  // Generate days based on roster
  const generateDays = () => {
    if (!roster) return [];
    const days = [];
    const start = new Date(roster.weekStartDate);
    const end = new Date(roster.weekEndDate);
    
    // Day names mapping
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    
    let current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const isClosed = roster.closedDays?.some(cd => new Date(cd.date).toISOString().split('T')[0] === dateStr);
      
      days.push({
        dateStr,
        dayOfWeek: dayNames[current.getDay()],
        dateNum: current.getDate().toString().padStart(2, '0'),
        isClosed
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = generateDays();

  const toggleShift = (dateStr, shiftId) => {
    const key = `${dateStr}-${shiftId}`;
    setSelectedShifts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const totalShifts = Object.values(selectedShifts).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!roster) return;
    
    if (totalShifts < roster.minShiftsPerStaff) {
      alert(`Bạn phải đăng ký tối thiểu ${roster.minShiftsPerStaff} ca làm việc!`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Format payload
      const registeredShifts = days.map(day => {
        const shiftsForDay = [];
        if (selectedShifts[`${day.dateStr}-morning`]) shiftsForDay.push('morning');
        if (selectedShifts[`${day.dateStr}-afternoon`]) shiftsForDay.push('afternoon');
        return {
          date: day.dateStr,
          shifts: shiftsForDay
        };
      });

      const payload = {
        registeredShifts,
        adjustmentNote: notes
      };

      const res = await axios.post(`http://localhost:5000/api/rosters/${roster._id}/register`, payload, {
        withCredentials: true
      });

      if (res.data.success) {
        alert("Đăng ký lịch làm thành công!");
        setRegistration(res.data.registration);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký lịch làm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

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

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : !roster ? (
          <div className="bg-surface-container border border-outline-variant p-10 rounded-xl text-center shadow-sm">
            <span className="material-symbols-outlined text-outline text-5xl mb-4">event_busy</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Không có lịch đăng ký nào đang mở</h3>
            <p className="text-on-surface-variant">Admin hiện chưa mở đợt đăng ký lịch làm nào cho tuần mới. Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <>
            {/* Status Banner */}
            <div className={`bg-surface-container border-l-4 ${registration ? 'border-green-500' : 'border-primary'} p-6 rounded-r-xl mb-10 flex items-start gap-4 shadow-sm`}>
              <span className={`material-symbols-outlined ${registration ? 'text-green-500' : 'text-primary'} text-3xl`}>
                {registration ? 'check_circle' : 'info'}
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                  Trạng thái đăng ký: <span className={registration ? 'text-green-500 uppercase' : 'text-primary uppercase'}>{registration?.status || 'Chưa đăng ký'}</span>
                </h3>
                <p className="text-on-surface-variant">
                  Hiện tại hệ thống đang mở nhận lịch cho tuần: <span className="text-primary font-bold">{formatDateStr(roster.weekStartDate)} - {formatDateStr(roster.weekEndDate)}</span>
                </p>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              
              {/* Left Column */}
              <div className="flex flex-col gap-8">
                
                {/* Weekly Schedule */}
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 md:p-8 overflow-x-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-8 min-w-[600px]">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Lịch Tuần</h2>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-7 gap-2 md:gap-4 min-w-[600px]">
                    {days.map((day) => (
                      <div key={day.dateStr} className={`flex flex-col items-center ${day.isClosed ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="mb-6 text-center">
                          <p className="text-label-md text-outline uppercase mb-1">{day.dayOfWeek}</p>
                          <p className="font-headline-sm text-headline-sm text-on-surface">{day.dateNum}</p>
                        </div>
                        
                        <div className="flex flex-col gap-3 w-full">
                          {day.isClosed ? (
                            <div className="w-full py-2.5 text-center text-error font-bold text-xs uppercase border border-error/20 bg-error/10 rounded">
                              Nghỉ
                            </div>
                          ) : (
                            SHIFTS.map((shift) => {
                              const isSelected = selectedShifts[`${day.dateStr}-${shift.id}`];
                              return (
                                <button
                                  key={shift.id}
                                  onClick={() => toggleShift(day.dateStr, shift.id)}
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
                            })
                          )}
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
                    <span className={`font-headline-sm ${totalShifts >= roster.minShiftsPerStaff ? 'text-green-500' : 'text-error'}`}>
                      {totalShifts} / {roster.minShiftsPerStaff} ca
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-outline-variant/50 mb-8">
                    <span className="text-on-surface-variant">Hạn chót:</span>
                    <span className="text-error">{formatDateStr(roster.registrationDeadline)}</span>
                  </div>

                  <div className="flex flex-col gap-4 mb-10">
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-primary text-on-primary font-label-lg uppercase tracking-widest py-4 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "ĐANG XỬ LÝ..." : (registration ? "CẬP NHẬT ĐĂNG KÝ" : "GỬI ĐĂNG KÝ")}
                    </button>
                  </div>

                  <div>
                    <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-6">Quy định</p>
                    <ul className="flex flex-col gap-4">
                      <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                        <span className="text-sm text-on-surface-variant">Đăng ký trước hạn chót.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                        <span className="text-sm text-on-surface-variant">Mỗi tuần tối thiểu {roster.minShiftsPerStaff} ca làm việc.</span>
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
          </>
        )}
      </main>
    </div>
  );
}
