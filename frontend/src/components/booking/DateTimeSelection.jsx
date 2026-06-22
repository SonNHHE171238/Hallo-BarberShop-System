import React, { useEffect, useState } from "react";
import { bookingService } from "@/services/booking.service";
import toast from 'react-hot-toast';

export default function DateTimeSelection({ selectedBarber, selectedService, selectedDate, setSelectedDate, selectedTime, setSelectedTime }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  
  const [absences, setAbsences] = useState([]);
  const [isLoadingAbsences, setIsLoadingAbsences] = useState(false);
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Generate days in current month
  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  // Fetch available dynamic slots whenever date, barber, or service changes
  useEffect(() => {
    if (!selectedDate || !selectedBarber || !selectedService) {
      setAvailableSlots([]);
      return;
    }
    
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const payload = {
          barberId: selectedBarber._id || selectedBarber.id,
          date: selectedDate,
          durationMinutes: selectedService.durationMinutes || selectedService.duration || 30
        };
        const res = await bookingService.getAvailableSlots(payload);
        const slots = (res && res.data && res.data.slots) ? res.data.slots : (res && res.slots) ? res.slots : null;
        
        if (slots) {
          setAvailableSlots(slots);
          
          // If previously selected time is no longer available, clear it
          const stillAvailable = slots.find(s => s.time === selectedTime && s.available);
          if (selectedTime && !stillAvailable) {
            setSelectedTime("");
          }
        }
      } catch (error) {
        console.error("Failed to fetch slots", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    
    fetchSlots();
  }, [selectedDate, selectedBarber, selectedService]);

  
  // Fetch absences when barber changes
  useEffect(() => {
    if (!selectedBarber) return;
    
    const fetchAbsences = async () => {
      setIsLoadingAbsences(true);
      try {
        const barberId = selectedBarber._id || selectedBarber.id;
        const res = await bookingService.getBarberAbsences(barberId);
        if (res && res.data && res.data.absentDates) {
          setAbsences(res.data.absentDates);
        } else if (res && res.absentDates) {
          setAbsences(res.absentDates);
        }
      } catch (err) {
        console.error("Failed to fetch absences", err);
      } finally {
        setIsLoadingAbsences(false);
      }
    };
    
    fetchAbsences();
  }, [selectedBarber]);

  // Calculate default selectedDate factoring in cut-off time and absences
  useEffect(() => {
    // Only calculate if absences are loaded (so we don't accidentally select an absent day initially)
    if (isLoadingAbsences) return;

    let targetDate = new Date(); // Start with today
    
    // If it's already past 18:00 (18:00 or later), jump to tomorrow automatically
    if (currentHour >= 18) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Check if the targetDate falls on an absent day. If so, keep shifting to the next day.
    // Safety break after 30 days to avoid infinite loops if barber is completely inactive.
    for (let i = 0; i < 30; i++) {
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      if (!absences.includes(dateStr)) {
        // Found an available day!
        // Only set it if selectedDate hasn't been explicitly set yet, 
        // OR if the current selectedDate is suddenly invalid due to newly loaded absences
        if (!selectedDate || absences.includes(selectedDate) || (selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}` && currentHour >= 18)) {
          setSelectedDate(dateStr);
          // If the date changed, we should probably reset the selected time if it's invalid
          setSelectedTime(""); 
        }
        break;
      }
      
      // Move to next day
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }, [absences, isLoadingAbsences, currentHour, currentYear, currentMonth, currentDay, selectedDate, setSelectedDate, setSelectedTime]);

  // Extract selected day number from date string
  const selectedDayNum = selectedDate ? parseInt(selectedDate.split('-')[2], 10) : currentDay;
  const isTodaySelected = selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

  return (
    <section className="space-y-6" id="step-datetime">
      <div className="flex items-center justify-between border-t border-outline-variant pt-12">
        <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Thời Gian</h2>
        <span className="text-label-md text-outline">Bước 3/3</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="glass-card p-6 border border-outline-variant rounded-xl relative">
          {isLoadingAbsences && (
            <div className="absolute inset-0 bg-surface-container-high/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-primary">Tháng {currentMonth + 1}, {currentYear}</span>
            <div className="flex space-x-2">
              <button className="p-1 text-outline cursor-not-allowed"><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-label-md mb-4">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d} className="text-on-surface-variant">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for starting day (simplified for demo) */}
            <div className="p-2 text-center text-outline line-through">28</div>
            <div className="p-2 text-center text-outline line-through">29</div>
            <div className="p-2 text-center text-outline line-through">30</div>
            
            {/* Valid days */}
            {daysInMonth.map(day => {
              const isPastDay = day < currentDay;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateString;
              const isAbsent = absences.includes(dateString);
              const isDisabled = isPastDay || isAbsent;
              
              return (
                <div 
                  key={day}
                  onClick={() => !isDisabled && setSelectedDate(dateString)}
                  title={isAbsent ? "Barber nghỉ phép" : ""}
                  className={`p-2 text-center rounded transition-all ${
                    isDisabled 
                      ? 'text-outline line-through cursor-not-allowed opacity-50 relative' 
                      : isSelected 
                        ? 'bg-primary text-on-primary font-bold shadow-[0_0_15px_rgba(255,222,165,0.3)] cursor-pointer' 
                        : 'hover:bg-primary/20 text-on-surface cursor-pointer'
                  }`}
                >
                  {day}
                  {isAbsent && <div className="absolute w-1 h-1 bg-error rounded-full bottom-1 left-1/2 -translate-x-1/2"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="space-y-4">
          <h4 className="text-label-md font-bold text-primary uppercase tracking-widest">
            Khung giờ trống {selectedDate ? `(Ngày ${selectedDate})` : ''}
          </h4>
          
          {isLoadingSlots ? (
            <div className="flex justify-center p-8">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.length > 0 ? availableSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.time;
                const isDisabled = !slot.available;
                
                return (
                  <button 
                    key={index}
                    onClick={() => {
                      if (isDisabled) {
                        toast.error(slot.reason || "Khung giờ này không khả dụng");
                      } else {
                        setSelectedTime(slot.time);
                      }
                    }}
                    title={isDisabled ? slot.reason : ""}
                    className={`glass-card py-3 rounded-lg text-center text-body-md transition-all border ${
                      isDisabled 
                        ? 'opacity-30 cursor-not-allowed border-outline-variant text-on-surface line-through' 
                        : isSelected 
                          ? 'bg-primary text-on-primary font-bold border-primary' 
                          : 'text-on-surface hover:bg-primary hover:text-on-primary border-outline-variant hover:border-primary'
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              }) : (
                <div className="col-span-3 text-center text-outline-variant py-4">
                  {selectedDate ? "Không có khung giờ nào trống trong ngày này." : "Vui lòng chọn ngày để xem khung giờ."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
