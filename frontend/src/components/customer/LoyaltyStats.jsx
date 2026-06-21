import React from 'react';

export default function LoyaltyStats({ stats }) {
  const points = stats?.points || 0;
  
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
      {/* Loyalty Card */}
      <div className="border border-outline-variant rounded-lg p-8 flex-grow flex flex-col justify-center items-center text-center bg-surface-container-low hover:border-primary-container/40 transition-all glow-accent">
        <span className="material-symbols-outlined text-primary-container text-5xl mb-6 opacity-80">military_tech</span>
        <div className="font-display-lg text-5xl text-on-surface leading-none mb-3 serif-title">{points.toLocaleString('vi-VN')}</div>
        <div className="font-label-md text-xs text-primary-container uppercase tracking-[0.3em] font-bold">Điểm Obsidian</div>
        <div className="w-16 h-[1px] bg-primary-container/30 mt-6"></div>
      </div>
      
      {/* Quick Book */}
      <button className="w-full bg-surface-container border border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container transition-all p-6 rounded-lg flex items-center justify-between group">
        <span className="font-label-md text-xs uppercase tracking-[0.2em] font-bold">Đặt lại dịch vụ trước</span>
        <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform text-primary-container">arrow_forward</span>
      </button>
    </div>
  );
}
