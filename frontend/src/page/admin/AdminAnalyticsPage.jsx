"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/services/api';
import AnalyticsOverview from '@/components/admin/analytics/AnalyticsOverview';
import AnalyticsRevenueChart from '@/components/admin/analytics/AnalyticsRevenueChart';
import AnalyticsComposition from '@/components/admin/analytics/AnalyticsComposition';
import AnalyticsTopPerformers from '@/components/admin/analytics/AnalyticsTopPerformers';

const fetcher = (url) => fetchWithAuth(url);

export default function AdminAnalyticsPage() {
  const [chartTimeframe, setChartTimeframe] = useState('thisMonth'); // 'thisMonth', 'thisYear'

  const { data: res, error, isLoading, isValidating } = useSWR(`/analytics/dashboard?timeframe=${chartTimeframe}`, fetcher, {
    refreshInterval: 60000, // refresh every minute
    keepPreviousData: true
  });

  const data = res;
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimateBars(false);
      const timer = setTimeout(() => setAnimateBars(true), 50);
      return () => clearTimeout(timer);
    }
  }, [chartTimeframe, data?.revenueChart?.length]);

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
      {isLoading && !data ? (
        <div className="flex justify-center items-center h-64 mt-12">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto px-6 md:px-margin-desktop py-8">
          
          {/* Global Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface">Báo cáo phân tích</h2>
              <p className="text-sm text-on-surface-variant mt-1">Dữ liệu được lọc theo khoảng thời gian bạn chọn</p>
            </div>
            
            <div className="flex items-center gap-4">
              {isValidating && <span className="material-symbols-outlined animate-spin text-primary text-sm">refresh</span>}
              <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant shadow-sm">
                <button 
                  onClick={() => setChartTimeframe('last7days')}
                  className={`px-5 py-2 text-xs md:text-sm rounded-md transition-all ${chartTimeframe === 'last7days' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/50'}`}
                >
                  7 ngày qua
                </button>
                <button 
                  onClick={() => setChartTimeframe('thisMonth')}
                  className={`px-5 py-2 text-xs md:text-sm rounded-md transition-all ${chartTimeframe === 'thisMonth' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/50'}`}
                >
                  Tháng này
                </button>
                <button 
                  onClick={() => setChartTimeframe('thisYear')}
                  className={`px-5 py-2 text-xs md:text-sm rounded-md transition-all ${chartTimeframe === 'thisYear' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/50'}`}
                >
                  Năm nay
                </button>
              </div>
            </div>
          </div>
          
          {/* Operational Overview */}
          <AnalyticsOverview overview={overview} chartTimeframe={chartTimeframe} />

          {/* Main Revenue Chart */}
          <AnalyticsRevenueChart revenueChart={revenueChart} isValidating={isValidating} />

          {/* Composition Charts */}
          <AnalyticsComposition comp={comp} />

          {/* Top Performers Tables */}
          <AnalyticsTopPerformers top={top} />
        </div>
      )}
    </div>
  );
}
