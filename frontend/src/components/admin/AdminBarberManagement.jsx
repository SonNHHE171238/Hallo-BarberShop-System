"use client";

import React, { useEffect, useState } from 'react';
import { adminBarberService } from '@/services/admin.service';
import AdminBarberForm from '@/components/admin/AdminBarberForm';

const initialBarber = {
    id: 'empty',
    name: 'Không có barber',
    email: '',
    phone: '',
    avatarUrl: '',
    bio: '',
    specialties: [],
    expertiseTags: [],
    hairTypeExpertise: [],
    styleExpertise: [],
    certifications: [],
    languages: [],
    workingSince: '',
    experienceYears: '',
    rating: 0,
    status: 'inactive',
    scheduleSummary: [],
};

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

export default function AdminBarberManagement() {
    const [barbers, setBarbers] = useState([initialBarber]);
    const [selectedBarber, setSelectedBarber] = useState(initialBarber);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formError, setFormError] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [statusError, setStatusError] = useState('');
    const [statusProcessing, setStatusProcessing] = useState(false);

    const loadBarbers = async (selectedId) => {
        try {
            setError('');
            const result = await adminBarberService.getAllAdminBarbers();
            const mappedBarbers = (result.barbers || []).map((item) => ({
                id: item.barber._id || item.barber.id || 'unknown',
                name: item.user?.name || item.barber?.name || 'Không tên',
                email: item.user?.email || '',
                phone: item.user?.phone || '',
                avatarUrl: item.user?.avatarUrl || item.barber?.profileImageUrl || '',
                bio: item.barber?.bio || '',
                specialties: item.barber?.specialties || [],
                expertiseTags: item.barber?.expertiseTags || [],
                hairTypeExpertise: item.barber?.hairTypeExpertise || [],
                styleExpertise: item.barber?.styleExpertise || [],
                certifications: item.barber?.certifications || [],
                languages: item.barber?.languages || [],
                workingSince: item.barber?.workingSince ? new Date(item.barber.workingSince).toISOString().split('T')[0] : '',
                preferredWorkingHours: item.barber?.preferredWorkingHours || { start: '09:00', end: '18:00' },
                maxDailyBookings: item.barber?.maxDailyBookings || 12,
                autoAssignmentEligible: item.barber?.autoAssignmentEligible ?? true,
                experienceYears: item.barber?.experienceYears || '',
                rating: item.barber?.averageRating || item.barber?.rating || 0,
                status: item.user?.status || item.barber?.status || 'inactive',
                scheduleSummary: item.scheduleSummary || [],
            }));

            if (mappedBarbers.length > 0) {
                setBarbers(mappedBarbers);
                const selected = mappedBarbers.find((barber) => barber.id === selectedId) || mappedBarbers[0];
                setSelectedBarber(selected);
            } else {
                setBarbers([initialBarber]);
                setSelectedBarber(initialBarber);
            }
        } catch (fetchError) {
            setError(fetchError.message || 'Không thể tải danh sách barber.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        loadBarbers();
    }, []);

    const handleOpenCreate = () => {
        setEditMode(false);
        setFormError('');
        setFormMessage('');
        setFormOpen(true);
    };

    const handleOpenEdit = () => {
        if (selectedBarber.id === 'empty') return;
        setEditMode(true);
        setFormError('');
        setFormMessage('');
        setFormOpen(true);
    };

    const handleCancelForm = () => {
        setFormError('');
        setFormMessage('');
        setFormOpen(false);
    };

    const handleFormSubmit = async (payload) => {
        setProcessing(true);
        setFormError('');
        setFormMessage('');
        setStatusMessage('');
        setStatusError('');

        try {
            if (editMode) {
                await adminBarberService.updateAdminBarber(selectedBarber.id, payload);
                setFormMessage('Cập nhật barber thành công.');
                await loadBarbers(selectedBarber.id);
            } else {
                await adminBarberService.createAdminBarber(payload);
                setFormMessage('Tạo barber mới thành công.');
                await loadBarbers();
            }
            setFormOpen(false);
        } catch (submitError) {
            setFormError(submitError.message || 'Có lỗi xảy ra khi lưu barber.');
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleStatus = async () => {
        if (selectedBarber.id === 'empty') return;

        setStatusProcessing(true);
        setStatusError('');
        setStatusMessage('');
        setFormError('');
        setFormMessage('');

        try {
            if (selectedBarber.status === 'active') {
                await adminBarberService.deactivateAdminBarber(selectedBarber.id);
                setStatusMessage('Barber đã được vô hiệu hóa.');
            } else {
                await adminBarberService.activateAdminBarber(selectedBarber.id);
                setStatusMessage('Barber đã được kích hoạt lại.');
            }
            await loadBarbers(selectedBarber.id);
        } catch (toggleError) {
            setStatusError(toggleError.message || 'Có lỗi xảy ra khi cập nhật trạng thái.');
        } finally {
            setStatusProcessing(false);
        }
    };

    const filteredBarbers = barbers.filter((barber) => barber.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const displayBarbers = searchTerm.trim() ? filteredBarbers : barbers.length ? barbers : [initialBarber];

    useEffect(() => {
        if (searchTerm.trim() && filteredBarbers.length > 0 && !filteredBarbers.some((barber) => barber.id === selectedBarber.id)) {
            setSelectedBarber(filteredBarbers[0]);
        }
    }, [searchTerm, filteredBarbers, selectedBarber.id]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Quản lý hồ sơ thợ</h2>
                    <p className="mt-2 max-w-2xl text-body-sm text-on-surface-variant">Tạo mới, chỉnh sửa và quản lý tài khoản barber do admin tạo.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={handleOpenCreate} className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-on-primary transition hover:bg-primary-focus">Tạo barber mới</button>
                </div>
            </div>

            {loading ? (
                <div className="rounded-3xl border border-outline-gold bg-surface-container-low p-8 text-center text-body-md text-on-surface-variant">Đang tải danh sách barber...</div>
            ) : error ? (
                <div className="rounded-3xl border border-outline-gold bg-surface-container-low p-8 text-center text-body-md text-surface-danger">{error}</div>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                    <section className="rounded-3xl border border-outline-gold bg-surface-container-low p-5 shadow-2xl shadow-black/5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="font-headline-sm text-headline-sm">Danh sách barber</h3>
                                <p className="text-body-sm text-on-surface-variant">Chọn barber để xem chi tiết hồ sơ và lịch.</p>
                            </div>
                            <span className="text-label-sm text-on-surface-variant">{filteredBarbers.length} thợ</span>
                        </div>
                        <div className="mb-4">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm theo tên barber..."
                                className="w-full rounded-3xl border border-outline-gold bg-surface-container-high px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                        <div className="space-y-3">
                            {displayBarbers.map((barber) => (
                                <button
                                    key={barber.id}
                                    onClick={() => setSelectedBarber(barber)}
                                    className={`w-full rounded-3xl border p-4 text-left transition ${selectedBarber.id === barber.id ? 'border-primary bg-surface' : 'border-outline-gold bg-surface-container-high hover:border-primary hover:bg-surface'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-surface-container-high flex items-center justify-center text-headline-sm text-primary">{barber.name.charAt(0)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-semibold text-on-surface">{barber.name}</h4>
                                                <Badge variant={barber.status === 'active' ? 'active' : 'inactive'}>{barber.status}</Badge>
                                            </div>
                                            <p className="text-body-sm text-on-surface-variant">{barber.email}</p>
                                            <p className="text-body-sm text-on-surface-variant">{barber.phone}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-outline-gold bg-surface-container-low p-6 shadow-2xl shadow-black/5">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h3 className="font-headline-sm text-headline-sm">Chi tiết barber</h3>
                                <p className="text-body-sm text-on-surface-variant">Thông tin cá nhân, chuyên môn và lịch tuần.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Badge>{selectedBarber.specialties.join(', ')}</Badge>
                                <Badge>Rating {selectedBarber.rating}</Badge>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                            <div className="rounded-3xl border border-outline-gold bg-surface p-4 mt-4">
                                <div className="font-label-sm text-on-surface-variant">Tài khoản</div>
                                <div className="mt-2 font-semibold text-on-surface">{selectedBarber.email || 'Chưa có'}</div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleOpenEdit}
                                    className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-on-secondary transition hover:bg-secondary-focus"
                                >
                                    Sửa thông tin
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleStatus}
                                    disabled={selectedBarber.id === 'empty' || statusProcessing}
                                    className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${selectedBarber.status === 'active' ? 'bg-error text-on-error hover:bg-error-focus' : 'bg-success text-on-success hover:bg-success-focus'}`}
                                >
                                    {selectedBarber.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                </button>
                            </div>
                        </div>
                        {statusError ? <div className="mb-4 rounded-2xl bg-error/10 border border-error/50 px-4 py-3 text-error">{statusError}</div> : null}
                        {statusMessage ? <div className="mb-4 rounded-2xl bg-success/10 border border-success/50 px-4 py-3 text-success">{statusMessage}</div> : null}

                        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
                            <div className="rounded-3xl border border-outline-gold bg-surface p-5">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="h-24 w-24 rounded-full bg-surface-container-high flex items-center justify-center text-headline-lg text-primary">{selectedBarber.name.charAt(0)}</div>
                                    <div>
                                        <h4 className="font-semibold text-on-surface">{selectedBarber.name}</h4>
                                        <p className="text-body-sm text-on-surface-variant">{selectedBarber.bio}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-label-sm text-on-surface-variant">SĐT</div>
                                        <div className="font-semibold text-on-surface">{selectedBarber.phone}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-3xl border border-outline-gold bg-surface p-5">
                                    <h4 className="font-semibold text-on-surface mb-4">Thông tin chi tiết</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-3xl bg-surface-container-high p-4">
                                            <div className="font-label-sm text-on-surface-variant">Email</div>
                                            <div className="mt-2 font-semibold text-on-surface">{selectedBarber.email}</div>
                                        </div>
                                        <div className="rounded-3xl bg-surface-container-high p-4">
                                            <div className="font-label-sm text-on-surface-variant">Trạng thái</div>
                                            <div className="mt-2 font-semibold text-on-surface">{selectedBarber.status}</div>
                                        </div>
                                        <div className="rounded-3xl bg-surface-container-high p-4">
                                            <div className="font-label-sm text-on-surface-variant">Chuyên môn</div>
                                            <div className="mt-2 font-semibold text-on-surface">{selectedBarber.specialties.join(', ')}</div>
                                        </div>
                                        <div className="rounded-3xl bg-surface-container-high p-4">
                                            <div className="font-label-sm text-on-surface-variant">Rating trung bình</div>
                                            <div className="mt-2 font-semibold text-on-surface">{selectedBarber.rating}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-outline-gold bg-surface p-5">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <h4 className="font-semibold text-on-surface">Lịch tuần tới</h4>
                                        <Badge>{selectedBarber.scheduleSummary.length} ngày</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedBarber.scheduleSummary.map((item) => (
                                            <div key={item.date} className="rounded-3xl bg-surface-container-high p-4 flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="font-semibold text-on-surface">{item.date}</div>
                                                    <div className="text-body-sm text-on-surface-variant">Trống: {item.availableSlots} — Đã đặt: {item.bookedSlots}</div>
                                                </div>
                                                <div className="text-body-sm text-on-surface-variant">Blocked: {item.blockedSlots}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {formOpen && (
                <section className="rounded-3xl border border-outline-gold bg-surface-container-low p-6 shadow-2xl shadow-black/5">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-headline-sm text-headline-sm">{editMode ? 'Sửa barber' : 'Tạo barber mới'}</h3>
                            <p className="text-body-sm text-on-surface-variant">{editMode ? 'Cập nhật thông tin và tài khoản barber hiện tại.' : 'Admin tạo mới tài khoản barber và hồ sơ làm việc.'}</p>
                        </div>
                        {processing && <span className="font-medium text-on-surface-variant">Đang xử lý...</span>}
                    </div>
                    {formError ? <div className="mb-5 rounded-2xl bg-error/10 border border-error/50 px-4 py-3 text-error">{formError}</div> : null}
                    {formMessage ? <div className="mb-5 rounded-2xl bg-success/10 border border-success/50 px-4 py-3 text-success">{formMessage}</div> : null}
                    <AdminBarberForm
                        barber={editMode ? selectedBarber : null}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancelForm}
                        isEdit={editMode}
                    />
                </section>
            )}
        </div>
    );
}
