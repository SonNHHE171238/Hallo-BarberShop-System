import React from 'react';
import StatusBadge from '@/components/ui/StatusBadge';

function Badge({ children, variant = 'default' }) {
    const styles = {
        default: 'bg-surface-container-high text-on-surface shadow-sm',
        active: 'bg-success text-on-success',
        inactive: 'bg-surface-danger text-on-surface',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${styles[variant] || styles.default}`}>
            {children}
        </span>
    );
}

export default function AdminBarberSchedule({
    selectedBarber,
    statusError,
    statusMessage,
    statusProcessing,
    handleOpenEdit,
    handleToggleStatus
}) {
    if (!selectedBarber) {
        return (
            <section className="rounded-3xl border border-outline-gold bg-surface-container-low p-6 shadow-2xl shadow-black/5 flex items-center justify-center min-h-[400px]">
                <p className="text-on-surface-variant">Vui lòng chọn hoặc tạo mới một thợ cắt tóc để xem chi tiết.</p>
            </section>
        );
    }

    return (
        <section className="rounded-3xl border border-outline-gold bg-surface-container-low p-6 shadow-2xl shadow-black/5 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                    <h3 className="font-headline-sm text-headline-sm">Chi tiết barber</h3>
                    <p className="text-body-sm text-on-surface-variant">Thông tin cá nhân, chuyên môn và lịch tuần.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Badge>{selectedBarber.specialties.join(', ')}</Badge>
                    <Badge>Rating {selectedBarber.rating}</Badge>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 bg-surface p-4 rounded-3xl border border-outline-gold/50">
                <div>
                    <div className="font-label-sm text-on-surface-variant">Tài khoản</div>
                    <div className="mt-1 font-semibold text-on-surface">{selectedBarber.email || 'Chưa có'}</div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleOpenEdit}
                        className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-on-secondary transition hover:bg-secondary-focus"
                    >
                        Sửa thông tin
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        disabled={statusProcessing}
                        className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition ${selectedBarber.status === 'active' ? 'bg-error text-on-error hover:bg-error-focus' : 'bg-success text-on-success hover:bg-success-focus'}`}
                    >
                        {selectedBarber.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button>
                </div>
            </div>

            {statusError ? <div className="mb-6 rounded-2xl bg-error/10 border border-error/50 px-4 py-3 text-error">{statusError}</div> : null}
            {statusMessage ? <div className="mb-6 rounded-2xl bg-success/10 border border-success/50 px-4 py-3 text-success">{statusMessage}</div> : null}

            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                <div className="rounded-3xl border border-outline-gold/50 bg-surface p-6 flex flex-col items-center text-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-surface-container-high flex items-center justify-center text-headline-lg text-primary">{selectedBarber.name.charAt(0)}</div>
                    <div>
                        <h4 className="font-semibold text-on-surface text-lg">{selectedBarber.name}</h4>
                        <p className="text-body-sm text-on-surface-variant mt-2">{selectedBarber.bio}</p>
                    </div>
                    <div className="w-full h-px bg-outline-gold/30 my-2"></div>
                    <div className="w-full text-left space-y-3">
                        <div>
                            <div className="text-label-sm text-on-surface-variant">SĐT</div>
                            <div className="font-semibold text-on-surface">{selectedBarber.phone}</div>
                        </div>
                        <div>
                            <div className="text-label-sm text-on-surface-variant">Kinh nghiệm</div>
                            <div className="font-semibold text-on-surface">{selectedBarber.experienceYears} năm</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-outline-gold/50 bg-surface p-6">
                        <h4 className="font-semibold text-on-surface mb-4">Thông tin chuyên môn</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-surface-container-high p-4 border border-outline-variant/30">
                                <div className="font-label-sm text-on-surface-variant">Trạng thái</div>
                                <div className="mt-2">
                                    <StatusBadge status={selectedBarber.status === 'active' ? 'completed' : 'cancelled'}>
                                        {selectedBarber.status}
                                    </StatusBadge>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-surface-container-high p-4 border border-outline-variant/30">
                                <div className="font-label-sm text-on-surface-variant">Rating trung bình</div>
                                <div className="mt-2 font-semibold text-on-surface flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    {selectedBarber.rating}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-outline-gold/50 bg-surface p-6">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <h4 className="font-semibold text-on-surface">Lịch tuần tới</h4>
                            <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">{selectedBarber.scheduleSummary.length} ngày</span>
                        </div>
                        
                        {selectedBarber.scheduleSummary.length === 0 ? (
                            <div className="text-center py-6 text-on-surface-variant">Chưa có dữ liệu lịch làm việc.</div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                                {selectedBarber.scheduleSummary.map((item) => (
                                    <div key={item.date} className="rounded-2xl border border-outline-variant/30 bg-surface-container-high p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <div className="font-semibold text-on-surface">{new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</div>
                                            <div className="text-[10px] text-on-surface-variant">{item.date}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <div className="text-[10px] uppercase text-on-surface-variant">Trống</div>
                                                <div className="font-semibold text-success">{item.availableSlots}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] uppercase text-on-surface-variant">Đã Đặt</div>
                                                <div className="font-semibold text-primary">{item.bookedSlots}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] uppercase text-on-surface-variant">Block</div>
                                                <div className="font-semibold text-outline">{item.blockedSlots}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
