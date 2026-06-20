import React from 'react';

export default function POSBookingSummary({ selectedServices, selectedStaff, onConfirm, onPrint }) {
  const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <aside className="w-full md:w-[400px] bg-surface-container flex flex-col shadow-2xl relative z-10">
      <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6 border-b border-outline-variant pb-4">Booking Summary</h2>
        
        {/* Summary List */}
        <div className="space-y-6 mb-8">
          {selectedServices.length === 0 ? (
            <p className="text-on-surface-variant font-body-md italic text-center py-4">No services selected.</p>
          ) : (
            selectedServices.map(service => (
              <div key={service.id} className="flex justify-between items-start">
                <div>
                  <h4 className="font-headline-sm text-on-surface">{service.name}</h4>
                  <p className="font-label-md text-on-surface-variant text-xs">
                    Staff: {selectedStaff ? selectedStaff.name : 'Unassigned'}
                  </p>
                </div>
                <span className="font-headline-sm text-on-surface">{service.price.toLocaleString('vi-VN')}đ</span>
              </div>
            ))
          )}
        </div>
        
        {/* Totals */}
        <div className="border-t border-outline-variant pt-6 space-y-3">
          <div className="flex justify-between font-headline-md text-headline-md text-primary pt-4">
            <span>Total Amount</span>
            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
      
      {/* Actions Footer */}
      <div className="p-8 bg-surface-container-high border-t border-outline-variant space-y-4">
        <button 
          onClick={onPrint}
          disabled={selectedServices.length === 0}
          className="w-full py-4 border-2 border-gold-dim text-gold-dim rounded font-headline-sm flex items-center justify-center gap-2 hover:bg-gold-dim/10 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 group"
        >
          <span className="material-symbols-outlined group-hover:animate-bounce">print</span>
          In Hóa Đơn
        </button>
        <button 
          onClick={onConfirm}
          disabled={selectedServices.length === 0 || !selectedStaff}
          className="w-full py-4 bg-primary text-on-primary rounded font-headline-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          <span className="material-symbols-outlined">check_circle</span>
          Xác nhận đặt lịch
        </button>
      </div>
    </aside>
  );
}
