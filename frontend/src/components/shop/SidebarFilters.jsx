import React from "react";
import Link from "next/link";

export default function SidebarFilters() {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-12">
      {/* Category Filter */}
      <div>
        <h3 className="font-headline-md text-headline-md mb-6 text-primary-fixed border-b border-outline-variant/50 pb-2">Danh Mục</h3>
        <ul className="space-y-4 font-label-md text-label-md tracking-widest uppercase">
          <li>
            <Link className="text-primary flex justify-between items-center group" href="#">
              <span>Tất Cả</span> <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">chevron_right</span>
            </Link>
          </li>
          <li>
            <Link className="text-on-surface-variant hover:text-primary transition-colors flex justify-between items-center" href="#">
              <span>Tóc</span>
            </Link>
          </li>
          <li>
            <Link className="text-on-surface-variant hover:text-primary transition-colors flex justify-between items-center" href="#">
              <span>Râu</span>
            </Link>
          </li>
          <li>
            <Link className="text-on-surface-variant hover:text-primary transition-colors flex justify-between items-center" href="#">
              <span>Da</span>
            </Link>
          </li>
          <li>
            <Link className="text-on-surface-variant hover:text-primary transition-colors flex justify-between items-center" href="#">
              <span>Dụng Cụ</span>
            </Link>
          </li>
        </ul>
      </div>
      {/* Brand Filter */}
      <div>
        <h3 className="font-headline-md text-headline-md mb-6 text-primary-fixed border-b border-outline-variant/50 pb-2">Thương Hiệu</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-4 cursor-pointer group">
            <input defaultChecked className="form-checkbox h-4 w-4 bg-transparent border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" type="checkbox"/>
            <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">HALLO</span>
          </label>
          <label className="flex items-center space-x-4 cursor-pointer group">
            <input className="form-checkbox h-4 w-4 bg-transparent border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" type="checkbox"/>
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Obsidian</span>
          </label>
          <label className="flex items-center space-x-4 cursor-pointer group">
            <input className="form-checkbox h-4 w-4 bg-transparent border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" type="checkbox"/>
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Apex</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
