import React from 'react';

export default function NextAppointment() {
  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant rounded-lg p-8 flex flex-col justify-between glow-accent relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-primary-container/30">
            <span className="material-symbols-outlined text-sm">workspace_premium</span> 
            THÀNH VIÊN CẤP CAO
          </div>
          <div className="font-label-md text-xs text-primary-container uppercase tracking-[0.2em] mb-2">Buổi hẹn sắp tới</div>
          <h2 className="font-headline-md text-2xl text-on-surface serif-title">Cắt Tóc Executive & Khăn Nóng</h2>
          <p className="font-body-md text-on-surface-variant mt-2 italic">Tinh hoa sự lịch lãm cùng Nghệ nhân Barber Julian S.</p>
        </div>
        <div className="bg-primary-container/5 border border-primary-container/40 rounded px-4 py-2 flex items-center gap-2 self-start sm:self-auto">
          <span className="material-symbols-outlined text-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <span className="font-label-md text-xs text-primary-container tracking-widest font-bold">ĐÃ XÁC NHẬN</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-8 items-start sm:items-end justify-between border-t border-outline-variant pt-8">
        <div className="flex gap-8 items-center">
          <div className="flex flex-col">
            <span className="font-display-lg text-4xl md:text-5xl text-on-surface leading-none serif-title">03</span>
            <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">Ngày</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-4xl md:text-5xl text-primary-container/30 leading-none mb-4 sm:mb-5">:</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-4xl md:text-5xl text-on-surface leading-none serif-title">14</span>
            <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">Giờ</span>
          </div>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-8 py-3 border border-outline text-on-surface font-label-md text-xs uppercase tracking-widest hover:bg-surface-variant transition-colors rounded">Đổi lịch</button>
          <button className="flex-1 sm:flex-none px-8 py-3 bg-primary-container text-on-primary-container font-label-md text-xs uppercase tracking-widest hover:opacity-90 transition-opacity rounded font-bold">Chi tiết</button>
        </div>
      </div>
    </div>
  );
}
