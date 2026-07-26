import React from 'react';

const formatCurrency = (val) => {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val.toString();
};

export default function AnalyticsOverview({ overview, chartTimeframe }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-8 rounded-xl mb-8">
      <h4 className="font-headline-sm text-primary mb-6">
        Tổng quan hoạt động ({chartTimeframe === 'last7days' ? '7 ngày qua' : chartTimeframe === 'thisMonth' ? 'Tháng này' : 'Năm nay'})
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] text-outline uppercase font-label-md">Tổng lịch hẹn</p>
          <p className="text-2xl font-bold text-on-surface">{overview.totalBookings || 0}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-outline uppercase font-label-md">Thành công</p>
          <p className="text-2xl font-bold text-green-400">{overview.successfulBookings || 0}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-outline uppercase font-label-md">Đã hủy</p>
          <p className="text-2xl font-bold text-error">{overview.cancelledBookings || 0}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-outline uppercase font-label-md">No-show</p>
          <p className="text-2xl font-bold text-orange-400">{overview.noShowBookings || 0}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-outline uppercase font-label-md">Tổng hóa đơn</p>
          <p className="text-2xl font-bold text-on-surface">{overview.totalInvoices || 0}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-outline uppercase font-label-md">Sản phẩm bán</p>
          <p className="text-2xl font-bold text-secondary">{overview.productsSold || 0}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-outline uppercase font-label-md">Doanh thu TB/Khách</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(overview.avgRevPerCustomer || 0)}</p>
        </div>
      </div>
    </div>
  );
}
