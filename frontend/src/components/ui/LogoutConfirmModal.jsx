import React from 'react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-surface-container-high border border-outline-variant rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-error text-3xl">logout</span>
          </div>
          <h3 className="font-headline-sm text-on-surface mb-2">Xác nhận đăng xuất</h3>
          <p className="font-body-md text-on-surface-variant mb-6">
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface-container hover:bg-surface-container-highest border border-outline-variant rounded text-on-surface font-label-md transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-error hover:bg-error/90 text-on-error rounded font-label-md transition-colors shadow-sm"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
