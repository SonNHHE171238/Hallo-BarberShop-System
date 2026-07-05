import React from "react";

export default function POSSummaryCard({
  selectedItems,
  hasServices,
  selectedStaff,
  subTotal,
  vat,
  total,
  decreaseQuantity,
  increaseQuantity,
  selectItem,
  handlePrint,
  openTimeModalOrCheckout
}) {
  return (
    <aside className="w-full lg:w-[450px] bg-surface-container/30 backdrop-blur-md border-l border-outline-variant/50 shrink-0 flex flex-col h-[100vh] sticky top-0">
      <div className="flex flex-col p-6 md:p-8 lg:p-10 h-full overflow-hidden">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6 border-b border-outline-variant/20 pb-4 shrink-0">
          Tóm Tắt Đơn POS
        </h2>

        {/* Summary List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">
          {selectedItems.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center mt-10">Giỏ hàng trống</p>
          ) : (
            selectedItems.map(item => {
              const isProduct = item.itemType === 'product';
              return (
                <div key={item._id} className="flex justify-between items-start animate-fade-in bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                  <div className="flex-1 pr-4">
                    <h4 className="font-body-md font-semibold text-on-surface text-base leading-tight mb-1">{item.name}</h4>
                    {!isProduct && (
                      <span className="text-[10px] text-primary border border-primary/50 rounded px-1.5 py-0.5 uppercase">Dịch vụ</span>
                    )}
                    {isProduct && (
                       <div className="flex items-center gap-3 mt-2 bg-surface p-1 rounded w-fit border border-outline-variant/50">
                          <button onClick={() => decreaseQuantity(item._id)} className="w-6 h-6 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface">-</button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item._id)} className="w-6 h-6 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface">+</button>
                       </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-body-md font-bold text-on-surface block">
                      {item.price ? ((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN') : 0}đ
                    </span>
                    <button 
                      onClick={() => selectItem(item)}
                      className="text-[10px] text-error hover:underline uppercase tracking-tighter mt-2 inline-block"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )
            })
          )}
          
          {/* Display Barber in Summary */}
          {hasServices && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20 shrink-0">
              <p className="font-label-md text-on-surface-variant text-sm">
                Barber phụ trách: <span className="text-primary/80 font-bold ml-1">{selectedStaff ? (selectedStaff.userId?.name || "Unknown Barber") : 'Chưa chỉ định'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-outline-variant/20 pt-6 space-y-4 shrink-0">
          <div className="flex justify-between font-body-md text-on-surface-variant">
            <span>Tạm tính</span>
            <span className="font-label-md">{subTotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between font-body-md text-on-surface-variant">
            <span>Thuế VAT (8%)</span>
            <span className="font-label-md">{vat.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between font-headline-md text-3xl text-primary pt-4">
            <span>Tổng Tiền</span>
            <span className="font-bold tracking-tight">{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-6 space-y-4 shrink-0">
          <button 
            onClick={handlePrint}
            disabled={selectedItems.length === 0}
            className="w-full py-5 border border-outline-gold text-primary rounded-lg font-label-md font-bold flex items-center justify-center gap-3 hover:bg-primary/5 transition-all active:scale-[0.98] group disabled:opacity-50"
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">print</span>
            IN HÓA ĐƠN TẠM
          </button>
          <button 
            onClick={openTimeModalOrCheckout}
            disabled={selectedItems.length === 0}
            className={`w-full py-5 rounded-lg font-label-md font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 ${hasServices ? 'bg-primary text-on-primary hover:brightness-110 shadow-primary/20' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-600/20'}`}
          >
            <span className="material-symbols-outlined">
              {hasServices ? 'schedule' : 'point_of_sale'}
            </span>
            {hasServices ? 'CHỌN GIỜ & XÁC NHẬN' : 'THANH TOÁN NGAY'}
          </button>
        </div>
      </div>
    </aside>
  );
}
