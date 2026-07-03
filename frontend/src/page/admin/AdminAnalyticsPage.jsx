"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/services/api';

const fetcher = (url) => fetchWithAuth(url);

const formatCurrency = (val) => {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val.toString();
};

const formatFullCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

export default function AdminAnalyticsPage() {
  const [chartTimeframe, setChartTimeframe] = useState('thisMonth'); // 'thisMonth', 'thisYear'

  const { data: res, error, isLoading } = useSWR(`/analytics/dashboard?chartTimeframe=${chartTimeframe}`, fetcher, {
    refreshInterval: 60000 // refresh every minute
  });

  const data = res;

  useEffect(() => {
    // Re-trigger animation when data changes
    if (!isLoading && data) {
      setTimeout(() => {
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach(bar => {
          const finalHeight = bar.getAttribute('data-height');
          bar.style.height = '0';
          setTimeout(() => {
            bar.style.height = finalHeight;
          }, 50);
        });
      }, 100);
    }
  }, [isLoading, data, chartTimeframe]);

  if (error) {
    return <div className="p-8 text-error">Lỗi tải dữ liệu phân tích. Vui lòng thử lại.</div>;
  }

  const kpis = data?.kpis || {};
  const revenueChart = data?.revenueChart || [];
  const comp = data?.compositionStats || { service: { total: 0, breakdown: {} }, product: { total: 0, breakdown: {} } };
  const top = data?.topPerformers || { topServices: [], topProducts: [] };
  const overview = data?.operationalOverview || {};

  // Chart scaling calculations
  const maxRevenue = Math.max(...revenueChart.map(d => d.total), 1); // prevent div by zero

  return (
    <div className="w-full text-on-surface font-body-md selection:bg-primary selection:text-on-primary">
      {isLoading ? (
        <div className="flex justify-center items-center h-64 mt-12">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto px-6 md:px-margin-desktop py-8">
          
          {/* Operational Overview (Moved to Top) */}
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-8 rounded-xl mb-8">
            <h4 className="font-headline-sm text-primary mb-6">Tổng quan hoạt động (Tất cả thời gian)</h4>
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

          {/* Main Revenue Chart */}
          <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl mb-8 transition-all hover:border-primary">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h4 className="font-headline-sm text-primary">Biểu đồ doanh thu</h4>
                <p className="text-on-surface-variant text-sm">Thống kê chi tiết Tổng doanh thu, Dịch vụ và Sản phẩm</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Chart Filters */}
                <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant">
                  <button 
                    onClick={() => setChartTimeframe('thisMonth')}
                    className={`px-4 py-1.5 text-xs rounded-md transition-all ${chartTimeframe === 'thisMonth' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    Tháng này
                  </button>
                  <button 
                    onClick={() => setChartTimeframe('thisYear')}
                    className={`px-4 py-1.5 text-xs rounded-md transition-all ${chartTimeframe === 'thisYear' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    Năm nay
                  </button>
                </div>
                
                {/* Chart Legends */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span className="text-xs font-label-md">Tổng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#214877]"></div>
                    <span className="text-xs font-label-md">Dịch vụ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffdea5]/50"></div>
                    <span className="text-xs font-label-md">Sản phẩm</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-80 flex items-end justify-between gap-4 border-b border-outline-variant/30 pb-4 overflow-x-auto custom-scrollbar">
              {revenueChart.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">Không có dữ liệu trong khoảng thời gian này</div>
              ) : (
                revenueChart.map((col, idx) => {
                  const totalH = (col.total / maxRevenue) * 100;
                  const serviceH = (col.service / maxRevenue) * 100;
                  const productH = (col.product / maxRevenue) * 100;
                  
                  return (
                    <div key={idx} className="flex-1 min-w-[60px] flex flex-col items-center group relative cursor-pointer">
                      {/* Tooltip */}
                      <div className="absolute -top-16 bg-surface-container-high border border-outline-variant p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                        <p className="text-xs font-bold text-primary mb-1">{col.label}</p>
                        <p className="text-[10px]">Dịch vụ: {formatCurrency(col.service)}</p>
                        <p className="text-[10px]">Sản phẩm: {formatCurrency(col.product)}</p>
                      </div>
                      
                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        <div className="chart-bar w-1/4 bg-primary/30 rounded-t-sm transition-all duration-1000 ease-out" data-height={`${totalH}%`} style={{height: 0}}></div>
                        <div className="chart-bar w-1/4 bg-[#214877] rounded-t-sm transition-all duration-1000 ease-out delay-100" data-height={`${serviceH}%`} style={{height: 0}}></div>
                        <div className="chart-bar w-1/4 bg-[#ffdea5]/50 rounded-t-sm transition-all duration-1000 ease-out delay-200" data-height={`${productH}%`} style={{height: 0}}></div>
                      </div>
                      <span className="text-[10px] mt-2 text-outline-variant font-label-md truncate w-full text-center">{col.label.split(' ')[0].substring(5)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Composition Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Services Composition */}
            <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl hover:border-primary transition-all">
              <h4 className="font-headline-sm text-primary mb-8">Cơ cấu doanh thu dịch vụ</h4>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative h-48 w-48 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-[16px] border-surface-container-high"></div>
                  {/* Simplistic dynamic doughnut - React doesn't easily do multiple conic-gradients without extra libs, so we just use a fixed placeholder circle for aesthetic, but show real numbers on right */}
                  <div className="absolute inset-0 rounded-full border-[16px] border-primary border-r-transparent border-b-transparent rotate-[20deg] transition-all duration-1000 opacity-50"></div>
                  <div className="absolute inset-0 rounded-full border-[16px] border-secondary border-t-transparent border-l-transparent -rotate-[40deg] transition-all duration-1000 opacity-50"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{formatCurrency(comp.service.total)}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-label-md">Tổng Dịch Vụ</span>
                  </div>
                </div>
                <div className="flex-grow space-y-4 w-full">
                  {Object.entries(comp.service.breakdown || {}).sort((a,b) => b[1]-a[1]).slice(0, 4).map(([cat, val], idx) => {
                    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-outline'];
                    const pct = comp.service.total > 0 ? (val / comp.service.total * 100).toFixed(1) : 0;
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></div>
                          <span className="text-sm capitalize">{cat}</span>
                        </div>
                        <span className="text-sm font-bold">{pct}%</span>
                      </div>
                    );
                  })}
                  {Object.keys(comp.service.breakdown || {}).length === 0 && (
                    <div className="text-sm text-on-surface-variant">Chưa có dữ liệu</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Products Composition */}
            <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl hover:border-primary transition-all">
              <h4 className="font-headline-sm text-primary mb-8">Cơ cấu doanh thu sản phẩm</h4>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative h-48 w-48 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-[16px] border-surface-container-high"></div>
                  <div className="absolute inset-0 rounded-full border-[16px] border-primary-container border-b-transparent border-l-transparent rotate-[60deg] transition-all duration-1000 opacity-50"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{formatCurrency(comp.product.total)}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-label-md">Tổng Sản Phẩm</span>
                  </div>
                </div>
                <div className="flex-grow space-y-4 w-full">
                  {Object.entries(comp.product.breakdown || {}).sort((a,b) => b[1]-a[1]).slice(0, 4).map(([cat, val], idx) => {
                    const colors = ['bg-primary-container', 'bg-secondary-fixed-dim', 'bg-gold-dim', 'bg-outline-variant'];
                    const pct = comp.product.total > 0 ? (val / comp.product.total * 100).toFixed(1) : 0;
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></div>
                          <span className="text-sm capitalize">{cat}</span>
                        </div>
                        <span className="text-sm font-bold">{pct}%</span>
                      </div>
                    );
                  })}
                  {Object.keys(comp.product.breakdown || {}).length === 0 && (
                    <div className="text-sm text-on-surface-variant">Chưa có dữ liệu</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Dịch vụ Table */}
            <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all rounded-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant bg-surface-container/30">
                <h4 className="font-headline-sm text-primary">Top Dịch vụ</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container text-[10px] text-outline uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Tên dịch vụ</th>
                      <th className="px-6 py-4">Lượt dùng</th>
                      <th className="px-6 py-4">Doanh thu</th>
                      <th className="px-6 py-4 text-right">Tỷ trọng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {top.topServices.length > 0 ? top.topServices.map((s, idx) => (
                      <tr key={idx} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">content_cut</span>
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{s.count}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{formatCurrency(s.revenue)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">{s.percentage.toFixed(1)}%</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-on-surface-variant">Chưa có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Top Sản phẩm Table */}
            <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all rounded-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant bg-surface-container/30">
                <h4 className="font-headline-sm text-primary">Top Sản phẩm</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container text-[10px] text-outline uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Tên sản phẩm</th>
                      <th className="px-6 py-4">Đã bán</th>
                      <th className="px-6 py-4">Doanh thu</th>
                      <th className="px-6 py-4 text-right">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {top.topProducts.length > 0 ? top.topProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-sm">inventory_2</span>
                            <span className="text-sm font-medium truncate max-w-[150px]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{p.quantity}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{formatCurrency(p.revenue)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-label-md ${p.stock <= 5 ? 'text-error' : 'text-green-400'}`}>{p.stock}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-on-surface-variant">Chưa có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
