import React from "react";

export default function BusinessHours() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto px-4 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8">Giờ Hoạt Động</h2>
            
            <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low border border-outline-variant rounded-2xl p-8 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Mở cửa mỗi ngày</h3>
              </div>
              
              <div className="flex flex-col gap-2 relative z-10">
                <p className="font-body-md text-body-md text-on-surface-variant uppercase tracking-widest">Thứ Hai — Chủ Nhật</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-display-lg text-display-lg text-primary font-bold">08:00</span>
                  <span className="text-outline-variant text-2xl font-light">-</span>
                  <span className="font-display-lg text-display-lg text-primary font-bold">19:00</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-container-high rounded-2xl flex items-start gap-4 border border-outline-variant transition-colors hover:border-primary/50">
              <div className="mt-1">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <p className="text-on-surface font-headline-sm text-headline-sm mb-2">Địa chỉ</p>
                <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                  Khu Công Nghệ Cao Hòa Lạc,<br />Thạch Thất, TP. Hà Nội
                </p>
              </div>
            </div>
          </div>
          <div className="h-[400px] rounded-2xl overflow-hidden border border-outline-variant relative">
            <iframe 
              src="https://maps.google.com/maps?q=21.011802,105.5185067&hl=vi&z=17&output=embed" 
              className="absolute top-0 left-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Hallo Barber Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
