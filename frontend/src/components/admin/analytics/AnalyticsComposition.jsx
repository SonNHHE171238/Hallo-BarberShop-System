import React from 'react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

export default function AnalyticsComposition({ comp }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Services Composition */}
      <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl hover:border-primary transition-all">
        <h4 className="font-headline-sm text-primary mb-8">Cơ cấu doanh thu dịch vụ</h4>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="relative h-48 w-48 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[16px] border-surface-container-high"></div>
            {/* Simplistic dynamic doughnut */}
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
  );
}
