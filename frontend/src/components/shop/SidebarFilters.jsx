import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function SidebarFilters({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-12">
      {/* Category Filter */}
      <div>
        <h3 className="font-headline-md text-headline-md mb-6 text-primary-fixed border-b border-outline-variant/50 pb-2">Danh Mục</h3>
        <ul className="space-y-4 font-label-md text-label-md tracking-widest uppercase">
          <li>
            <button 
              onClick={() => onSelectCategory(null)}
              className={`flex justify-between items-center w-full text-left transition-colors ${!selectedCategory ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span>Tất Cả</span> 
              {!selectedCategory && <span className="material-symbols-outlined text-[16px] transform translate-x-1">chevron_right</span>}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <button 
                onClick={() => onSelectCategory(cat._id)}
                className={`flex justify-between items-center w-full text-left transition-colors ${selectedCategory === cat._id ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                <span>{cat.name}</span>
                {selectedCategory === cat._id && <span className="material-symbols-outlined text-[16px] transform translate-x-1">chevron_right</span>}
              </button>
            </li>
          ))}
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
