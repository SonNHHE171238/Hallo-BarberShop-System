import React from "react";

export default function QuickActions({ selectMode }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <button
        onClick={() => selectMode('staff')}
        className="bg-transparent border border-outline-variant text-on-surface hover:text-primary hover:border-primary px-4 py-2.5 rounded-xl font-label-md uppercase tracking-wider text-[11px] transition-all"
      >
        Nhắn tin với Nhân viên
      </button>
      <button
        onClick={() => selectMode('ai')}
        className="bg-primary text-on-primary hover:bg-primary-fixed border border-primary px-4 py-2.5 rounded-xl font-label-md uppercase tracking-wider text-[11px] transition-all shadow-md shadow-primary/20"
      >
        Nhắn tin với AI Assistant
      </button>
    </div>
  );
}
