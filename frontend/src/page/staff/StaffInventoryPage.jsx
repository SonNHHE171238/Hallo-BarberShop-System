"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRef } from 'react';

const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : (value || placeholder);

  return (
    <div className="relative min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-surface-container border px-3 py-2 rounded focus:ring-1 focus:ring-primary text-body-md transition-all flex items-center justify-between cursor-pointer ${
          isOpen 
            ? 'border-primary ring-1 ring-primary' 
            : 'border-outline-variant hover:border-primary'
        }`}
      >
        <span className={displayValue !== placeholder ? 'text-on-surface' : 'text-on-surface-variant'}>
          {displayValue}
        </span>
        <span className={`material-symbols-outlined text-outline-variant transition-transform text-[20px] ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface-container-high border border-outline-variant rounded shadow-xl overflow-hidden">
          <ul className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-surface-bright/20 transition-colors text-sm ${value === opt.value ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

import ImportProductModal from '@/components/admin/ImportProductModal';
import ImportReceiptsModal from '@/components/admin/ImportReceiptsModal';

export default function StaffInventoryPage() {
  const tableContainerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReceiptsModalOpen, setIsReceiptsModalOpen] = useState(false);
  
  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
  });

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Stats & Categories
      const [statsRes, catRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products/stats'),
        axios.get('http://localhost:5000/api/categories')
      ]);
      
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);

      await fetchProducts(1, selectedCategory, sortOption);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (currentPage, categoryId, sort, search = searchQuery) => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/products?page=${currentPage}&limit=5&includeInactive=true`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (sort) url += `&sort=${sort}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setProducts(res.data.data.products || []);
        setPage(res.data.data.page || 1);
        setPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    fetchProducts(1, categoryId, sortOption);
  };

  const handleHeaderSort = (field) => {
    let newSort = 'newest';
    if (field === 'price') {
      if (sortOption === 'price_desc') newSort = 'price_asc';
      else if (sortOption === 'price_asc') newSort = 'newest';
      else newSort = 'price_desc';
    } else if (field === 'stock') {
      if (sortOption === 'stock_desc') newSort = 'stock_asc';
      else if (sortOption === 'stock_asc') newSort = 'newest';
      else newSort = 'stock_desc';
    }
    
    setSortOption(newSort);
    setPage(1);
    fetchProducts(1, selectedCategory, newSort, searchQuery);
  };

  const getSortTooltip = (field) => {
    if (field === 'price') {
      if (sortOption === 'price_desc') return 'Cao tới thấp';
      if (sortOption === 'price_asc') return 'Thấp tới cao';
      return 'Mặc định';
    }
    if (field === 'stock') {
      if (sortOption === 'stock_desc') return 'Cao tới thấp';
      if (sortOption === 'stock_asc') return 'Thấp tới cao';
      return 'Mặc định';
    }
    return '';
  };
  
  const renderSortIcon = (field) => {
    if (field === 'price') {
      if (sortOption === 'price_desc') return 'arrow_downward';
      if (sortOption === 'price_asc') return 'arrow_upward';
    }
    if (field === 'stock') {
      if (sortOption === 'stock_desc') return 'arrow_downward';
      if (sortOption === 'stock_asc') return 'arrow_upward';
    }
    return 'unfold_more';
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchProducts(newPage, selectedCategory, sortOption);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, selectedCategory, sortOption, searchQuery);
  };

  return (
    <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop pt-10 pb-4 w-full h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      
      {/* Inventory Table Container */}
      <div className="bg-surface-container-highest/60 backdrop-blur-md rounded-lg overflow-hidden border border-outline-variant flex-1 flex flex-col min-h-0">
        
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-body-md hidden sm:inline whitespace-nowrap">Danh mục:</span>
            <CustomDropdown 
              options={[
                { value: '', label: 'Tất cả danh mục' },
                ...categories.map(cat => ({ value: cat._id, label: cat.name }))
              ]}
              value={selectedCategory}
              onChange={handleCategoryFilter}
              placeholder="Chọn danh mục"
            />
          </div>
          
            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end relative">
              <button 
                onClick={() => setIsReceiptsModalOpen(true)}
                className="flex items-center gap-1 bg-surface-container-highest text-on-surface-variant border border-outline-variant px-4 py-2 rounded hover:text-primary transition-all font-bold uppercase tracking-wider text-[13px]"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Lịch sử nhập
              </button>

              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1 bg-secondary text-on-secondary px-4 py-2 rounded hover:brightness-110 active:scale-95 transition-all font-bold uppercase tracking-wider text-[13px]"
              >
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                Nhập hàng
              </button>
              
            <div className="relative">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center justify-center p-2 rounded-full hover:bg-surface-bright/10 text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">search</span>
              </button>
              
              {showSearch && (
                <form 
                  onSubmit={handleSearchSubmit}
                  className="absolute top-full right-0 mt-2 bg-surface-container-high border border-outline-variant p-2 rounded-lg shadow-xl flex items-center gap-2 z-50 w-[250px]"
                >
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Nhập tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
                  />
                  <button type="submit" className="text-primary hover:brightness-110 p-1">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div 
          ref={tableContainerRef}
          className="overflow-auto flex-1 min-h-[200px] border-t border-outline-variant custom-scrollbar relative"
        >
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead className="sticky top-0 bg-surface-bright/95 backdrop-blur-sm z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-headline-sm text-label-md text-primary tracking-wider uppercase">Ảnh</th>
                <th className="px-6 py-4 font-headline-sm text-label-md text-primary tracking-wider uppercase">Sản Phẩm</th>
                <th className="px-6 py-4 font-headline-sm text-label-md text-primary tracking-wider uppercase">Danh Mục</th>
                <th className="px-6 py-4 font-headline-sm text-label-md text-primary tracking-wider uppercase text-right">
                  <button 
                    onClick={() => handleHeaderSort('price')}
                    title={getSortTooltip('price')}
                    className="inline-flex items-center gap-1 hover:brightness-125 transition-all outline-none text-right"
                  >
                    Giá
                    <span className={`material-symbols-outlined text-[16px] transition-all ${sortOption.startsWith('price') ? 'opacity-100 text-gold' : 'opacity-40'}`}>
                      {renderSortIcon('price')}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-4 font-headline-sm text-label-md text-primary tracking-wider uppercase text-center">
                  <button 
                    onClick={() => handleHeaderSort('stock')}
                    title={getSortTooltip('stock')}
                    className="inline-flex items-center gap-1 hover:brightness-125 transition-all outline-none"
                  >
                    Tồn Kho
                    <span className={`material-symbols-outlined text-[16px] transition-all ${sortOption.startsWith('stock') ? 'opacity-100 text-gold' : 'opacity-40'}`}>
                      {renderSortIcon('stock')}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-on-surface-variant">Không tìm thấy sản phẩm nào.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-surface-bright/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded overflow-hidden border border-outline-variant group-hover:border-primary transition-colors bg-surface-container flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-outline-variant opacity-50">inventory_2</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-body-lg text-on-surface line-clamp-1" title={product.name}>{product.name}</span>
                        <span className="text-label-md text-on-surface-variant mt-1 line-clamp-1">{product.brand ? `Thương hiệu: ${product.brand}` : "Không rõ thương hiệu"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary border border-secondary-container/50 text-label-md whitespace-nowrap">
                        {product.categoryId?.name || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-label-md text-gold-dim font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-label-md font-bold text-lg px-4 py-1 rounded-full border ${product.stock > 10 ? 'bg-success/10 text-success border-success/30' : product.stock > 0 ? 'bg-warning/10 text-warning border-warning/30' : 'bg-error/10 text-error border-error/30'}`}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 0 && (
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between shrink-0 bg-surface-container-highest/60">
            <span className="text-label-md text-on-surface-variant hidden sm:inline-block">
              Trang {page} trên {pages}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button 
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded font-bold transition-colors ${
                    page === p 
                      ? 'bg-primary text-on-primary' 
                      : 'border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10'
                  }`}
                >
                  {p}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ImportProductModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
        userRole="staff"
      />

      <ImportReceiptsModal 
        isOpen={isReceiptsModalOpen}
        onClose={() => setIsReceiptsModalOpen(false)}
        userRole="staff"
      />
    </div>
  );
}
