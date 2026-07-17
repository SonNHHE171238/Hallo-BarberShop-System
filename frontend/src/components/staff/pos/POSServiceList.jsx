import React, { useState } from "react";

export default function POSServiceList({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  displayedItems,
  selectedItems,
  selectItem,
}) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredByCategory = displayedItems.filter(item => {
    if (activeCategory === "all") return true;
    return item.itemType === activeCategory;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 shrink-0 pt-4">
        <div>
          <h2 className="font-headline-sm text-2xl text-on-surface mb-3">
            Chọn Dịch vụ / Sản phẩm
          </h2>
          {/* Category Pills */}
          <div className="flex gap-2 bg-surface-container-high p-1 rounded-lg w-fit border border-outline-variant/30">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveCategory("service")}
              className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === "service" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
              }`}
            >
              Dịch vụ
            </button>
            <button
              onClick={() => setActiveCategory("product")}
              className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === "product" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
              }`}
            >
              Sản phẩm
            </button>
          </div>
        </div>
        <div className="relative w-full md:max-w-md flex items-center gap-3">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">
            search
          </span>
          <input
            className="w-full bg-surface-container border border-outline-variant/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-outline-variant/50 transition-all text-sm font-body-md"
            placeholder="Tìm kiếm nhanh..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-surface-container border border-outline-variant/50 rounded-lg h-[46px] px-3 text-sm focus:outline-none focus:border-primary"
            aria-label="Sắp xếp theo giá"
          >
            <option value="priceAsc">Giá: Tăng dần</option>
            <option value="priceDesc">Giá: Giảm dần</option>
          </select>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 pr-2">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {filteredByCategory.map((item) => {
            const isSelected = selectedItems.some((i) => i._id === item._id);
            const isProduct = item.itemType === "product";

            return (
              <div
                key={item._id || item.id}
                onClick={() => selectItem(item)}
                className={`bg-surface-container-lowest p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between h-full min-h-[260px] relative overflow-hidden group shadow-sm hover:shadow-md ${
                  isSelected
                    ? "border-2 border-primary bg-primary/5 scale-[0.98]"
                    : "border border-outline-variant/50 hover:border-primary/50"
                }`}
              >
                {/* Type Badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className={`text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      isProduct ? "bg-surface-variant/90 text-on-surface border border-outline-variant" : "bg-primary/90 text-on-primary"
                    }`}
                  >
                    {isProduct ? "Sản phẩm" : "Dịch vụ"}
                  </span>
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Image */}
                  <div className="w-full h-[130px] shrink-0 mb-3 overflow-hidden rounded-lg bg-surface-variant/30">
                    {(item.images && item.images[0]) || item.image ? (
                      <img
                        src={(item.images && item.images[0]) || item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? '' : 'group-hover:scale-110'}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline-variant text-4xl opacity-50">
                          {isProduct ? 'inventory_2' : 'spa'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <h3
                    className={`font-headline-sm text-sm md:text-base line-clamp-2 leading-tight transition-colors ${isSelected ? "text-primary font-bold" : "text-on-surface group-hover:text-primary"}`}
                  >
                    {item.name}
                  </h3>
                  
                  <div className="mt-1 flex items-center justify-between opacity-80">
                    {!isProduct && (
                      <span className="font-label-md text-on-surface-variant text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {item.durationMinutes || item.duration || 30} phút
                      </span>
                    )}
                    {isProduct && (
                      <span className="font-label-md text-on-surface-variant text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">inventory</span>
                        Kho: {item.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer / Price */}
                <div className="flex justify-between items-end relative z-10 mt-3 pt-3 border-t border-outline-variant/30">
                  <span className="font-label-md font-bold text-primary text-base md:text-lg">
                    {item.price ? item.price.toLocaleString("vi-VN") : 0}đ
                  </span>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isSelected ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary"
                  }`}>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                      {isSelected ? "check" : "add"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredByCategory.length === 0 && (
          <div className="w-full text-center py-20 text-on-surface-variant flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl opacity-30">search_off</span>
            <p className="font-body-md text-lg">Không tìm thấy kết quả nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
