"use client";

import React, { useState } from "react";

export default function Services() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const tabs = ["Tất cả", "Cắt tóc", "Uốn tóc", "Nhuộm tóc", "Combo"];

  return (
    <section id="services" className="py-24 bg-surface-container-lowest border-y border-outline-variant">
      <div className="max-w-[1200px] mx-auto px-4 md:px-16">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-12">Khám phá Dịch vụ của chúng tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="p-6 border border-outline-variant rounded-xl bg-surface-container-low">
              <div className="text-primary font-display-lg text-display-lg mb-2">7K</div>
              <div className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">Facebook Likes</div>
            </div>
            <div className="p-6 border border-outline-variant rounded-xl bg-surface-container-low">
              <div className="text-primary font-display-lg text-display-lg mb-2">7K</div>
              <div className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">Followers</div>
            </div>
            <div className="p-6 border border-outline-variant rounded-xl bg-surface-container-low">
              <div className="text-primary font-display-lg text-display-lg mb-2">5⭐</div>
              <div className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">Đánh giá</div>
            </div>
          </div>
          
          <div className="flex overflow-x-auto scroll-hide gap-4 justify-start md:justify-center mb-12 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                } px-6 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              name: "Royal Cut & Shave",
              price: "350k",
              description: "Combo cắt tóc, cạo mặt bằng khăn nóng và massage cổ vai gáy thư giãn.",
              duration: "60 phút",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdk6y0HOx4kzaAt36Wuegjq5u-XYI7eeWGzynGThjbSTUbGqNbX53SdN2kf2HnEyw1_UwVlIpmgaf60csVeFaC6Fri6X28Q8VCLiDlgdpY0Qp3zq3kyhq084KyseWNePcDZTUc6w7DDhnOfVImiBv-qTdc3dv4ql9ob7CtKe-lmmM8C17XW52WQX_DxuyIOdbVU2zzQRSRrBMPt452HpjWfZ-7FYpPZaZpVsdsmc6Ri30zvNBLEYHdtkvT7Vy-x7spq7QLlExKOSz5",
              isBestseller: true
            },
            {
              id: 2,
              name: "Classic Men's Haircut",
              price: "150k",
              description: "Cắt tóc tạo kiểu chuẩn nam giới hiện đại, bao gồm gội đầu và vuốt sáp.",
              duration: "45 phút",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzEEqUAbNsW3wr8zM2oWW2zqsgLqmWKLNvG1aCS_wTPDdox_QgOotp1veJFRSjtcWJ2yOxbjPvPUstFnycSwMrJM5TLQgJGXNE2meEAwghmVUL3WzkvjtJwCzH-n21sz44JyV6jdXpg61i5ZAhvmtcExj34w8crD0eXKsuX7pEwt4XeeV94dt0UgdsXy8BI1ze9zEvfykNytW5btP7Hgm70UmcchN7oApIZWHVcsuoFGZbCJyi4bc-fd85F3H4uPycYRBfoyPxwv25",
              isBestseller: false
            },
            {
              id: 3,
              name: "Modern Perm",
              price: "500k",
              description: "Uốn tóc tạo độ phồng và nếp tự nhiên theo phong cách hiện đại.",
              duration: "90 phút",
              image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_Ptgb4N4d2oZYbSO2fRWDRN3HJ-PUg-BuqAAYB8ao1HlzradQKUZ6DuWbdiSlKCM7A9iWuSRrJcnXJpDQi6VX8bA5PFUCcv8EhVrg_WdU4ev2aat3Q_NN4CZIPvusFk8d_pSc9Zveku6am8pE3tPnZcmsdkHspmCF_qu8oTpppBuPLZnYOOnetLZY4dUO7zik5JzetCG4H5TtaLx0Xa79p7UWrG_54ltlAOUg5yLOKupe13NpTznbp481Ub8Gbeuenf7D0Jsww8zu",
              isBestseller: false
            }
          ].map((service) => (
            <div key={service.id} className="bento-card rounded-xl overflow-hidden flex flex-col h-full">
              <div className="h-56 relative overflow-hidden">
                <img className="w-full h-full object-cover" alt={service.name} src={service.image} />
                {service.isBestseller && (
                  <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded font-label-md text-label-md">
                    Bestseller
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-headline-md text-headline-md text-on-surface">{service.name}</h3>
                  <span className="text-primary font-headline-md text-headline-md">{service.price}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-2 text-outline mb-8">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="font-label-md text-label-md">{service.duration}</span>
                </div>
                <button className="mt-auto w-full border border-primary text-primary py-3 rounded-lg font-headline-sm text-headline-sm hover:bg-primary hover:text-on-primary transition-all">
                  Đặt lịch ngay
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-8 bg-surface-container-high p-8 rounded-2xl border border-outline-variant">
            <p className="font-headline-sm text-headline-sm text-on-surface">Sẵn sàng để thay đổi phong cách? Đặt lịch hẹn ngay hôm nay</p>
            <button className="bg-primary text-on-primary px-8 py-3 rounded-lg font-headline-sm text-headline-sm hover:scale-105 transition-transform active:scale-95">
              Booking Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
