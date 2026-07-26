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

      {/* List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 pr-2">
        {searchTerm.trim() === "" ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant opacity-50 gap-4 mt-20">
            <span className="material-symbols-outlined text-[80px] opacity-30">
              search
            </span>
            <p className="font-body-md text-lg font-medium text-center px-4">
              Vui lòng nhập tên dịch vụ hoặc sản phẩm vào thanh tìm kiếm<br/>để bắt đầu chọn.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {filteredByCategory.map((item) => {
                const isSelected = selectedItems.some((i) => i._id === item._id);
                const isProduct = item.itemType === "product";

                return (
                  <div
                    key={item._id || item.id}
                    onClick={() => selectItem(item)}
                    className={`bg-surface-container-lowest p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4 relative overflow-hidden group shadow-sm hover:shadow-md ${
                      isSelected
                        ? "border-2 border-primary bg-primary/5 scale-[0.99]"
                        : "border border-outline-variant/50 hover:border-primary/50"
                    }`}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden rounded-lg bg-surface-variant/30 relative">
                      {(item.images && item.images[0]) || item.image ? (
                        <img
                          src={(item.images && item.images[0]) || item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? '' : 'group-hover:scale-110'}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline-variant text-2xl md:text-3xl opacity-50">
                            {isProduct ? 'inventory_2' : 'spa'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isProduct ? "bg-surface-variant text-on-surface border border-outline-variant" : "bg-primary/10 text-primary"
                        }`}>
                          {isProduct ? "Sản phẩm" : "Dịch vụ"}
                        </span>
                      </div>
                      <h3
                        className={`font-headline-sm text-sm md:text-base truncate transition-colors ${isSelected ? "text-primary font-bold" : "text-on-surface group-hover:text-primary"}`}
                      >
                        {item.name}
                      </h3>
                      
                      <div className="mt-1 flex items-center opacity-80">
                        {!isProduct && (
                          <span className="font-label-md text-on-surface-variant text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {item.durationMinutes || item.duration || 30} phút
                          </span>
                        )}
                        {isProduct && (
                          <span className="font-label-md text-on-surface-variant text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">inventory</span>
                            Kho: {item.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-end justify-center shrink-0 pl-2">
                      <span className="font-label-md font-bold text-primary text-base">
                        {item.price ? item.price.toLocaleString("vi-VN") : 0}đ
                      </span>
                      
                      <div className={`mt-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
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
          </>
        )}
      </div>
    </div>
  );
}
