import React, { useState, useEffect } from 'react';
import { adminBarberService } from '@/services/admin.service';
import { fetchWithAuth } from '@/services/api';
import toast from 'react-hot-toast';

export default function BarberUpcomingBookingsModal({ isOpen, onClose, barber, onAllResolved }) {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // States for Reassignment
    const [barbers, setBarbers] = useState([]);
    const [reassigningBookingId, setReassigningBookingId] = useState(null);
    const [selectedNewBarberId, setSelectedNewBarberId] = useState('');

    const fetchBookings = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await adminBarberService.getUpcomingBookings(barber._id || barber.id);
            setBookings(res.bookings || []);
            // Automatically close and allow deletion if there are no bookings left
            if (res.bookings && res.bookings.length === 0) {
                onAllResolved();
            }
        } catch (error) {
            toast.error('Lỗi khi tải danh sách lịch hẹn: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, [barber, onAllResolved]);

    const fetchBarbers = React.useCallback(async () => {
        try {
            const res = await adminBarberService.getAllAdminBarbers();
            // Filter out the current barber being deleted and inactive ones
            const activeBarbers = res.barbers.filter(b => 
                b.barber.isAvailable !== false && 
                b.user.status === 'active' && 
                (b.barber._id || b.barber.id) !== (barber._id || barber.id) &&
                (b.user._id || b.user.id) !== (barber._id || barber.id)
            );
            setBarbers(activeBarbers);
        } catch (error) {
            console.error('Lỗi khi tải danh sách thợ cắt tóc:', error);
        }
    }, [barber]);

    useEffect(() => {
        if (isOpen && barber) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchBookings();
            fetchBarbers();
        }
    }, [isOpen, barber, fetchBookings, fetchBarbers]);

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Khách yêu cầu hủy lịch này. Bạn có chắc chắn?')) return;
        setIsProcessing(true);
        try {
            await fetchWithAuth(`/bookings/${bookingId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'cancelled', reason: 'Khách yêu cầu hủy lịch' })
            });
            toast.success('Đã hủy lịch hẹn');
            fetchBookings();
        } catch (error) {
            toast.error('Lỗi khi hủy lịch: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReassign = async (bookingId) => {
        if (!selectedNewBarberId) {
            toast.error('Vui lòng chọn một thợ cắt tóc mới.');
            return;
        }
        setIsProcessing(true);
        try {
            await fetchWithAuth(`/bookings/${bookingId}/assign-barber`, {
                method: 'PUT',
                body: JSON.stringify({ newBarberId: selectedNewBarberId })
            });
            toast.success('Đã chuyển lịch thành công');
            setReassigningBookingId(null);
            setSelectedNewBarberId('');
            fetchBookings();
        } catch (error) {
            toast.error('Lỗi khi chuyển lịch: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-outline-variant animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <div>
                        <h2 className="font-headline-md text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-warning">warning</span>
                            Lịch hẹn chưa hoàn thành
                        </h2>
                        <p className="text-body-sm text-on-surface-variant mt-1">
                            Thợ <strong>{barber.name}</strong> đang có {bookings.length} lịch hẹn sắp tới. Vui lòng xử lý (chuyển lịch hoặc hủy) trước khi xóa thợ.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-surface">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-10 text-on-surface-variant">
                            Không có lịch hẹn nào. Bạn đã có thể xóa thợ này.
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-outline-variant rounded-2xl">
                            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
                                <thead className="bg-surface-container-low">
                                    <tr className="border-b border-outline-variant text-on-surface-variant font-label-sm uppercase tracking-wider text-xs">
                                        <th className="px-4 py-3 font-semibold">Lịch hẹn (Ngày & Giờ)</th>
                                        <th className="px-4 py-3 font-semibold">Mã booking</th>
                                        <th className="px-4 py-3 font-semibold">Khách hàng</th>
                                        <th className="px-4 py-3 font-semibold">SĐT khách</th>
                                        <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/50 text-sm">
                                    {bookings.map(booking => {
                                        const bDate = new Date(booking.bookingDate);
                                        const dateStr = bDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
                                        const timeStr = bDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                        const customer = booking.customerId || {};
                                        
                                        return (
                                            <tr key={booking._id} className="hover:bg-surface-container-highest/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-on-surface">{dateStr}</div>
                                                    <div className="text-primary">{timeStr}</div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">{booking._id.substring(booking._id.length - 6).toUpperCase()}</td>
                                                <td className="px-4 py-3 font-medium">{customer.name || 'Khách vãng lai'}</td>
                                                <td className="px-4 py-3 text-on-surface-variant">{customer.phone || 'N/A'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {reassigningBookingId === booking._id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <select 
                                                                className="border border-outline-variant rounded p-1 text-sm bg-surface"
                                                                value={selectedNewBarberId}
                                                                onChange={(e) => setSelectedNewBarberId(e.target.value)}
                                                            >
                                                                <option value="">-- Chọn thợ mới --</option>
                                                                {barbers.map(b => (
                                                                    <option key={b.barber._id || b.user._id} value={b.barber._id || b.barber.id || b.user._id}>
                                                                        {b.user.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button 
                                                                onClick={() => handleReassign(booking._id)}
                                                                disabled={isProcessing || !selectedNewBarberId}
                                                                className="bg-primary text-on-primary p-1.5 rounded disabled:opacity-50"
                                                                title="Xác nhận chuyển lịch"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => setReassigningBookingId(null)}
                                                                disabled={isProcessing}
                                                                className="bg-surface-container-highest text-on-surface-variant p-1.5 rounded disabled:opacity-50"
                                                                title="Hủy thao tác"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => { setReassigningBookingId(booking._id); setSelectedNewBarberId(''); }}
                                                                disabled={isProcessing}
                                                                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-semibold text-xs transition-colors"
                                                            >
                                                                Chuyển lịch
                                                            </button>
                                                            <button 
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                                disabled={isProcessing}
                                                                className="px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded-md font-semibold text-xs transition-colors"
                                                            >
                                                                Khách hủy
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
                    {bookings.length > 0 ? (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-full font-label-lg font-semibold bg-surface-container-highest text-on-surface-variant hover:bg-outline-variant/30 transition-colors"
                        >
                            Đóng và xử lý sau
                        </button>
                    ) : (
                        <button
                            onClick={() => onAllResolved()}
                            className="px-6 py-2.5 rounded-full font-label-lg font-semibold bg-primary text-on-primary hover:bg-primary-focus transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
                        >
                            Tiếp tục Xóa Thợ
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
