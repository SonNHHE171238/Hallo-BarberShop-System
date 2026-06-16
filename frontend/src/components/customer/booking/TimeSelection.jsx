import React from 'react';

export default function TimeSelection({ selectedTime, onSelectTime }) {
  const dates = [
    { day: 'T2', date: '25', active: true },
    { day: 'T3', date: '26', active: false },
    { day: 'T4', date: '27', active: false },
    { day: 'T5', date: '28', active: false },
    { day: 'T6', date: '29', active: false },
    { day: 'T7', date: '30', active: false },
  ];

  const times = [
    { time: '09:00', status: 'available' },
    { time: '10:00', status: 'available' },
    { time: '11:00', status: 'disabled' },
    { time: '13:30', status: 'available' },
    { time: '14:00', status: 'available' },
    { time: '15:00', status: 'available' },
    { time: '16:00', status: 'available' },
    { time: '17:00', status: 'available' },
    { time: '18:00', status: 'available' },
    { time: '19:00', status: 'available' },
  ];

  return (
    <section id="step-3">
      <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
        <h2 className="font-headline-md text-headline-md flex items-center gap-4 text-primary">
          <span className="w-10 h-10 rounded-full border border-primary flex items-center justify-center text-label-md">03</span>
          Chọn Thời Gian
        </h2>
      </div>
      <div className="glass-panel p-8 rounded-xl border border-outline-variant">
        <div className="flex gap-4 overflow-x-auto pb-6 mb-8 custom-scrollbar">
          {dates.map((d, i) => (
            <button 
              key={i} 
              className={`shrink-0 flex flex-col items-center justify-center w-20 py-4 rounded-lg transition-colors ${
                d.active 
                  ? 'bg-primary text-on-primary border border-primary' 
                  : 'border border-outline-variant hover:border-primary'
              }`}
            >
              <span className={`text-xs uppercase tracking-widest ${d.active ? 'opacity-80' : 'text-on-surface-variant'}`}>{d.day}</span>
              <span className="font-headline-sm">{d.date}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {times.map((t, i) => {
            const isSelected = selectedTime === t.time;
            const isDisabled = t.status === 'disabled';
            
            let btnClass = "py-3 rounded-lg border text-center font-label-md transition-all ";
            if (isDisabled) {
              btnClass += "border-outline-variant opacity-20 cursor-not-allowed";
            } else if (isSelected) {
              btnClass += "border-primary bg-primary/10 text-primary";
            } else {
              btnClass += "border-outline-variant hover:border-primary cursor-pointer";
            }

            return (
              <button 
                key={i} 
                className={btnClass}
                disabled={isDisabled}
                onClick={() => onSelectTime(t.time)}
              >
                {t.time}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
