import React from 'react';
import useSWR from 'swr';
import MetricCard from '@/components/ui/MetricCard';
import { adminDashboardService } from '@/services/admin.service';

export default function AdminMetricsGrid() {
  const { data: metrics, error, isLoading } = useSWR('/api/bookings/admin/metrics', async () => {
    return adminDashboardService.getMetrics();
  }, { revalidateOnFocus: true });

  if (isLoading) {
    return (
      <section className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-4 md:pb-0 md:grid md:grid-cols-3 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[85%] md:min-w-0 snap-center flex-shrink-0 bg-surface-container-high rounded-3xl h-32 border border-outline-variant/30"></div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6 bg-error/10 border border-error/50 rounded-2xl text-center text-error">
        <p>Lỗi khi tải dữ liệu tổng quan. Vui lòng thử lại sau.</p>
        <p className="text-sm mt-2">{error.message || 'Không thể kết nối máy chủ'}</p>
      </section>
    );
  }

  if (!metrics) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <section className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-4 md:pb-0 md:grid md:grid-cols-3 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      <MetricCard
        title="Tổng Doanh Thu (30n)"
        icon="payments"
        value={formatCurrency(metrics.totalRevenue)}
        trend={`${Math.abs(metrics.revenueTrend)}%`}
        trendDirection={metrics.revenueTrend > 0 ? "up" : metrics.revenueTrend < 0 ? "down" : "neutral"}
        isHighlight={true}
        className="min-w-[85%] md:min-w-0 snap-center flex-shrink-0"
      />
      <MetricCard
        title="Khách Hàng Mới"
        icon="person_add"
        value={metrics.newCustomers}
        trend={`${Math.abs(metrics.customerTrend)}%`}
        trendDirection={metrics.customerTrend > 0 ? "up" : metrics.customerTrend < 0 ? "down" : "neutral"}
        isHighlight={true}
        className="min-w-[85%] md:min-w-0 snap-center flex-shrink-0"
      />
      <MetricCard
        title="Giá Trị Đặt Lịch TB"
        icon="receipt_long"
        value={formatCurrency(metrics.avgBookingValue)}
        trend={`${Math.abs(metrics.avgBookingTrend)}%`}
        trendDirection={metrics.avgBookingTrend > 0 ? "up" : metrics.avgBookingTrend < 0 ? "down" : "neutral"}
        isHighlight={true}
        className="min-w-[85%] md:min-w-0 snap-center flex-shrink-0"
      />
    </section>
  );
}
