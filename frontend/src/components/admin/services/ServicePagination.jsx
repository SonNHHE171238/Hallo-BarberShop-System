import React from 'react';

export default function ServicePagination() {
  return (
    <div className="px-8 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/30 rounded-b-lg">
      <span className="text-on-surface-variant font-label-md text-[12px]">HIỂN THỊ 1-4 TRÊN TỔNG SỐ 12 DỊCH VỤ</span>
      <div className="flex gap-2">
        <button className="w-10 h-10 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary transition-colors rounded-md">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary font-label-md rounded-md">1</button>
        <button className="w-10 h-10 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary transition-colors font-label-md rounded-md">2</button>
        <button className="w-10 h-10 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary transition-colors font-label-md rounded-md">3</button>
        <button className="w-10 h-10 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary transition-colors rounded-md">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
