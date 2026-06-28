"use client";

import React, { useEffect, useState } from 'react';
import { adminBarberService } from '@/services/admin.service';
import AdminBarberForm from '@/components/admin/AdminBarberForm';
import AdminBarberList from '@/components/admin/AdminBarberList';
import AdminBarberSchedule from '@/components/admin/AdminBarberSchedule';
import DeactivateConfirmModal from '@/components/admin/DeactivateConfirmModal';


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
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
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
    const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
    const [upcomingCount, setUpcomingCount] = useState(0);

    const formRef = React.useRef(null);

    useEffect(() => {
        if (formOpen && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [formOpen]);

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
                setBarbers([]);
                setSelectedBarber(null);
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
        if (!selectedBarber || selectedBarber.id === 'empty') return;
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
            if (editMode && selectedBarber) {
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
        if (!selectedBarber || selectedBarber.id === 'empty') return;

        setStatusError('');
        setStatusMessage('');
        setFormError('');
        setFormMessage('');

        if (selectedBarber.status === 'active') {
            setStatusProcessing(true);
            try {
                const res = await adminBarberService.getUpcomingBookings(selectedBarber.id);
                setUpcomingCount(res.count || 0);
                setDeactivateModalOpen(true);
            } catch (error) {
                setStatusError('Lỗi khi kiểm tra lịch hẹn: ' + error.message);
            } finally {
                setStatusProcessing(false);
            }
        } else {
            setStatusProcessing(true);
            try {
                await adminBarberService.activateAdminBarber(selectedBarber.id);
                setStatusMessage('Barber đã được kích hoạt lại.');
                await loadBarbers(selectedBarber.id);
            } catch (error) {
                setStatusError(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái.');
            } finally {
                setStatusProcessing(false);
            }
        }
    };

    const handleConfirmDeactivate = async (action) => {
        setDeactivateModalOpen(false);
        setStatusProcessing(true);
        setStatusError('');
        setStatusMessage('');
        try {
            await adminBarberService.deactivateAdminBarber(selectedBarber.id, action);
            setStatusMessage('Barber đã được vô hiệu hóa.');
            await loadBarbers(selectedBarber.id);
        } catch (error) {
            setStatusError(error.message || 'Có lỗi xảy ra khi vô hiệu hoá.');
        } finally {
            setStatusProcessing(false);
        }
    };

    const filteredBarbers = barbers.filter((barber) => barber.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const displayBarbers = searchTerm.trim() ? filteredBarbers : barbers;

    useEffect(() => {
        if (searchTerm.trim() && filteredBarbers.length > 0 && !filteredBarbers.some((barber) => barber.id === selectedBarber?.id)) {
            setSelectedBarber(filteredBarbers[0]);
        }
    }, [searchTerm, filteredBarbers, selectedBarber?.id]);

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
                    <AdminBarberList
                        barbers={barbers}
                        displayBarbers={displayBarbers}
                        selectedBarber={selectedBarber}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        setSelectedBarber={setSelectedBarber}
                    />
                    <AdminBarberSchedule
                        selectedBarber={selectedBarber}
                        statusError={statusError}
                        statusMessage={statusMessage}
                        statusProcessing={statusProcessing}
                        handleOpenEdit={handleOpenEdit}
                        handleToggleStatus={handleToggleStatus}
                    />
                </div>
            )}

            {formOpen && (
                <section ref={formRef} className="rounded-3xl border border-outline-gold bg-surface-container-low p-6 shadow-2xl shadow-black/5 scroll-mt-6">
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

            <DeactivateConfirmModal
                isOpen={deactivateModalOpen}
                onClose={() => setDeactivateModalOpen(false)}
                onConfirm={handleConfirmDeactivate}
                barberName={selectedBarber?.name}
                upcomingBookingsCount={upcomingCount}
            />
        </div>
    );
}
