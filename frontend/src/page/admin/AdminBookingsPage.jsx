"use client";

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/services/api';

const fetcher = (url) => fetchWithAuth(url);

export default function AdminBookingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    
    const pageStr = searchParams.get('page');
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = 10;

    // Fetch all bookings for admin
    const { data: response, error, isLoading } = useSWR(
        '/bookings/all?limit=10000', 
        fetcher,
        { refreshInterval: 30000 } // Auto refresh every 30s as discussed
    );

    const allBookings = response?.bookings || [];

    // Filter logic
    const filteredBookings = useMemo(() => {
        return allBookings.filter(booking => {
            // Search by customer name or phone
            const searchLower = searchTerm.toLowerCase();
            const customerName = (booking.customerName || booking.customerId?.name || booking.user?.name || '').toLowerCase();
            const customerPhone = (booking.customerPhone || booking.customerId?.phone || booking.user?.phone || '').toLowerCase();
            
            const matchSearch = searchTerm === '' || 
                customerName.includes(searchLower) || 
                customerPhone.includes(searchLower) ||
                (booking._id && booking._id.slice(-6).toLowerCase().includes(searchLower));

            // Status filter
            const matchStatus = statusFilter === 'all' || booking.status === statusFilter;

            // Date filter (assuming booking.bookingDate is ISO string)
            const matchDate = dateFilter === '' || 
                (booking.bookingDate && booking.bookingDate.startsWith(dateFilter));

            return matchSearch && matchStatus && matchDate;
        }).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    }, [allBookings, searchTerm, statusFilter, dateFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredBookings.length / limit) || 1;
    const currentBookings = filteredBookings.slice((page - 1) * limit, page * limit);

    const setPageUrl = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageUrl(newPage);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/30';
            case 'confirmed': return 'bg-primary/20 text-primary border border-primary/30';
            case 'completed': return 'bg-[#4caf50]/20 text-[#4caf50] border border-[#4caf50]/30';
            case 'cancelled': return 'bg-error/20 text-error border border-error/30';
            default: return 'bg-surface-variant/50 text-on-surface-variant border border-outline-variant/50';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="w-full max-w-[1300px] mx-auto flex flex-col h-[calc(100vh-160px)]">
            {/* Thêm lịch hẹn bị xóa */}

            {/* Filters & Search Bar */}
            <div className="flex-none glass-panel bg-surface-container-low/60 rounded-xl border border-outline-gold p-3 mb-4 flex flex-col xl:flex-row gap-3 items-center justify-between">
                <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full md:max-w-md">
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant rounded-lg py-1.5 pl-9 pr-3 text-sm font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                            placeholder="Mã đơn, Tên khách, SĐT..." 
                        />
                    </div>
                    
                    {/* Right Side Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {/* Status Dropdown */}
                        <div className="relative w-full sm:w-56">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">filter_list</span>
                            <select 
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPageUrl(1);
                                }}
                                className="w-full bg-surface-container border border-outline-variant rounded-lg py-1.5 pl-9 pr-7 text-sm font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Đang chờ</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
                        </div>

                        {/* Date Picker */}
                        <div className="relative w-full sm:w-40">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_month</span>
                            <input 
                                type="date"
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    setPageUrl(1);
                                }}
                                className="w-full bg-surface-container border border-outline-variant rounded-lg py-1.5 pl-9 pr-3 text-sm font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors [color-scheme:dark]" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 glass-panel bg-surface-container-low/60 rounded-xl border border-outline-gold overflow-hidden mb-4 min-h-0 flex flex-col">
                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full min-w-[1000px] text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-outline-gold bg-surface-container-high text-xs shadow-sm">
                                <th className="px-3 py-2.5 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Mã đơn</th>
                                <th className="px-3 py-2.5 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Khách hàng</th>
                                <th className="px-3 py-2.5 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Barber</th>
                                <th className="px-3 py-2.5 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Thời gian</th>
                                <th className="px-3 py-2.5 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                                <th className="px-3 py-2.5 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-right">Thành tiền</th>
                                <th className="px-3 py-2.5 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-body-md font-body-md text-on-surface divide-y divide-outline-gold/30">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="px-3 py-6 text-center text-on-surface-variant">
                                        <div className="flex justify-center items-center gap-3">
                                            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="px-3 py-6 text-center text-error">
                                        Lỗi tải dữ liệu. Vui lòng thử lại sau.
                                    </td>
                                </tr>
                            ) : currentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-3 py-6 text-center text-on-surface-variant">
                                        Không tìm thấy lịch hẹn nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                currentBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-surface-variant/30 transition-colors">
                                        <td className="px-3 py-2.5 text-primary font-label-md text-[13px]">
                                            #{booking._id ? booking._id.slice(-6).toUpperCase() : 'UNKNOWN'}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="font-medium text-on-surface text-[14px]">
                                                {booking.customerName || booking.customerId?.name || 'Khách Vãng Lai'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30">
                                                    {booking.barberId?.profileImageUrl ? (
                                                        <img src={booking.barberId.profileImageUrl} alt="Barber" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-primary">
                                                            {(booking.barberId?.userId?.name || booking.barberId?.name || 'V').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-on-surface text-[14px]">{booking.barberId?.userId?.name || booking.barberId?.name || 'Thợ bất kỳ'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium text-on-surface text-[14px]">
                                                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </span>
                                                <span className="text-on-surface-variant text-[12px] whitespace-nowrap">
                                                    {formatDate(booking.bookingDate)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(booking.status)}`}>
                                                {booking.status === 'pending' ? 'Đang chờ' :
                                                 booking.status === 'confirmed' ? 'Đã xác nhận' :
                                                 booking.status === 'completed' ? 'Hoàn thành' :
                                                 booking.status === 'cancelled' ? 'Đã hủy' : booking.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-medium text-primary text-[14px]">
                                            {formatCurrency(booking.services && booking.services.length > 0 ? booking.services.reduce((sum, s) => sum + (s.price || 0), 0) : (booking.serviceId?.price || booking.totalPrice || 0))}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-center gap-1">
                                                <button 
                                                    className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-variant" 
                                                    title="Chi tiết"
                                                    onClick={() => router.push(`/admin/bookings/detail?id=${booking._id}`)}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                </button>
                                                <button 
                                                    className={`p-1.5 transition-colors rounded ${booking.status === 'completed' || booking.status === 'cancelled' ? 'text-outline-variant cursor-not-allowed' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'}`}
                                                    title="Cập nhật"
                                                    disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!isLoading && filteredBookings.length > 0 && (
                <div className="flex-none flex items-center justify-between pt-2">
                    <p className="text-on-surface-variant text-sm font-body-md">
                        Hiển thị <span className="font-medium text-on-surface">{(page - 1) * limit + 1}</span> đến <span className="font-medium text-on-surface">{Math.min(page * limit, filteredBookings.length)}</span> trong số <span className="font-medium text-on-surface">{filteredBookings.length}</span> lịch hẹn
                    </p>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="p-1 border border-outline-variant rounded text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            // Basic pagination logic (show current, prev, next, first, last)
                            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                return (
                                    <button 
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${page === p ? 'border border-primary bg-primary/10 text-primary font-medium' : 'border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            } else if (p === page - 2 || p === page + 2) {
                                return <span key={p} className="text-on-surface-variant px-1 text-xs">...</span>;
                            }
                            return null;
                        })}

                        <button 
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="p-1 border border-outline-variant rounded text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
