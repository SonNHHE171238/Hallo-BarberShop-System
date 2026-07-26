"use client";

import React from "react";

export default function FeedbackTableFilter({ sortOption, setSortOption, searchTerm, setSearchTerm }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 glass-panel border border-outline-variant/30">
      <div className="relative w-full md:w-96 group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
          search
        </span>
        <input 
          className="w-full bg-surface-container-highest border border-outline-variant/50 focus:border-primary px-12 py-3 text-sm text-on-surface outline-none transition-all rounded-sm placeholder:text-on-surface-variant/50"
          placeholder="Tìm kiếm theo mã Booking, SĐT..." 
          type="text"
          value={searchTerm || ""}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="text-sm font-label-md text-on-surface-variant whitespace-nowrap">Sắp xếp theo:</span>
        <select 
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-surface-container-highest border border-outline-variant/50 focus:border-primary px-4 py-3 text-sm text-on-surface outline-none transition-all cursor-pointer rounded-sm min-w-[160px]"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="high-rating">Điểm cao nhất</option>
          <option value="low-rating">Điểm thấp nhất</option>
        </select>
      </div>
    </div>
  );
}
