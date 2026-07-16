import React from "react";

export default function BlogStatsBar() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-panel p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">article</span>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant font-label-md">TỔNG SỐ</p>
          <p className="text-2xl font-bold">128</p>
        </div>
      </div>
      
      <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-green-500/50">
        <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center text-green-500">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant font-label-md">ĐÃ ĐĂNG</p>
          <p className="text-2xl font-bold">94</p>
        </div>
      </div>
      
      <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-yellow-500/50">
        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <span className="material-symbols-outlined text-3xl">edit_note</span>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant font-label-md">NHÁP</p>
          <p className="text-2xl font-bold">12</p>
        </div>
      </div>
      
      <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-blue-500/50">
        <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center text-blue-500">
          <span className="material-symbols-outlined text-3xl">schedule</span>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant font-label-md">LỊCH HẸN</p>
          <p className="text-2xl font-bold">22</p>
        </div>
      </div>
    </div>
  );
}
