import React from 'react';

export default function WelcomeHeader() {
  return (
    <section className="mb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Chào mừng trở lại, Arthur</h1>
          <p className="text-on-surface-variant font-body-lg">Rất vui được gặp lại bạn. Bạn đã sẵn sàng cho diện mạo mới chưa?</p>
        </div>
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4 border border-primary/20">
          <div className="bg-primary-container/20 p-3 rounded-lg">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          </div>
          <div>
            <p className="text-label-md font-label-md uppercase tracking-widest text-on-surface-variant">Điểm Obsidian</p>
            <p className="text-headline-sm font-headline-sm text-primary">2,450 pts</p>
          </div>
        </div>
      </div>
    </section>
  );
}
