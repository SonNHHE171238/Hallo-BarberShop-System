"use client";

import React, { useEffect, useState } from 'react';

const initialFormState = {
    name: '',
    email: '',
    phone: '',
    password: '',
    bio: '',
    experienceYears: '',
    specialties: '',
    expertiseTags: '',
    hairTypeExpertise: '',
    styleExpertise: '',
    certifications: '',
    languages: '',
    workingSince: '',
    preferredWorkingHoursStart: '09:00',
    preferredWorkingHoursEnd: '18:00',
    maxDailyBookings: '12',
    autoAssignmentEligible: true,
};

export default function AdminBarberForm({ barber, onSubmit, onCancel, isEdit = false }) {
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (barber) {
            setFormData((prev) => ({
                ...prev,
                name: barber.name || '',
                email: barber.email || '',
                phone: barber.phone || '',
                password: '',
                bio: barber.bio || '',
                experienceYears: barber.experienceYears || '',
                specialties: (barber.specialties || []).join(', '),
                expertiseTags: (barber.expertiseTags || []).join(', '),
                hairTypeExpertise: (barber.hairTypeExpertise || []).join(', '),
                styleExpertise: (barber.styleExpertise || []).join(', '),
                certifications: (barber.certifications || []).join(', '),
                languages: (barber.languages || []).join(', '),
                workingSince: barber.workingSince ? barber.workingSince.split('T')[0] : '',
                preferredWorkingHoursStart: barber.preferredWorkingHours?.start || '09:00',
                preferredWorkingHoursEnd: barber.preferredWorkingHours?.end || '18:00',
                maxDailyBookings: barber.maxDailyBookings?.toString() || '12',
                autoAssignmentEligible: barber.autoAssignmentEligible ?? true,
            }));
        }
    }, [barber]);

    const validate = () => {
        const nextErrors = {};

        if (!isEdit) {
            if (!formData.name.trim()) nextErrors.name = 'Tên là bắt buộc.';
            if (!formData.email.trim()) nextErrors.email = 'Email là bắt buộc.';
            if (!formData.phone.trim()) nextErrors.phone = 'Số điện thoại là bắt buộc.';
            if (!formData.bio.trim()) nextErrors.bio = 'Bio là bắt buộc.';
            if (!formData.experienceYears || Number(formData.experienceYears) <= 0) nextErrors.experienceYears = 'Số năm kinh nghiệm phải lớn hơn 0.';
            if (!formData.password.trim()) nextErrors.password = 'Mật khẩu là bắt buộc khi tạo mới.';
        }

        if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
            nextErrors.email = 'Email không hợp lệ.';
        }

        if (formData.maxDailyBookings && Number(formData.maxDailyBookings) <= 0) {
            nextErrors.maxDailyBookings = 'Số lượt đặt tối đa mỗi ngày phải lớn hơn 0.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        const nextValue = type === 'checkbox' ? checked : value;
        setFormData((prev) => ({ ...prev, [name]: nextValue }));
    };

    const normalizeList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const basePayload = {
            specialties: normalizeList(formData.specialties),
            expertiseTags: normalizeList(formData.expertiseTags),
            hairTypeExpertise: normalizeList(formData.hairTypeExpertise),
            styleExpertise: normalizeList(formData.styleExpertise),
            certifications: normalizeList(formData.certifications),
            languages: normalizeList(formData.languages),
            workingSince: formData.workingSince || undefined,
            preferredWorkingHours: {
                start: formData.preferredWorkingHoursStart,
                end: formData.preferredWorkingHoursEnd,
            },
            maxDailyBookings: Number(formData.maxDailyBookings) || undefined,
            autoAssignmentEligible: formData.autoAssignmentEligible,
        };

        const payload = isEdit
            ? basePayload
            : {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  password: formData.password,
                  bio: formData.bio,
                  experienceYears: Number(formData.experienceYears),
                  ...basePayload,
              };

        onSubmit(payload);
    };

    const renderInput = ({ label, name, type = 'text', required = false, help }) => (
        <div className="space-y-2">
            <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">{label}</label>
            <input
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                className="w-full bg-surface-container-low border border-outline-variant py-3 px-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded outline-none"
            />
            {help && <p className="text-label-sm text-on-surface-variant">{help}</p>}
            {errors[name] && <p className="text-error text-sm mt-1">{errors[name]}</p>}
        </div>
    );

    const renderCheckbox = ({ label, name, help }) => (
        <div className="flex items-start gap-3 rounded-3xl border border-outline-variant bg-surface-container-high p-4">
            <input id={name} name={name} type="checkbox" checked={formData[name]} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
            <div>
                <label htmlFor={name} className="block text-label-md font-label-md text-on-surface">{label}</label>
                {help && <p className="text-label-sm text-on-surface-variant mt-1">{help}</p>}
            </div>
        </div>
    );

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {!isEdit && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {renderInput({ label: 'Tên barber', name: 'name', required: true })}
                    {renderInput({ label: 'Email', name: 'email', type: 'email', required: true })}
                    {renderInput({ label: 'Số điện thoại', name: 'phone', required: true })}
                    {renderInput({ label: 'Mật khẩu', name: 'password', type: 'password', required: true })}
                    {renderInput({ label: 'Năm kinh nghiệm', name: 'experienceYears', type: 'number', required: true })}
                    {renderInput({ label: 'Bio', name: 'bio', help: 'Mô tả ngắn về phong cách và cá tính barber.' })}
                </div>
            )}

            <div className="rounded-3xl border border-outline-gold bg-surface-container-low p-6">
                <div className="mb-5">
                    <h3 className="font-headline-sm text-headline-sm">Chỉnh sửa kỹ năng và hồ sơ nghề nghiệp</h3>
                    <p className="text-body-sm text-on-surface-variant mt-1">Chỉ cập nhật các trường kỹ năng, lịch làm việc, chứng chỉ và ngôn ngữ.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {renderInput({ label: 'Chuyên môn', name: 'specialties', help: 'VD: cắt tóc, uốn, nhuộm' })}
                    {renderInput({ label: 'Kỹ năng chuyên sâu', name: 'expertiseTags', help: 'VD: fade, beard, barber styling' })}
                    {renderInput({ label: 'Loại tóc chuyên xử lý', name: 'hairTypeExpertise', help: 'VD: thẳng, xoăn, dày' })}
                    {renderInput({ label: 'Phong cách ưa thích', name: 'styleExpertise', help: 'VD: ngắn, trung, dài, cổ điển' })}
                    {renderInput({ label: 'Chứng chỉ', name: 'certifications', help: 'VD: BarberPro, Saç designer' })}
                    {renderInput({ label: 'Ngôn ngữ', name: 'languages', help: 'VD: Vietnamese, English' })}
                </div>
            </div>

            <div className="rounded-3xl border border-outline-gold bg-surface-container-low p-6">
                <div className="mb-5">
                    <h3 className="font-headline-sm text-headline-sm">Lịch làm việc</h3>
                    <p className="text-body-sm text-on-surface-variant mt-1">Cập nhật giờ làm việc và giới hạn đặt lịch mỗi ngày.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {renderInput({ label: 'Bắt đầu', name: 'preferredWorkingHoursStart', type: 'time' })}
                    {renderInput({ label: 'Kết thúc', name: 'preferredWorkingHoursEnd', type: 'time' })}
                    {renderInput({ label: 'Số lượt đặt tối đa/ngày', name: 'maxDailyBookings', type: 'number', help: 'Để trống nếu không muốn giới hạn.' })}
                    {renderCheckbox({ label: 'Tự động phân công', name: 'autoAssignmentEligible', help: 'Cho phép hệ thống tự động phân công lịch cho barber này.' })}
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
                <div className="flex flex-wrap gap-3">
                    <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-semibold uppercase tracking-[0.15em] hover:bg-primary-focus transition" type="submit">
                        {isEdit ? 'Cập nhật barber' : 'Tạo barber'}
                    </button>
                    <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-full font-semibold uppercase tracking-[0.15em] hover:bg-surface transition" type="button" onClick={onCancel}>
                        Hủy
                    </button>
                </div>
                {isEdit && <p className="text-body-sm text-on-surface-variant">Chỉ lưu các trường kỹ năng, lịch làm việc, chứng chỉ và ngôn ngữ.</p>}
            </div>
        </form>
    );
}
