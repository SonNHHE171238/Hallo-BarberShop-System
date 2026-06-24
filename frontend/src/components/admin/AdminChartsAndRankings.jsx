import React from 'react';
import useSWR from 'swr';
import { adminDashboardService } from '@/services/admin.service';

export default function AdminChartsAndRankings() {
  const { data: topBarbersRes, isLoading } = useSWR('/api/bookings/admin/top-barbers', async () => {
    return adminDashboardService.getTopBarbers();
  }, { revalidateOnFocus: true });

  const topBarbers = topBarbersRes?.data || [];
  const maxRevenue = topBarbers.length > 0 ? topBarbers[0].revenue : 1;

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chart Area (Span 2) */}
      <div className="lg:col-span-2 bg-surface-container-low border border-outline-gold p-5 md:p-8 rounded flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Doanh Thu Theo Thời Gian</h2>
          <select className="bg-transparent border-b border-outline-gold text-primary font-label-md text-[11px] uppercase tracking-widest focus:outline-none focus:border-primary py-1 cursor-pointer">
            <option>30 Ngày Qua</option>
            <option>Quý Này</option>
            <option>Từ Đầu Năm</option>
          </select>
        </div>
        {/* Simulated Bar Chart CSS */}
        <div className="flex-1 flex items-end gap-1 md:gap-3 h-48 md:h-64 border-b border-outline-gold/30 pb-2 relative overflow-x-auto no-scrollbar">
          {/* Y-Axis labels (simulated) */}
          <div className="absolute left-0 top-0 bottom-2 w-8 md:w-12 flex flex-col justify-between text-outline font-label-md text-[9px] items-end pr-2 pointer-events-none opacity-50 bg-surface-container-low/80 backdrop-blur z-10 uppercase">
            <span>$10k</span>
            <span>$7.5k</span>
            <span>$5k</span>
            <span>$2.5k</span>
          </div>
          {/* Chart Bars */}
          <div className="flex-1 flex items-end justify-between gap-1 pl-10 md:pl-14 h-full min-w-[400px]">
            <div className="w-full bg-surface-variant hover:bg-primary/40 transition-colors rounded-t-sm cursor-pointer" style={{ height: '40%' }} title="$4,000"></div>
            <div className="w-full bg-surface-variant hover:bg-primary/40 transition-colors rounded-t-sm cursor-pointer" style={{ height: '55%' }} title="$5,500"></div>
            <div className="w-full bg-surface-variant hover:bg-primary/40 transition-colors rounded-t-sm cursor-pointer" style={{ height: '45%' }} title="$4,500"></div>
            <div className="w-full bg-surface-variant hover:bg-primary/40 transition-colors rounded-t-sm cursor-pointer" style={{ height: '70%' }} title="$7,000"></div>
            <div className="w-full bg-primary hover:bg-primary/80 transition-colors rounded-t-sm cursor-pointer" style={{ height: '85%' }} title="$8,500 (Cao điểm)"></div>
            <div className="w-full bg-surface-variant hover:bg-primary/40 transition-colors rounded-t-sm cursor-pointer" style={{ height: '60%' }} title="$6,000"></div>
            <div className="w-full bg-surface-variant hover:bg-primary/40 transition-colors rounded-t-sm cursor-pointer" style={{ height: '75%' }} title="$7,500"></div>
          </div>
        </div>
        {/* X-Axis labels */}
        <div className="flex justify-between pl-10 md:pl-14 pt-4 text-outline font-label-md text-[10px] uppercase tracking-widest min-w-[400px] overflow-hidden">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
          <span>CN</span>
        </div>
      </div>
      
      {/* Staff Performance Ranking */}
      <div className="bg-surface-container-low border border-outline-gold p-5 md:p-8 rounded flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Top Thợ Cắt (Doanh thu)</h2>
        </div>
        
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
          {isLoading ? (
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
