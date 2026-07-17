import React from 'react';

export default function GenericConfirmModal({
    isOpen,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    isDanger = true,
    isLoading = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-outline-variant animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDanger ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                            <span className="material-symbols-outlined text-3xl">
                                {isDanger ? 'warning' : 'help'}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-headline-sm text-on-surface">{title}</h3>
                        </div>
                    </div>
                    <p className="text-body-md text-on-surface-variant mb-8 pl-16">
                        {message}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-full font-label-lg font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-label-lg font-semibold text-white transition-colors shadow-sm disabled:opacity-50 ${isDanger ? 'bg-error hover:bg-error-focus' : 'bg-primary hover:bg-primary-focus'}`}
                        >
                            {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
