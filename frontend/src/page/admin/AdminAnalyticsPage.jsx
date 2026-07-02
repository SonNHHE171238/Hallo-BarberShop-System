"use client";

import React, { useEffect } from 'react';

export default function AdminAnalyticsPage() {
  
  useEffect(() => {
    // Animation for chart bars on mount
    const bars = document.querySelectorAll('.chart-bar');
    bars.forEach(bar => {
      const finalHeight = bar.style.height || getComputedStyle(bar).height;
      bar.style.height = '0';
      setTimeout(() => {
        bar.style.height = finalHeight;
      }, 100);
    });
  }, []);

  return (
    <div className="w-full text-on-surface font-body-md selection:bg-primary selection:text-on-primary">
      {/* TopNavBar */}
      <header className="w-full h-auto sticky top-0 backdrop-blur-xl border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center px-6 md:px-margin-desktop py-4 z-40 bg-surface/80">
        <div className="flex flex-col mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md font-bold text-primary tracking-tighter uppercase">Phân tích kinh doanh</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Tổng quan doanh thu, dịch vụ, sản phẩm và hiệu quả vận hành</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant">
            <button className="px-4 py-1.5 text-xs rounded-md text-on-surface-variant hover:text-primary transition-all">Hôm nay</button>
            <button className="px-4 py-1.5 text-xs rounded-md text-on-surface-variant hover:text-primary transition-all">7 ngày</button>
            <button className="px-4 py-1.5 text-xs rounded-md bg-primary text-on-primary font-bold shadow-lg">Tháng này</button>
            <button className="px-4 py-1.5 text-xs rounded-md text-on-surface-variant hover:text-primary transition-all">Tùy chỉnh</button>
          </div>
          <button className="bg-primary text-on-primary px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold text-xs hover:bg-surface-tint transition-all">
            <span className="material-symbols-outlined text-lg">file_download</span>
            Xuất báo cáo
          </button>
        </div>
      </header>

      {/* Content Canvas */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-margin-desktop py-8">
        
        {/* 8 KPI Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded text-lg">payments</span>
              <span className="text-[10px] text-green-400 font-label-md">+12.5%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Tổng Doanh Thu</p>
            <h3 className="text-xl font-bold text-primary">428.5tr</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-secondary bg-secondary/10 p-1.5 rounded text-lg">content_cut</span>
              <span className="text-[10px] text-green-400 font-label-md">+8.2%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Doanh thu Dịch vụ</p>
            <h3 className="text-xl font-bold text-primary">312.2tr</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-1.5 rounded text-lg">inventory_2</span>
              <span className="text-[10px] text-green-400 font-label-md">+15.4%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Doanh thu Sản phẩm</p>
            <h3 className="text-xl font-bold text-primary">116.3tr</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-outline bg-outline/10 p-1.5 rounded text-lg">receipt</span>
              <span className="text-[10px] text-green-400 font-label-md">+4.2%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Tổng Hóa Đơn</p>
            <h3 className="text-xl font-bold text-primary">1,240</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-error bg-error/10 p-1.5 rounded text-lg">event_available</span>
              <span className="text-[10px] text-green-400 font-label-md">+5.1%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Lịch Hẹn Thành Công</p>
            <h3 className="text-xl font-bold text-primary">1,156</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-primary-fixed-dim bg-primary/10 p-1.5 rounded text-lg">cached</span>
              <span className="text-[10px] text-green-400 font-label-md">+2.5%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Tỷ Lệ Quay Lại</p>
            <h3 className="text-xl font-bold text-primary">68.4%</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-secondary-fixed-dim bg-secondary/10 p-1.5 rounded text-lg">request_quote</span>
              <span className="text-[10px] text-red-400 font-label-md">-1.2%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Giá trị TB Hóa đơn</p>
            <h3 className="text-xl font-bold text-primary">345k</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-gold-dim bg-gold-dim/10 p-1.5 rounded text-lg">shopping_basket</span>
              <span className="text-[10px] text-green-400 font-label-md">+10.8%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider mb-1">Tỷ lệ Bán Kèm</p>
            <h3 className="text-xl font-bold text-primary">42.1%</h3>
          </div>
        </div>

        {/* Main Revenue Chart */}
        <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl mb-8 transition-all hover:border-primary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h4 className="font-headline-sm text-primary">Doanh thu theo thời gian</h4>
              <p className="text-on-surface-variant text-sm">Thống kê chi tiết Tổng doanh thu, Dịch vụ và Sản phẩm</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-label-md">Tổng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#214877]"></div>
                <span className="text-xs font-label-md">Dịch vụ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ffdea5]/50"></div>
                <span className="text-xs font-label-md">Sản phẩm</span>
              </div>
            </div>
          </div>
          
          {/* Triple Series Chart Placeholder */}
          <div className="h-80 flex items-end justify-between gap-4 border-b border-outline-variant/30 pb-4">
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div className="chart-bar w-1/4 bg-primary/30 rounded-t-sm transition-all duration-1000 ease-out" style={{height: "40%"}}></div>
                <div className="chart-bar w-1/4 bg-[#214877] rounded-t-sm transition-all duration-1000 ease-out delay-100" style={{height: "30%"}}></div>
                <div className="chart-bar w-1/4 bg-[#ffdea5]/50 rounded-t-sm transition-all duration-1000 ease-out delay-200" style={{height: "10%"}}></div>
              </div>
              <span className="text-[10px] mt-2 text-outline-variant font-label-md">Tuần 01</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div className="chart-bar w-1/4 bg-primary/30 rounded-t-sm transition-all duration-1000 ease-out" style={{height: "60%"}}></div>
                <div className="chart-bar w-1/4 bg-[#214877] rounded-t-sm transition-all duration-1000 ease-out delay-100" style={{height: "45%"}}></div>
                <div className="chart-bar w-1/4 bg-[#ffdea5]/50 rounded-t-sm transition-all duration-1000 ease-out delay-200" style={{height: "15%"}}></div>
              </div>
              <span className="text-[10px] mt-2 text-outline-variant font-label-md">Tuần 02</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div className="chart-bar w-1/4 bg-primary rounded-t-sm shadow-[0_0_15px_rgba(255,222,165,0.3)] transition-all duration-1000 ease-out" style={{height: "90%"}}></div>
                <div className="chart-bar w-1/4 bg-[#214877] rounded-t-sm transition-all duration-1000 ease-out delay-100" style={{height: "65%"}}></div>
                <div className="chart-bar w-1/4 bg-[#ffdea5]/50 rounded-t-sm transition-all duration-1000 ease-out delay-200" style={{height: "25%"}}></div>
              </div>
              <span className="text-[10px] mt-2 text-primary font-bold font-label-md">Tuần 03</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div className="chart-bar w-1/4 bg-primary/30 rounded-t-sm transition-all duration-1000 ease-out" style={{height: "75%"}}></div>
                <div className="chart-bar w-1/4 bg-[#214877] rounded-t-sm transition-all duration-1000 ease-out delay-100" style={{height: "55%"}}></div>
                <div className="chart-bar w-1/4 bg-[#ffdea5]/50 rounded-t-sm transition-all duration-1000 ease-out delay-200" style={{height: "20%"}}></div>
              </div>
              <span className="text-[10px] mt-2 text-outline-variant font-label-md">Tuần 04</span>
            </div>
          </div>
        </div>

        {/* Composition Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl hover:border-primary transition-all">
            <h4 className="font-headline-sm text-primary mb-8">Cơ cấu doanh thu dịch vụ</h4>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative h-48 w-48 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-[16px] border-surface-container-high"></div>
                <div className="absolute inset-0 rounded-full border-[16px] border-primary border-r-transparent border-b-transparent rotate-[20deg] transition-all duration-1000"></div>
                <div className="absolute inset-0 rounded-full border-[16px] border-secondary border-t-transparent border-l-transparent -rotate-[40deg] transition-all duration-1000"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">312tr</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-label-md">Tổng Dịch Vụ</span>
                </div>
              </div>
              <div className="flex-grow space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span className="text-sm">Cắt tóc &amp; Styling</span>
                  </div>
                  <span className="text-sm font-bold">54%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                    <span className="text-sm">Uốn &amp; Nhuộm</span>
                  </div>
                  <span className="text-sm font-bold">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div>
                    <span className="text-sm">Gội đầu &amp; Massage</span>
                  </div>
                  <span className="text-sm font-bold">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-outline"></div>
                    <span className="text-sm">Gói Combo</span>
                  </div>
                  <span className="text-sm font-bold">12%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-container-low border border-outline-variant p-8 rounded-xl hover:border-primary transition-all">
            <h4 className="font-headline-sm text-primary mb-8">Cơ cấu doanh thu sản phẩm</h4>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative h-48 w-48 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-[16px] border-surface-container-high"></div>
                <div className="absolute inset-0 rounded-full border-[16px] border-primary-container border-b-transparent border-l-transparent rotate-[60deg] transition-all duration-1000"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">116tr</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-label-md">Tổng Sản Phẩm</span>
                </div>
              </div>
              <div className="flex-grow space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-container"></div>
                    <span className="text-sm">Pomade &amp; Wax</span>
                  </div>
                  <span className="text-sm font-bold">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim"></div>
                    <span className="text-sm">Dầu gội &amp; Xả</span>
                  </div>
                  <span className="text-sm font-bold">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gold-dim"></div>
                    <span className="text-sm">Serum &amp; Dưỡng</span>
                  </div>
                  <span className="text-sm font-bold">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-outline-variant"></div>
                    <span className="text-sm">Phụ kiện quý ông</span>
                  </div>
                  <span className="text-sm font-bold">10%</span>
                </div>
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
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">content_cut</span>
                        <span className="text-sm font-medium">Heritage Signature Cut</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">428</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">149.8tr</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">35%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">face</span>
                        <span className="text-sm font-medium">Royal Shave &amp; Hot Towel</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">215</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">75.2tr</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">18%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">spa</span>
                        <span className="text-sm font-medium">Head Massage Therapy</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">184</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">46.0tr</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">11%</span>
                    </td>
                  </tr>
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
                    <th className="px-6 py-4">Số lượng</th>
                    <th className="px-6 py-4">Doanh thu</th>
                    <th className="px-6 py-4 text-right">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm">inventory_2</span>
                        <span className="text-sm font-medium">Royal Pomade Platinum</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">156</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">42.5tr</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-400 font-label-md">84</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm">sanitizer</span>
                        <span className="text-sm font-medium">Beard Oil Sandalwood</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">82</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">18.2tr</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-orange-400 font-label-md">12</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm">soap</span>
                        <span className="text-sm font-medium">Heritage Daily Shampoo</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">94</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">16.5tr</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-400 font-label-md">45</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Operational Overview & Business Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Operational Overview */}
          <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-8 rounded-xl">
            <h4 className="font-headline-sm text-primary mb-6">Tổng quan hoạt động</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] text-outline uppercase font-label-md">Tổng lịch hẹn</p>
                <p className="text-2xl font-bold text-on-surface">1,340</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-outline uppercase font-label-md">Thành công</p>
                <p className="text-2xl font-bold text-green-400">1,156</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-outline uppercase font-label-md">Đã hủy</p>
                <p className="text-2xl font-bold text-error">124</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-outline uppercase font-label-md">No-show</p>
                <p className="text-2xl font-bold text-orange-400">60</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-outline uppercase font-label-md">Tổng hóa đơn</p>
                <p className="text-2xl font-bold text-on-surface">1,240</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-outline uppercase font-label-md">Sản phẩm đã bán</p>
                <p className="text-2xl font-bold text-secondary">428</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[10px] text-outline uppercase font-label-md">Doanh thu TB / Khách</p>
                <p className="text-2xl font-bold text-primary">345,500đ</p>
              </div>
            </div>
          </div>
          
          {/* Business Alerts */}
          <div className="bg-surface-container-low border border-outline-variant hover:border-primary transition-all p-8 rounded-xl">
            <h4 className="font-headline-sm text-primary mb-6">Cảnh báo kinh doanh</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border-l-4 border-error">
                <div>
                  <p className="text-sm font-bold">Tồn kho thấp</p>
                  <p className="text-[10px] text-on-surface-variant">Beard Oil, Razor Blades</p>
                </div>
                <span className="text-[9px] bg-error/20 text-error px-2 py-1 rounded font-bold">Cần nhập thêm</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border-l-4 border-orange-400">
                <div>
                  <p className="text-sm font-bold">Sản phẩm bán chậm</p>
                  <p className="text-[10px] text-on-surface-variant">Hair Clay Series B</p>
                </div>
                <span className="text-[9px] bg-orange-400/20 text-orange-400 px-2 py-1 rounded font-bold">Cần theo dõi</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border-l-4 border-primary">
                <div>
                  <p className="text-sm font-bold">Dịch vụ tăng trưởng</p>
                  <p className="text-[10px] text-on-surface-variant">Combo Gội &amp; Massage</p>
                </div>
                <span className="text-[9px] bg-primary/20 text-primary px-2 py-1 rounded font-bold">Ổn định</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border-l-4 border-red-500">
                <div>
                  <p className="text-sm font-bold">Tỷ lệ hủy tăng</p>
                  <p className="text-[10px] text-on-surface-variant">Tăng 4.5% so với tuần trước</p>
                </div>
                <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-1 rounded font-bold">Quan trọng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
