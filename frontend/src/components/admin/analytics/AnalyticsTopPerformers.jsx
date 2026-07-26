import React from 'react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

export default function AnalyticsTopPerformers({ top }) {
  return (
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
  );
}
