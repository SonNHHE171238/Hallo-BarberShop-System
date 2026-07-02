import React, { useState } from 'react';

export default function DeactivateConfirmModal({ isOpen, onClose, onConfirm, barberName, upcomingBookingsCount }) {
    const [action, setAction] = useState('cancel'); // 'cancel' or 'manual'

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Khóa tài khoản thợ cắt tóc</h3>
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
                    >
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
                    </button>
                </div>

                <div className="mb-6 space-y-4">
                    <p className="text-body-md text-on-surface">
                        Bạn đang chuẩn bị vô hiệu hóa tài khoản của <span className="font-semibold">{barberName}</span>.
                    </p>
                    
                    {upcomingBookingsCount > 0 ? (
                        <div className="rounded-2xl bg-surface-danger/10 border border-surface-danger/30 p-4">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-surface-danger mt-0.5">warning</span>
                                <div>
                                    <p className="font-semibold text-surface-danger">Cảnh báo quan trọng!</p>
                                    <p className="mt-1 text-sm text-on-surface-variant">
                                        Thợ này hiện đang có <span className="font-bold text-surface-danger">{upcomingBookingsCount} lịch hẹn</span> sắp tới chưa hoàn thành.
                                        Vui lòng chọn cách xử lý các lịch hẹn này:
                                    </p>
                                    
                                    <div className="mt-4 space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 hover:bg-surface-container transition-colors">
                                            <input 
                                                type="radio" 
                                                name="deactivateAction" 
                                                value="cancel"
                                                checked={action === 'cancel'}
                                                onChange={() => setAction('cancel')}
                                                className="mt-1"
                                            />
                                            <div>
                                                <div className="font-semibold text-on-surface text-sm">Hủy toàn bộ lịch & Thông báo</div>
                                                <div className="text-xs text-on-surface-variant mt-0.5">Tự động chuyển các lịch hẹn sang trạng thái Đã hủy và giải phóng thời gian.</div>
                                            </div>
                                        </label>
                                        
                                        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 hover:bg-surface-container transition-colors">
                                            <input 
                                                type="radio" 
                                                name="deactivateAction" 
                                                value="manual"
                                                checked={action === 'manual'}
                                                onChange={() => setAction('manual')}
                                                className="mt-1"
                                            />
                                            <div>
                                                <div className="font-semibold text-on-surface text-sm">Giữ nguyên lịch (Xử lý thủ công)</div>
                                                <div className="text-xs text-on-surface-variant mt-0.5">Tài khoản sẽ bị khóa nhưng các lịch hẹn vẫn được giữ lại để bạn tự gọi điện chuyển thợ cho khách.</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-body-sm text-on-surface-variant">
                            Thợ này không có lịch hẹn nào sắp tới. Bạn có thể an tâm khóa tài khoản.
                        </p>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-full border border-outline-variant px-6 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onConfirm(action)}
                        className="inline-flex items-center justify-center rounded-full bg-error px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-on-error hover:bg-error-focus transition-colors shadow-sm"
                    >
                        Xác nhận Khóa
                    </button>
                </div>
            </div>
        </div>
    );
}
