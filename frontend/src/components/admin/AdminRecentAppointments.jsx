import React from 'react';

export default function AdminRecentAppointments() {
  return (
    <section className="bg-surface-container-low border border-outline-gold rounded flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 md:px-8 py-6 bg-surface-container-lowest border-b border-outline-gold/30">
        <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Lịch Hẹn Gần Đây</h2>
        <button className="font-label-md text-[11px] text-primary hover:text-on-surface transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
          Xem tất cả lịch sử
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
      <div className="overflow-x-auto w-full no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-high/30">
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Khách Hàng</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Dịch Vụ</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Thợ Cắt</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30">Thời Gian</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30 text-right">Thành Tiền</th>
              <th className="py-4 px-8 font-label-md text-[11px] text-outline uppercase tracking-[0.15em] border-b border-outline-gold/30 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="text-on-surface font-body-md text-[14px]">
            <tr className="border-b border-outline-gold/10 hover:bg-surface-container-high/50 transition-colors">
              <td className="py-5 px-8 font-medium tracking-wide">Michael R.</td>
              <td className="py-5 px-8 text-on-surface-variant italic">Cắt Fade & Tỉa Râu</td>
              <td className="py-5 px-8 text-on-surface-variant">Marcus T.</td>
              <td className="py-5 px-8 text-primary font-label-md">10:00 AM</td>
              <td className="py-5 px-8 text-right font-semibold text-primary">$85.00</td>
              <td className="py-5 px-8 text-center">
                <span className="inline-block px-3 py-1 rounded-full border border-primary/40 bg-primary/5 text-primary font-label-md text-[10px] uppercase tracking-widest">Đã Hoàn Thành</span>
              </td>
            </tr>
            <tr className="border-b border-outline-gold/10 hover:bg-surface-container-high/50 transition-colors">
              <td className="py-5 px-8 font-medium tracking-wide">James D.</td>
              <td className="py-5 px-8 text-on-surface-variant italic">Cắt Kiểu Cổ Điển</td>
              <td className="py-5 px-8 text-on-surface-variant">Elias L.</td>
              <td className="py-5 px-8 text-primary font-label-md">11:30 AM</td>
              <td className="py-5 px-8 text-right font-semibold text-primary">$45.00</td>
              <td className="py-5 px-8 text-center">
                <span className="inline-block px-3 py-1 rounded-full border border-secondary/40 bg-secondary/5 text-secondary font-label-md text-[10px] uppercase tracking-widest">Đang Thực Hiện</span>
              </td>
            </tr>
            <tr className="border-b border-outline-gold/10 hover:bg-surface-container-high/50 transition-colors">
              <td className="py-5 px-8 font-medium tracking-wide">Alex W.</td>
              <td className="py-5 px-8 text-on-surface-variant italic">Cắt Tóc & Gội Đầu</td>
              <td className="py-5 px-8 text-on-surface-variant">Sarah J.</td>
              <td className="py-5 px-8 text-primary font-label-md">01:15 PM</td>
              <td className="py-5 px-8 text-right font-semibold text-primary">$60.00</td>
              <td className="py-5 px-8 text-center">
                <span className="inline-block px-3 py-1 rounded-full border border-outline/40 bg-outline/5 text-outline font-label-md text-[10px] uppercase tracking-widest">Đã Lên Lịch</span>
              </td>
            </tr>
            <tr className="hover:bg-surface-container-high/50 transition-colors">
              <td className="py-5 px-8 font-medium tracking-wide">Robert B.</td>
              <td className="py-5 px-8 text-on-surface-variant italic">Cạo Mặt Khăn Nóng</td>
              <td className="py-5 px-8 text-on-surface-variant">David W.</td>
              <td className="py-5 px-8 text-primary font-label-md">02:45 PM</td>
              <td className="py-5 px-8 text-right font-semibold text-primary">$55.00</td>
              <td className="py-5 px-8 text-center">
                <span className="inline-block px-3 py-1 rounded-full border border-outline/40 bg-outline/5 text-outline font-label-md text-[10px] uppercase tracking-widest">Đã Lên Lịch</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
