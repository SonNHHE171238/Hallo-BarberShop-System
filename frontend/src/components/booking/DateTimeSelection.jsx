import React from "react";

export default function DateTimeSelection({ selectedDate, setSelectedDate, selectedTime, setSelectedTime }) {
  // Mock days and slots for UI
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const timeSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  
  // Hardcode 13:00 as disabled for demonstration
  const disabledSlots = ["13:00"];

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
            <span className="font-bold text-primary">Tháng 12, 2024</span>
            <div className="flex space-x-2">
              <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-label-md mb-4">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d} className="text-on-surface-variant">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for starting day */}
            <div className="p-2 text-center text-outline line-through">28</div>
            <div className="p-2 text-center text-outline line-through">29</div>
            <div className="p-2 text-center text-outline line-through">30</div>
            <div className="p-2 text-center text-outline line-through">1</div>
            
            {/* Valid days */}
            {daysInMonth.slice(1).map(day => {
              const isSelected = selectedDate === day;
              return (
                <div 
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`p-2 text-center cursor-pointer rounded transition-all ${
                    isSelected 
                      ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20' 
                      : 'hover:bg-primary/20 text-on-surface'
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
              const isDisabled = disabledSlots.includes(time) || !selectedDate;
              
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
