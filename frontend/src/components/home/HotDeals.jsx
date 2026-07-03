import React from "react";

export default function HotDeals() {
  return (
    <section id="deals" className="py-24 bg-surface max-w-[1200px] mx-auto px-4 md:px-16">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-12 text-center">Ưu Đãi Đặc Biệt</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-[#2a2a2a] to-[#3a3a3a] border-l-4 border-primary p-8 rounded-xl flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md text-primary bg-primary/10 px-3 py-1 rounded mb-4 inline-block">VOUCHER</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Giảm 20% cho khách mới</h3>
            <p className="text-on-surface-variant font-body-md text-body-md">Mã: HALLO2024</p>
          </div>
          <button className="bg-primary/20 text-primary border border-primary/40 px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all">Sao chép</button>
        </div>
        <div className="bg-gradient-to-r from-[#2a2a2a] to-[#3a3a3a] border-l-4 border-secondary p-8 rounded-xl flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md text-secondary bg-secondary/10 px-3 py-1 rounded mb-4 inline-block">HOT DEAL</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Combo Father & Son</h3>
            <p className="text-on-surface-variant font-body-md text-body-md">Chỉ 450k (Tiết kiệm 150k)</p>
          </div>
          <button className="bg-secondary/20 text-secondary border border-secondary/40 px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-secondary hover:text-on-secondary transition-all">Nhận ngay</button>
        </div>
      </div>
    </section>
  );
}
