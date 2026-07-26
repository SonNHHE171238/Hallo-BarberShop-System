import React from "react";

export default function BlogTableFilter({ sortOption, setSortOption }) {
  return (
    <div className="glass-panel p-4 mb-0 border-b-0 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative w-full md:w-80 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            className="w-full bg-surface-obsidian border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-on-surface pl-10 pr-4 py-2 text-sm transition-all outline-none rounded-sm" 
            placeholder="Tìm kiếm tiêu đề, tác giả..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-on-surface-variant text-sm font-label-md mr-2">Sắp xếp theo:</span>
        <select 
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-surface-obsidian border border-outline-variant text-on-surface text-sm py-2 px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none rounded-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="a-z">Tiêu đề (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
