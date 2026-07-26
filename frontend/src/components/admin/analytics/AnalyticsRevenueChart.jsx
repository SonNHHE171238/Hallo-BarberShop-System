import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (val) => {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val.toString();
};

const formatFullCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatXAxis = (tickItem) => {
  if (!tickItem) return '';
  const parts = tickItem.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`; // DD/MM
  if (parts.length === 2) return `Th${parts[1]}`; // ThMM
  return tickItem;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-high border border-outline-variant p-3 rounded shadow-xl min-w-[150px]">
        <p className="font-bold text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs flex justify-between gap-4 font-label-md" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold">{formatFullCurrency(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsRevenueChart({ revenueChart, isValidating }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl mb-8 transition-all hover:border-primary relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-20">
        <div>
          <h4 className="font-headline-sm text-primary flex items-center gap-2">
            Biểu đồ doanh thu
          </h4>
          <p className="text-on-surface-variant text-sm">Thống kê chi tiết Tổng doanh thu, Dịch vụ và Sản phẩm</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          
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
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffdea5] opacity-80"></div>
              <span className="text-xs font-label-md">Sản phẩm</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className={`relative w-full overflow-x-auto custom-scrollbar transition-opacity duration-300 ${isValidating ? 'opacity-50' : 'opacity-100'} pb-4`}>
        <div style={{ minWidth: revenueChart.length > 15 ? `${revenueChart.length * 50}px` : '100%', height: 320 }}>
          {revenueChart.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">Không có dữ liệu trong khoảng thời gian này</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="label" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 10, fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }} 
                  tickLine={false} 
                />
                <YAxis 
                  tickFormatter={(val) => formatCurrency(val)} 
                  tick={{ fontSize: 10, fill: '#6b7280' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Line type="monotone" dataKey="total" name="Tổng" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="service" name="Dịch vụ" stroke="#214877" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="product" name="Sản phẩm" stroke="#fcd34d" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
