import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function SidebarFilters({ selectedCategory, onSelectCategory, selectedBrand, onSelectBrand }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

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
    const fetchBrands = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/brands");
        if (res.data.success) {
          setBrands(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchCategories();
    fetchBrands();
  }, []);

  return (
    <aside className="w-full lg:w-56 flex-shrink-0 space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="font-headline-sm text-base font-bold mb-4 text-primary-fixed border-b border-outline-variant/50 pb-2">Danh Mục</h3>
        <ul className="space-y-3 font-label-md text-xs tracking-widest uppercase">
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
        <h3 className="font-headline-sm text-base font-bold mb-4 text-primary-fixed border-b border-outline-variant/50 pb-2">Thương Hiệu</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              checked={!selectedBrand} 
              onChange={() => onSelectBrand(null)}
              className="form-radio h-4 w-4 bg-transparent border-outline-variant text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer" type="radio" name="brand_filter"
            />
            <span className={`font-body-md text-sm transition-colors ${!selectedBrand ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-on-surface'}`}>Tất Cả</span>
          </label>
          {brands.map((brand) => (
            <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                checked={selectedBrand === brand} 
                onChange={() => onSelectBrand(brand)}
                className="form-radio h-4 w-4 bg-transparent border-outline-variant text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer" type="radio" name="brand_filter"
              />
              <span className={`font-body-md text-sm transition-colors ${selectedBrand === brand ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-on-surface'}`}>{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
