import React from 'react';

export default function ScheduleTimeline() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface serif-heading">Dòng Thời Gian</h2>
        <button className="font-label-md text-label-md text-primary uppercase hover:text-gold-dim transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">sync</span> Làm Mới
        </button>
      </div>
      
      <div className="flex flex-col border border-outline-gold rounded overflow-hidden bg-surface-container-lowest">
        {/* Completed Item */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-container-padding border-b border-outline-gold/30 bg-surface-container-lowest opacity-50 grayscale">
          <div className="flex gap-4 sm:gap-6 items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
            <div className="font-label-md text-label-md text-outline w-24 shrink-0 pt-1 sm:pt-0">09:00 AM</div>
            <div className="flex-grow">
              <div className="font-headline-sm text-headline-sm text-on-surface mb-1 serif-heading">David S.</div>
              <div className="font-body-md text-body-md text-on-surface-variant">Cắt Kiểu Executive & Tỉa Râu</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-outline ml-[112px] sm:ml-0">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span className="font-label-md text-[10px] uppercase tracking-widest">Đã Hoàn Thành</span>
          </div>
        </div>

        {/* Active/Next Item */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-container-padding border-b border-outline-gold bg-surface-container relative overflow-hidden">
          {/* Premium Accent */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary shadow-[4px_0_15px_rgba(255,222,165,0.4)]"></div>
          <div className="flex gap-4 sm:gap-6 items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0 pl-4">
            <div className="font-label-md text-label-md text-primary font-bold w-24 shrink-0 pt-1 sm:pt-0">10:30 AM</div>
            <div className="flex-grow">
              <div className="font-headline-sm text-headline-sm text-on-surface mb-1 serif-heading">Elias T.</div>
              <div className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-2">
                Cắt Kéo Truyền Thống
                <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">Khách Mới</span>
              </div>
            </div>
          </div>
          <button className="w-[calc(100%-112px)] sm:w-auto ml-[112px] sm:ml-0 bg-primary text-on-primary font-label-md text-label-md uppercase px-8 py-3 rounded hover:bg-gold-dim transition-all shadow-lg">
            Bắt Đầu Dịch Vụ
          </button>
        </div>

        {/* Pending Item */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-container-padding border-b border-outline-gold/30">
          <div className="flex gap-4 sm:gap-6 items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
            <div className="font-label-md text-label-md text-on-surface-variant w-24 shrink-0 pt-1 sm:pt-0">11:15 AM</div>
            <div className="flex-grow">
              <div className="font-headline-sm text-headline-sm text-on-surface mb-1 serif-heading">Michael R.</div>
              <div className="font-body-md text-body-md text-on-surface-variant">Kiểu Skin Fade</div>
            </div>
          </div>
          <div className="font-label-md text-[10px] uppercase tracking-widest text-outline ml-[112px] sm:ml-0">
            Trong 45 phút nữa
          </div>
        </div>

        {/* Break Item */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-container-padding">
          <div className="flex gap-4 sm:gap-6 items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
            <div className="font-label-md text-label-md text-on-surface-variant w-24 shrink-0 pt-1 sm:pt-0">12:00 PM</div>
            <div className="flex-grow">
              <div className="font-headline-sm text-headline-sm text-on-surface/60 mb-1 serif-heading italic">Nghỉ Trưa</div>
              <div className="font-body-md text-body-md text-on-surface-variant/60">Đã khóa lịch</div>
            </div>
          </div>
          <div className="font-label-md text-[10px] uppercase tracking-widest text-outline ml-[112px] sm:ml-0">
            Nghỉ Giải Lao
          </div>
        </div>
      </div>
    </section>
  );
}
