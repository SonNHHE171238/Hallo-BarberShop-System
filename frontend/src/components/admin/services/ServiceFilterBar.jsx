import React from 'react';

export default function ServiceFilterBar({ search = '', onSearch, category = 'all', onCategoryChange, total = 0 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
      <div className="md:col-span-8 glass-panel p-6 flex flex-col md:flex-row gap-4 items-center rounded-lg">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input value={search} onChange={(e) => onSearch && onSearch(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary py-3 pl-12 text-on-surface font-body-md rounded-md" placeholder="Tìm kiếm tên dịch vụ..." type="text"/>
        </div>
        <div className="flex gap-2 w-full md:w-auto items-center">
          <label className="text-on-surface-variant text-body-sm">Danh mục</label>
          <select value={category} onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)} className="rounded-3xl border border-outline-variant bg-surface p-4 text-on-surface">
            <option value="all">Tất cả</option>
            <option value="cut">Cắt</option>
            <option value="perm">Uốn</option>
            <option value="color">Hóa chất</option>
            <option value="combo">Combo</option>
            <option value="styling">Styling</option>
            <option value="treatment">Chăm sóc</option>
          </select>
        </div>
      </div>
      <div className="md:col-span-4 glass-panel p-6 flex items-center justify-between rounded-lg">
        <span className="text-on-surface-variant font-body-md">Tổng số dịch vụ:</span>
        <span className="text-primary font-playfair text-headline-md">{total}</span>
      </div>
    </div>
  );
}
