import React from "react";

export default function POSServiceList({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  displayedItems,
  selectedItems,
  selectItem,
}) {
  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="font-headline-sm text-2xl text-on-surface mb-1">
            Thêm Dịch vụ / Sản phẩm
          </h2>
          <span className="font-label-md text-xs text-gold-dim">
            Tìm kiếm để thêm vào giỏ hàng POS
          </span>
        </div>
        <div className="relative w-full md:max-w-md flex items-center gap-3">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">
            search
          </span>
          <input
            className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/40 transition-all text-sm font-body-md"
            placeholder="Ví dụ: Cắt tóc, sáp vuốt..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-surface-container border border-outline-variant rounded-lg h-11 px-3 text-sm"
            aria-label="Sắp xếp theo giá"
          >
            <option value="priceAsc">Giá: Tăng dần</option>
            <option value="priceDesc">Giá: Giảm dần</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedItems.map((item) => {
          const isSelected = selectedItems.some((i) => i._id === item._id);
          const isProduct = item.itemType === "product";

          return (
            <div
              key={item._id || item.id}
              onClick={() => selectItem(item)}
              className={`bg-surface-container/70 backdrop-blur-md p-5 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[140px] relative overflow-hidden group border ${
                isSelected
                  ? "border-primary bg-primary/5 scale-[0.98]"
                  : "border-outline-variant hover:border-primary"
              }`}
            >
              <div className="absolute top-2 right-2 z-20">
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${isProduct ? "border-gold-dim text-gold-dim" : "border-primary text-primary"}`}
                >
                  {isProduct ? "Sản phẩm" : "Dịch vụ"}
                </span>
              </div>

              <div className="relative z-10">
                <div className="w-full h-36 mb-3 overflow-hidden rounded-lg bg-surface-container">
                  {(item.images && item.images[0]) || item.image ? (
                    <img
                      src={(item.images && item.images[0]) || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                      <span className="material-symbols-outlined text-outline-variant text-4xl">
                        inventory_2
                      </span>
                    </div>
                  )}
                </div>
                <h3
                  className={`font-headline-sm text-lg line-clamp-2 leading-tight transition-colors ${isSelected ? "text-primary" : "text-on-surface group-hover:text-primary"}`}
                >
                  {item.name}
                </h3>
                {!isProduct && (
                  <p className="font-label-md text-on-surface-variant text-xs mt-1">
                    {item.durationMinutes || item.duration || 30} phút
                  </p>
                )}
                {isProduct && (
                  <p className="font-label-md text-on-surface-variant text-xs mt-1">
                    Kho: {item.stock}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-end relative z-10 mt-4">
                <span className="font-label-md font-bold text-primary text-lg">
                  {item.price ? item.price.toLocaleString("vi-VN") : 0}đ
                </span>
                <span
                  className={`material-symbols-outlined text-2xl transition-colors ${isSelected ? "text-primary" : "text-outline-variant group-hover:text-primary"}`}
                  style={{
                    fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {isSelected ? "check_circle" : "add_circle"}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          );
        })}
        {displayedItems.length === 0 && (
          <div className="col-span-full text-center py-10 text-on-surface-variant">
            Không tìm thấy kết quả nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
