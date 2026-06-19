import React from 'react';

export default function AdminChartsAndRankings() {
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
          <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Top Nhân Viên</h2>
          <button className="text-primary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </div>
        {/* Ranking List */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Staff Item 1 */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded border border-primary p-0.5 flex-shrink-0 overflow-hidden bg-surface-container-lowest">
              <img alt="Marcus T." className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5mX4y2eYCdR3X7vPeSe0_ssbl10UDAj--b9Zin57EQDacZ71OKPryIDVhssMqELDeRmg9yj97dyJzHbYu7iEn4mlQYo6fa9cUzZ5h2UDdDf7hBsMPL03tpnK8_Mw36ASIKrauzo6OSgRTaam28Mq40GuHks8g0-AWlnNzq8dX5mOEAM7tSRCfexWeqMS1ARuXVLfrhgpDMx4KaQSz418Ns904Qr39aSBIxT8i4xr6hKbSs_Dgo5GC9_ARJWkiaWBlmx2q6gZELZbj" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="font-body-md text-[14px] font-semibold text-on-surface uppercase tracking-tight">Marcus T.</span>
                <span className="font-label-md text-[11px] text-primary">$12.4k</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-[90%]"></div>
              </div>
            </div>
          </div>
          {/* Staff Item 2 */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded border border-outline-gold flex items-center justify-center font-label-md text-label-md text-outline bg-surface-container-lowest flex-shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
              EL
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="font-body-md text-[14px] font-semibold text-on-surface-variant uppercase tracking-tight group-hover:text-on-surface transition-colors">Elias L.</span>
                <span className="font-label-md text-[11px] text-outline group-hover:text-primary transition-colors">$10.1k</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-outline h-full rounded-full w-[75%] group-hover:bg-primary transition-colors"></div>
              </div>
            </div>
          </div>
          {/* Staff Item 3 */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded border border-outline-gold flex items-center justify-center font-label-md text-label-md text-outline bg-surface-container-lowest flex-shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
              SJ
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="font-body-md text-[14px] font-semibold text-on-surface-variant uppercase tracking-tight group-hover:text-on-surface transition-colors">Sarah J.</span>
                <span className="font-label-md text-[11px] text-outline group-hover:text-primary transition-colors">$8.9k</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-outline h-full rounded-full w-[65%] group-hover:bg-primary transition-colors"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
