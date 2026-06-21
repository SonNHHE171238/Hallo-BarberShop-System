import React from 'react';

export default function QuickRebook() {
  return (
    <section className="mb-16">
      <h2 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        Đặt Lại Dịch Vụ Trước
      </h2>
      <div className="glass-panel p-8 rounded-xl border border-outline-variant hover:border-primary transition-all group flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-outline-variant">
            <img 
              alt="Service detail" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2SwLKK215yi1sPDaaUn3hUEdjpN1nJgo9nPs8HgS9yrAMti7q67LDD7JBiN5lY6gU7AaDeXFVtBwA2yoM7SRHfmc_WlEHar7XD4Ux8Nc1Wkb7bVUP1wRUTdbHJOU-d3tNdTwa5a4t8MMvAW23S5PlHI3jNKxP4jzG4fAICkpGRLgd6cuBDZdtzunlh6wcCLqO4m6QwZeHkYgPMitBNbxycIeLrBSYs4C91ia6HLgzJLSj4KGntW4xaz7RmbWGakl8pRSS5cyyaZWT"
            />
          </div>
          <div>
            <h3 className="font-headline-sm text-primary">Royal Cut & Shave</h3>
            <p className="text-on-surface-variant">Hallo Barber: <span className="text-on-surface font-medium">Hùng Trần</span></p>
            <p className="text-label-md font-label-md text-outline">Lần cuối: 15/10/2023</p>
          </div>
        </div>
        <button className="w-full md:w-auto bg-primary text-on-primary px-10 py-4 font-headline-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
          <span className="material-symbols-outlined">event_repeat</span>
          Đặt Lại Ngay
        </button>
      </div>
    </section>
  );
}
