import React, { useState } from 'react';
import useSWR from 'swr';
import { adminDashboardService } from '@/services/admin.service';
import { fetchWithAuth } from '@/services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminChartsAndRankings() {
  const [timeframe, setTimeframe] = useState('30days'); // '30days' (fallback to thisMonth/7days logic), 'thisMonth', 'thisYear'

  // Fetch top barbers
  const { data: topBarbersRes, isLoading: isLoadingBarbers } = useSWR('/api/bookings/admin/top-barbers', async () => {
    return adminDashboardService.getTopBarbers();
  }, { revalidateOnFocus: true });

  // Fetch analytics data
  const { data: analyticsRes, isLoading: isLoadingAnalytics } = useSWR(`/api/analytics/dashboard?timeframe=${timeframe}`, async () => {
    return fetchWithAuth(`/analytics/dashboard?timeframe=${timeframe}`);
  }, { revalidateOnFocus: true });

  const topBarbers = topBarbersRes?.data || [];
  const maxRevenue = topBarbers.length > 0 ? topBarbers[0].revenue : 1;

  // Xử lý dữ liệu biểu đồ
  const revenueData = analyticsRes?.revenueChart || [];

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chart Area (Span 2) */}
      <div className="lg:col-span-2 bg-surface-container-low border border-outline-gold p-5 md:p-8 rounded flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Doanh Thu Theo Thời Gian</h2>
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-transparent border-b border-outline-gold text-primary font-label-md text-[11px] uppercase tracking-widest focus:outline-none focus:border-primary py-1 cursor-pointer"
          >
            <option value="7days">7 Ngày Qua</option>
            <option value="thisMonth">Tháng Này</option>
            <option value="thisYear">Từ Đầu Năm</option>
          </select>
        </div>
        
        <div className="flex-1 w-full min-h-0 relative">
          {isLoadingAnalytics ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-on-surface-variant font-label-md uppercase tracking-widest">Đang tải biểu đồ...</div>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-outline-variant rounded-xl bg-surface-container/30">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">bar_chart</span>
              <p className="text-on-surface-variant font-label-md uppercase tracking-widest text-sm">Chưa có dữ liệu doanh thu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                  dy={10}
                  tickFormatter={(val) => {
                    // Cắt bớt hiển thị nếu là ngày
                    if (val.length > 7) {
                      const parts = val.split('-');
                      return `${parts[2]}/${parts[1]}`;
                    }
                    return val;
                  }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#D4AF37" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      
      {/* Staff Performance Ranking */}
      <div className="bg-surface-container-low border border-outline-gold p-5 md:p-8 rounded flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Top Thợ Cắt (Doanh thu)</h2>
        </div>
        
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
          {isLoadingBarbers ? (
            <div className="text-center py-4 text-on-surface-variant animate-pulse">Đang tải dữ liệu...</div>
          ) : topBarbers.length === 0 ? (
            <div className="text-center py-4 text-on-surface-variant">Chưa có dữ liệu.</div>
          ) : (
            topBarbers.map((barber, index) => {
              const widthPercentage = Math.max((barber.revenue / maxRevenue) * 100, 5);
              const isTop = index === 0;
              
              return (
                <div key={barber.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-10 h-10 rounded border ${isTop ? 'border-primary p-0.5' : 'border-outline-gold flex items-center justify-center font-label-md text-label-md text-outline'} bg-surface-container-lowest flex-shrink-0 overflow-hidden group-hover:border-primary group-hover:text-primary transition-colors`}>
                    {barber.avatarUrl ? (
                      <img alt={barber.name} className={`w-full h-full object-cover ${isTop ? 'opacity-90' : 'grayscale opacity-70'} group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500`} src={barber.avatarUrl} />
                    ) : (
                      isTop ? <span className="w-full h-full flex items-center justify-center text-primary font-bold">{barber.name.charAt(0)}</span> : barber.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className={`font-body-md text-[14px] font-semibold ${isTop ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'} uppercase tracking-tight transition-colors`}>{barber.name}</span>
                      <span className={`font-label-md text-[11px] ${isTop ? 'text-primary' : 'text-outline group-hover:text-primary'} transition-colors`}>{formatCurrency(barber.revenue)}</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                      <div className={`${isTop ? 'bg-primary' : 'bg-outline group-hover:bg-primary'} h-full rounded-full transition-all duration-500`} style={{ width: `${widthPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
