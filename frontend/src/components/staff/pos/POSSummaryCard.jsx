import React from "react";

export default function POSSummaryCard({
  selectedItems,
  hasServices,
  selectedStaff,
  subTotal,
  total,
  decreaseQuantity,
  increaseQuantity,
  selectItem,
  handlePrint,
  openTimeModalOrCheckout,
  // Customer Props
  phoneInput,
  setPhoneInput,
  handleSearchCustomer,
  handlePhonePaste,
  customer,
  setCustomer,
  setShowNewCustomerForm,
  normalizePhone
}) {
  return (
    <aside className="w-full lg:w-[450px] bg-surface-container/30 backdrop-blur-md border-l border-outline-variant/50 shrink-0 flex flex-col h-[100vh] sticky top-0 z-20">
      <div className="flex flex-col p-5 md:p-6 lg:p-8 h-full overflow-hidden">
        
        {/* Customer Section at Top of Bill */}
        <div className="mb-6 shrink-0 border-b border-outline-variant/30 pb-6">
          <h2 className="font-headline-sm text-xl text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Hóa Đơn Mới
          </h2>
          
          {/* Customer Search / Display */}
          {!customer ? (
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-outline-variant">Thông tin khách hàng</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
                    phone_iphone
                  </span>
                  <input
                    className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg p-2.5 pl-9 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-all font-body-md text-sm"
                    placeholder="Nhập SĐT..."
                    type="tel"
                    value={phoneInput || ''}
                    onChange={(e) => setPhoneInput(normalizePhone(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                    onPaste={(e) => handlePhonePaste(e, setPhoneInput)}
                  />
                </div>
                <button 
                  onClick={handleSearchCustomer}
                  className="px-4 bg-primary text-on-primary rounded-lg font-bold hover:brightness-110 transition-all flex items-center justify-center shrink-0 shadow-sm"
                  title="Tìm / Thêm khách"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-high border border-primary/20 rounded-xl p-4 flex flex-col gap-2 relative">
              <button 
                onClick={() => setCustomer(null)}
                className="absolute top-3 right-3 text-outline hover:text-error transition-colors"
                title="Đổi khách hàng"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">
                    {customer.role === 'customer' ? 'workspace_premium' : 'person'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base leading-tight">{customer.name}</h4>
                  <p className="text-xs text-outline font-label-md mt-0.5">{customer.phone}</p>
                </div>
              </div>
              
              {customer.role === 'customer' && (
                <div className="mt-2 pt-2 border-t border-outline-variant/30 flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Điểm tích lũy</span>
                  <span className="text-primary font-bold">{customer.points} điểm</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4 pr-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline-variant">Dịch vụ & Sản phẩm</span>
            <span className="bg-surface-container-high px-2 py-0.5 rounded text-xs font-bold text-on-surface">{selectedItems.length}</span>
          </div>

          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant opacity-50 border-2 border-dashed border-outline-variant/30 rounded-xl">
              <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
              <p className="text-sm">Chưa có gì trong giỏ</p>
            </div>
          ) : (
            selectedItems.map(item => {
              const isProduct = item.itemType === 'product';
              return (
                <div key={item._id} className="flex justify-between items-start animate-fade-in bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 hover:border-primary/30 transition-colors group">
                  <div className="flex-1 pr-3">
                    <h4 className="font-body-md font-semibold text-on-surface text-sm leading-tight mb-1">{item.name}</h4>
                    {!isProduct && (
                      <span className="text-[9px] text-primary bg-primary/10 rounded px-1.5 py-0.5 uppercase font-bold">Dịch vụ</span>
                    )}
                    {isProduct && (
                       <div className="flex items-center gap-2 mt-1.5 bg-surface-container-highest p-0.5 rounded w-fit border border-outline-variant/30">
                          <button onClick={() => decreaseQuantity(item._id)} className="w-5 h-5 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface text-xs font-bold">-</button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item._id)} className="w-5 h-5 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface text-xs font-bold">+</button>
                       </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end">
                    <span className="font-body-md font-bold text-on-surface text-sm">
                      {item.price ? ((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN') : 0}đ
                    </span>
                    <button 
                      onClick={() => selectItem(item)}
                      className="text-[10px] text-error hover:bg-error/10 px-1.5 py-0.5 rounded uppercase tracking-tighter mt-1 opacity-0 group-hover:opacity-100 transition-all font-bold"
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
            <div className="mt-3 bg-tertiary-container/20 border border-tertiary/20 p-3 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Barber phụ trách</span>
                <span className="text-on-surface font-bold text-sm mt-0.5">{selectedStaff ? (selectedStaff.userId?.name || "Unknown Barber") : 'Chưa chọn!'}</span>
              </div>
              <span className="material-symbols-outlined text-tertiary opacity-50">content_cut</span>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl space-y-3 shrink-0 mb-4 shadow-sm">
          <div className="flex justify-between font-body-md text-on-surface-variant text-sm">
            <span>Tạm tính</span>
            <span className="font-label-md">{subTotal.toLocaleString('vi-VN')}đ</span>
          </div>

          <div className="flex justify-between font-headline-md text-2xl text-primary items-end">
            <span className="text-base text-on-surface font-bold uppercase">Tổng</span>
            <span className="font-bold tracking-tight">{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="space-y-3 shrink-0">
          <button 
            onClick={openTimeModalOrCheckout}
            disabled={selectedItems.length === 0 || !customer}
            className={`w-full py-4 rounded-xl font-label-md font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${hasServices ? 'bg-primary text-on-primary hover:brightness-110 shadow-primary/20' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-600/20'}`}
          >
            {hasServices ? 'XÁC NHẬN DỊCH VỤ' : 'THANH TOÁN NGAY'}
          </button>
          
          <button 
            onClick={handlePrint}
            disabled={selectedItems.length === 0}
            className="w-full py-3 border border-outline-variant text-on-surface-variant rounded-xl font-label-md font-bold flex items-center justify-center gap-2 hover:bg-surface-variant transition-all active:scale-[0.98] group disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">print</span>
            In tạm tính
          </button>
        </div>
      </div>
    </aside>
  );
}
