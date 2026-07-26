import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice, formatDateTime } from '@/utils/formatters';

export default function CustomerHistoryModal({ isOpen, onClose, customer }) {
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all'); // all, completed, cancelled

    useEffect(() => {
        if (isOpen && customer) {
            fetchHistory();
        }
    }, [isOpen, customer]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const phone = customer.phone || '0000000000'; // fallback
            
            const [bookingsRes, ordersRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/bookings/lookup/${phone}`, { withCredentials: true }).catch(() => ({ data: { data: [] } })),
                axios.get(`http://localhost:5000/api/orders/lookup/${phone}`, { withCredentials: true }).catch(() => ({ data: { data: [] } }))
            ]);

            setBookings(bookingsRes.data?.data || []);
            setOrders(ordersRes.data?.data || []);
        } catch (error) {
            console.error("Lỗi lấy lịch sử", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Tính tổng chi tiêu (chỉ tính completed)
    const totalSpentBookings = bookings.filter(b => b.status === 'completed' || b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalSpentOrders = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalSpent = totalSpentBookings + totalSpentOrders;

    const now = new Date();
    const validBookings = bookings.filter(b => {
        if (b.status === 'completed') return true;
        if (b.status === 'pending' || b.status === 'confirmed') {
            const bDate = new Date(b.bookingDate);
            return bDate > now;
        }
        return false;
    });

    const validOrders = orders.filter(o => {
        return o.status === 'completed' || o.status === 'pending' || o.status === 'processing' || o.status === 'shipped';
    });

    const filteredBookings = bookings.filter(b => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'completed') return b.status === 'completed';
        if (statusFilter === 'cancelled') return b.status === 'cancelled' || b.status === 'no-show';
        return true;
    });

    const filteredOrders = orders.filter(o => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'completed') return o.status === 'completed';
        if (statusFilter === 'cancelled') return o.status === 'cancelled' || o.status === 'failed';
        return true;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-container rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up border border-outline-variant shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-low shrink-0">
                    <div>
                        <h2 className="text-title-lg font-bold text-on-surface">Chi tiết Khách hàng</h2>
                        <p className="text-body-sm text-on-surface-variant mt-1">
                            {customer?.name} • {customer?.phone} • {customer?.loyaltyPoints} điểm Loyalty
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar bg-surface flex flex-col gap-4">
                    {/* Tổng quan */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                            <span className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-on-surface-variant">Tổng chi tiêu</span>
                            <span className="text-headline-md md:text-title-lg font-bold text-primary">{formatPrice(totalSpent)}</span>
                        </div>
                        <div className="h-px md:h-10 w-full md:w-px bg-outline-variant"></div>
                        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                            <span className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-on-surface-variant">Lịch hẹn</span>
                            <span className="text-title-lg font-bold text-on-surface">{validBookings.length} lần</span>
                        </div>
                        <div className="h-px md:h-10 w-full md:w-px bg-outline-variant"></div>
                        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                            <span className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-on-surface-variant">Đơn hàng</span>
                            <span className="text-title-lg font-bold text-on-surface">{validOrders.length} đơn</span>
                        </div>
                    </div>

                    {/* Bộ lọc */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-on-surface-variant mr-2">Lọc trạng thái:</span>
                        {['all', 'completed', 'cancelled'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors border ${
                                    statusFilter === filter 
                                    ? 'bg-primary text-on-primary border-primary' 
                                    : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-variant'
                                }`}
                            >
                                {filter === 'all' ? 'Tất cả' : filter === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
                            </button>
                        ))}
                    </div>

                    {/* Lịch sử */}
                    {loading ? (
                        <div className="py-12 flex justify-center text-on-surface-variant animate-pulse">
                            Đang tải dữ liệu...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cột 1: Bookings */}
                            <div className="bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-3 bg-surface-container-high border-b border-outline-variant font-bold text-on-surface sticky top-0 text-sm flex justify-between">
                                    <span>Lịch hẹn</span>
                                    <span className="bg-primary/10 text-primary px-2 rounded-full text-xs">{filteredBookings.length}</span>
                                </div>
                                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                    {filteredBookings.length === 0 ? (
                                        <div className="text-on-surface-variant text-center py-4 text-sm">Chưa có lịch sử.</div>
                                    ) : (
                                        filteredBookings.map(b => (
                                            <div key={b._id} className="bg-surface border border-outline-variant p-2.5 rounded-lg flex flex-col gap-1.5">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-sm text-on-surface">{formatDateTime(b.bookingDate)}</span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${b.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-surface-variant text-on-surface-variant'}`}>{b.status}</span>
                                                </div>
                                                <div className="text-xs text-on-surface-variant">
                                                    {b.services?.map(s => s.name).join(', ')}
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-on-surface-variant">Thợ: {b.barberId?.userId?.name || 'N/A'}</span>
                                                    <span className="font-bold text-primary">{formatPrice(b.totalPrice)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Cột 2: Orders */}
                            <div className="bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-3 bg-surface-container-high border-b border-outline-variant font-bold text-on-surface sticky top-0 text-sm flex justify-between">
                                    <span>Mua hàng</span>
                                    <span className="bg-primary/10 text-primary px-2 rounded-full text-xs">{filteredOrders.length}</span>
                                </div>
                                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                    {filteredOrders.length === 0 ? (
                                        <div className="text-on-surface-variant text-center py-4 text-sm">Chưa có lịch sử.</div>
                                    ) : (
                                        filteredOrders.map(o => (
                                            <div key={o._id} className="bg-surface border border-outline-variant p-2.5 rounded-lg flex flex-col gap-1.5">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-sm text-on-surface">{formatDateTime(o.createdAt)}</span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${o.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-surface-variant text-on-surface-variant'}`}>{o.status}</span>
                                                </div>
                                                <div className="text-xs text-on-surface-variant">
                                                    {o.items?.length || 0} sản phẩm
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs font-bold uppercase text-outline">{o.paymentMethod === 'cash' ? 'Tiền mặt' : o.paymentMethod}</span>
                                                    <span className="font-bold text-primary">{formatPrice(o.totalAmount)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
