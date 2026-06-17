import React from "react";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="Hero background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA91IZfciHl7C9AkVR-iQBz99mM8NT65H_NcN9yyhWt1zn8b4GC5oc-NICYbgVT6byR6YaeZxIZAnfYxC9GFjUMXDf2hXx91eLK6Ih4osis2yqPK2FUT6tj9V1S9prsB4ZcINIVlBD2uGbj8l4MmFNXn3R287pNNMUB1SWqm_xratWQBawDaIfFsSddb5zrSo3XmjWcAG1inhCSsgwjtyz6rw_dwHH6Co6SDBqqfe3_wC27qp_1VHHxOYqH1hDd7KKYqKAsOad26rue"
        />
        <div className="absolute inset-0 hero-gradient"></div>
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl mt-16 md:mt-0">
        <span className="font-label-md text-label-md text-primary tracking-[0.4em] mb-4 block uppercase">Men Only</span>
        <h1 className="font-display-lg text-display-lg md:text-[96px] text-on-surface uppercase mb-2 tracking-tighter leading-none">
          Hallo Barber
        </h1>
        <p className="font-headline-sm text-headline-sm text-outline mb-10 tracking-widest uppercase">Since Barbershop MMXVI</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-primary text-on-primary px-12 py-4 rounded-lg font-headline-sm text-headline-sm hover:bg-primary-container transition-all active:scale-95">
            ĐẶT LỊCH HẸN
          </button>
          <button className="border-2 border-secondary text-secondary px-12 py-4 rounded-lg font-headline-sm text-headline-sm hover:bg-secondary/10 transition-all">
            XEM DỊCH VỤ
          </button>
        </div>
      </div>
    </section>
  );
}
