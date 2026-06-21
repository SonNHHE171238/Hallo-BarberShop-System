import React, { useEffect } from "react";

export default function DateTimeSelection({ selectedDate, setSelectedDate, selectedTime, setSelectedTime }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  // Generate days in current month
  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  
  // Base time slots
  const timeSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  
  // Set default selectedDate to today
  useEffect(() => {
    if (!selectedDate) {
      // Create a local date string (YYYY-MM-DD)
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
      setSelectedDate(dateString);
    }
  }, [selectedDate, setSelectedDate, currentYear, currentMonth, currentDay]);

  // Extract selected day number from date string
  const selectedDayNum = selectedDate ? parseInt(selectedDate.split('-')[2], 10) : currentDay;
  const isTodaySelected = selectedDayNum === currentDay;

  return (
    <section className="space-y-6" id="step-datetime">
      <div className="flex items-center justify-between border-t border-outline-variant pt-12">
        <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Thời Gian</h2>
        <span className="text-label-md text-outline">Bước 3/3</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="glass-card p-6 border border-outline-variant rounded-xl">
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
              
              return (
                <div 
                  key={day}
                  onClick={() => !isPastDay && setSelectedDate(dateString)}
                  className={`p-2 text-center rounded transition-all ${
                    isPastDay 
                      ? 'text-outline line-through cursor-not-allowed opacity-50' 
                      : isSelected 
                        ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 cursor-pointer' 
                        : 'hover:bg-primary/20 text-on-surface cursor-pointer'
                  }`}
                >
                  {day}
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
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map(time => {
              const isSelected = selectedTime === time;
              const [slotHour, slotMinute] = time.split(':').map(Number);
              
              // Disable past times if today is selected
              let isPastTime = false;
              if (isTodaySelected) {
                if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                  isPastTime = true;
                }
              }

              const isDisabled = !selectedDate || isPastTime;
              
              return (
                <button 
                  key={time}
                  disabled={isDisabled}
                  onClick={() => setSelectedTime(time)}
                  className={`glass-card py-3 rounded-lg text-center text-body-md transition-all border ${
                    isDisabled 
                      ? 'opacity-30 cursor-not-allowed border-outline-variant text-on-surface' 
                      : isSelected 
                        ? 'bg-primary text-on-primary font-bold border-primary' 
                        : 'text-on-surface hover:bg-primary hover:text-on-primary border-outline-variant hover:border-primary'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
