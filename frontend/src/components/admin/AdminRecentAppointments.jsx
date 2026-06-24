import React from 'react';
import useSWR from 'swr';
import { adminDashboardService } from '@/services/admin.service';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

export default function AdminRecentAppointments() {
  const { data: response, isLoading } = useSWR('/api/bookings/admin/recent', async () => {
    return adminDashboardService.getRecentAppointments();
  }, { revalidateOnFocus: true });

  const bookings = response?.bookings || [];

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <section className="bg-surface-container-low border border-outline-gold rounded flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 md:px-8 py-6 bg-surface-container-lowest border-b border-outline-gold/30">
        <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Lịch Hẹn Gần Đây</h2>
        <Link href="/admin/appointments" className="font-label-md text-[11px] text-primary hover:text-on-surface transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
          Xem tất cả lịch sử
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
      <div className="overflow-x-auto w-full no-scrollbar min-h-[200px]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-high/30">
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Khách Hàng</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Dịch Vụ</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Thợ Cắt</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Thời Gian</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30 text-right">Thành Tiền</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="text-on-surface font-body-md text-[14px]">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-on-surface-variant animate-pulse">Đang tải dữ liệu...</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-on-surface-variant">Không có lịch hẹn nào gần đây.</td>
              </tr>
            ) : (
              bookings.map(booking => {
                const customerName = booking.customerId?.name || booking.customerName || 'Khách vãng lai';
                const serviceName = (booking.services && booking.services.length > 0) ? booking.services.map(s => s.name).join(', ') : (booking.serviceId?.name || 'Chưa chọn');
                const barberName = booking.barberId?.userId?.name || 'Chưa phân công';
                const price = (booking.services && booking.services.length > 0) ? booking.services.reduce((sum, s) => sum + (s.price || 0), 0) : (booking.serviceId?.price || booking.totalPrice || 0);

                return (
                  <tr key={booking._id} className="border-b border-outline-gold/10 hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-5 px-8 font-medium tracking-wide">{customerName}</td>
                    <td className="py-5 px-8 text-on-surface-variant italic">{serviceName}</td>
                    <td className="py-5 px-8 text-on-surface-variant">{barberName}</td>
                    <td className="py-5 px-8 text-primary font-label-md">
                      {booking.timeSlot || (booking.bookingDate ? new Date(booking.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--')} <br />
                      <span className="text-[10px] text-outline">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </td>
                    <td className="py-5 px-8 text-right font-semibold text-primary">{formatCurrency(price)}</td>
                    <td className="py-5 px-8 text-center">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
