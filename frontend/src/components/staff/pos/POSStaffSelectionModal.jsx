import React from "react";
import toast from "react-hot-toast";

export default function POSStaffSelectionModal({
  show,
  onClose,
  staffList,
  selectedStaff,
  setSelectedStaff
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-surface-obsidian/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in slide-in-from-bottom-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary">content_cut</span>
          </div>
          <h2 className="font-headline-sm text-xl text-on-surface">Chỉ Định Barber</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {staffList.map(staff => {
            const isSelected = selectedStaff && (selectedStaff._id === staff._id);
            const name = staff.userId?.name || "Unknown Barber";
            const title = staff.specialties?.join(", ") || "Stylist";
            const imageUrl = staff.profileImageUrl;
            const firstChar = name.charAt(0).toUpperCase();

            return (
              <div
                key={staff._id || staff.id}
                onClick={() => {
                  setSelectedStaff(staff);
                  onClose();
                  toast.success(`Đã chọn ${name}`);
                }}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all group ${
                  isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant/20 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full overflow-hidden border transition-colors flex items-center justify-center bg-surface-container ${
                    isSelected ? 'border-primary' : 'border-outline-variant group-hover:border-primary/50'
                  }`}>
                    {imageUrl ? (
                      <img alt={name} className="w-full h-full object-cover" src={imageUrl} />
                    ) : (
                      <span className="text-primary font-bold">{firstChar}</span>
                    )}
                  </div>
                  <div>
                    <span className={`font-label-md block font-semibold transition-colors ${
                      isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                    }`}>
                      {name}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest line-clamp-1 ${
                      isSelected ? 'text-primary/70' : 'text-on-surface-variant'
                    }`}>
                      {title}
                    </span>
                  </div>
                </div>
                <span className={`material-symbols-outlined transition-colors ${
                  isSelected ? 'text-primary' : 'text-outline-variant group-hover:text-primary'
                }`}>
                  {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
