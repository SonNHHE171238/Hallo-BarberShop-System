import React from 'react';

import Link from 'next/link';

export default function NextAppointment({ appointment }) {
  if (!appointment) {
    return (
      <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant rounded-lg p-8 flex flex-col justify-center items-center text-center glow-accent relative overflow-hidden group">
        <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4 opacity-50">calendar_today</span>
        <h2 className="font-headline-md text-2xl text-on-surface mb-2">Bạn chưa có lịch hẹn nào</h2>
        <p className="font-body-md text-on-surface-variant mb-6">Hãy đặt một lịch hẹn để trải nghiệm dịch vụ chăm sóc tóc chuyên nghiệp của chúng tôi.</p>
        <Link href="/booking" className="px-8 py-3 bg-primary text-on-primary font-label-md text-sm uppercase tracking-widest hover:opacity-90 transition-opacity rounded font-bold">
          Đặt Lịch Ngay
        </Link>
      </div>
    );
  }

  const dateObj = new Date(appointment.bookingDate);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  // Format status map
  const statusMap = {
    pending: { label: 'CHƯA TỚI', icon: 'schedule', colorClass: 'text-secondary bg-secondary/10 border-secondary/40' },
    confirmed: { label: 'KHÁCH ĐÃ ĐẾN', icon: 'how_to_reg', colorClass: 'text-green-600 bg-green-500/10 border-green-500/40' }
  };
  
  const statusInfo = statusMap[appointment.status] || statusMap.pending;

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant rounded-lg p-8 flex flex-col justify-between glow-accent relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 z-10 relative">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-primary-container/30">
            <span className="material-symbols-outlined text-sm">workspace_premium</span> 
            LỊCH HẸN SẮP TỚI
          </div>
          <div className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-2">{day}/{month}</div>
          <h2 className="font-headline-md text-2xl text-on-surface serif-title">{appointment.services && appointment.services.length > 0 ? appointment.services.map(s => s.name).join(', ') : 'Dịch vụ'}</h2>
          <p className="font-body-md text-on-surface-variant mt-2 italic">Tinh hoa sự lịch lãm cùng Nghệ nhân Barber {appointment.barberId?.userId?.name || 'Ngẫu nhiên'}</p>
        </div>
        <div className={`border rounded px-4 py-2 flex items-center gap-2 self-start sm:self-auto ${statusInfo.colorClass}`}>
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
          <span className="font-label-md text-xs tracking-widest font-bold">{statusInfo.label}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-8 items-start sm:items-end justify-between border-t border-outline-variant pt-8">
        <div className="flex gap-8 items-center z-10 relative">
          <div className="flex flex-col">
            <span className="font-display-lg text-4xl md:text-5xl text-on-surface leading-none serif-title">{day}</span>
            <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">Tháng {month}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-4xl md:text-5xl text-primary-container/30 leading-none mb-4 sm:mb-5">|</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-4xl md:text-5xl text-on-surface leading-none serif-title">{hours}:{minutes}</span>
            <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">Giờ</span>
          </div>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Link href="/booking" className="flex-1 sm:flex-none px-8 py-3 border border-outline text-on-surface font-label-md text-xs uppercase tracking-widest hover:bg-surface-variant transition-colors rounded text-center">Đổi lịch</Link>
          <button className="flex-1 sm:flex-none px-8 py-3 bg-primary-container text-on-primary-container font-label-md text-xs uppercase tracking-widest hover:opacity-90 transition-opacity rounded font-bold" onClick={() => console.log('Chi tiết clicked')}>Chi tiết</button>
        </div>
      </div>
    </div>
  );
}
