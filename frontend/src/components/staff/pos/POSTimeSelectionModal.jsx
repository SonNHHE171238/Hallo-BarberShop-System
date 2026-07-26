import React from "react";
import DateTimeSelection from "@/components/booking/DateTimeSelection";

export default function POSTimeSelectionModal({
  show,
  onClose,
  selectedStaff,
  selectedServices,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  isSubmitting,
  handleProcessBoth
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface border border-outline-variant/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        
        <h2 className="font-headline-md text-2xl text-primary mb-6">Chọn Giờ Cắt</h2>
        
        <div className="mb-8">
          <DateTimeSelection 
            selectedBarber={selectedStaff}
            selectedServices={selectedServices}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
        </div>

        <div className="flex justify-end gap-4 border-t border-outline-variant/20 pt-6 mt-8">
          <button 
            onClick={onClose}
            className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-lg font-label-md hover:bg-surface-variant transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={() => handleProcessBoth(false)}
            disabled={isSubmitting || !selectedDate || !selectedTime}
            className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md font-bold hover:brightness-110 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            )}
            CHỐT ĐƠN KHÁCH HÀNG
          </button>
        </div>
      </div>
    </div>
  );
}
