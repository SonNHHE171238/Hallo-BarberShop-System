import React from 'react';

export default function RewardsSection() {
  return (
    <section className="flex flex-col gap-8 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-headline-md text-3xl text-on-surface serif-title">Phần Thưởng Tri Ân</h2>
          <p className="text-on-surface-variant italic mt-1">Những món quà nhỏ thay lời cảm ơn vì sự gắn bó của bạn.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container px-4 py-2 rounded-full border border-outline-variant">
          <div className="w-32 h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <div className="w-4/5 h-full bg-primary-container"></div>
          </div>
          <span className="font-label-md text-[10px] text-primary-container uppercase tracking-widest font-bold">4/5 tới Phần thưởng tiếp</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-low border border-primary-container/40 rounded-lg p-8 flex items-center gap-8 glow-accent relative overflow-hidden group cursor-default">
          <div className="absolute right-0 top-0 text-[140px] text-primary-container/5 leading-none pointer-events-none material-symbols-outlined transition-transform group-hover:rotate-12 group-hover:scale-110">spa</div>
          <div className="h-20 w-20 bg-primary-container/10 border border-primary-container/20 rounded-full flex items-center justify-center flex-shrink-0 z-10">
            <span className="material-symbols-outlined text-primary-container text-4xl">spa</span>
          </div>
          <div className="z-10">
            <h3 className="font-headline-sm text-xl font-bold text-on-surface serif-title mb-2">Massage Da Đầu Miễn Phí</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">Đặc quyền dành riêng cho thành viên sẽ được mở sau buổi hẹn tiếp theo của bạn.</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-8 flex items-center gap-8 opacity-60 hover:opacity-100 transition-opacity relative group cursor-default">
          <div className="h-20 w-20 bg-surface-variant rounded-full flex items-center justify-center flex-shrink-0 border border-outline-variant">
            <span className="material-symbols-outlined text-on-surface-variant text-4xl">content_cut</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-xl font-bold text-on-surface serif-title mb-2">Tỉa Tóc Miễn Phí</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">Dành cho thành viên hạng Obsidian vào mỗi quý hàng năm.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
