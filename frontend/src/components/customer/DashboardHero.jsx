import React from 'react';

export default function DashboardHero({ userName }) {
  const firstName = userName ? userName.split(' ').pop() : 'Bạn';
  
  return (
    <section className="relative h-[500px] rounded-lg overflow-hidden flex flex-col justify-center items-center text-center p-8 border border-outline-variant">
      <img 
        alt="Nội thất tiệm tóc" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-overlay scale-110" 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_ptLS4Chs8UvwBwsKbSPtd1vhCpKVeo1BhO24Ga-m5s1S0a-1xonQpTs1p9lna3Ee5RJ9VlGmFlkUTY3svtxcbU0ZkRpi0c50a-DeRIMevLV2nlOySt3kc4hCNbAwlnTHDJVsce8myrEtuGfxA22rT5RTC391ElgzAJhJSLfU0Bp-KvkSmw1hOxPA2492IliI3usZjxuWjAuXJ9-ON7TYPckbUKZaH3vVbcZsZc_J0iOF-OwcveLBrJI8XoZEb6Daij1Xa7eIFm6v"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background"></div>
      <div className="relative z-10 max-w-3xl flex flex-col gap-6">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-[1px] bg-primary-container self-center"></div>
          <span className="mx-4 font-label-md text-primary-container tracking-[0.3em] uppercase text-xs">Từ năm 2020</span>
          <div className="w-12 h-[1px] bg-primary-container self-center"></div>
        </div>
        <h1 className="font-headline-lg text-4xl md:text-5xl lg:text-6xl text-on-surface serif-title font-bold">Chào mừng trở lại, {firstName}.</h1>
        <p className="font-body-lg text-xl text-on-surface-variant max-w-xl mx-auto italic">Tạo dấu ấn qua mái tóc của bạn.</p>
        <div className="mt-4">
          <div className="h-10 w-[1px] bg-primary-container/40 mx-auto"></div>
        </div>
      </div>
    </section>
  );
}
