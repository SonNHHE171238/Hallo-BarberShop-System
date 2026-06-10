import React from "react";
import Link from "next/link";

export default function AboutUs() {
  return (
    <section id="about" className="py-24 bg-surface max-w-[1200px] mx-auto px-4 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden h-64">
              <img alt="Barbershop environment 1" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB11o3fsOILvTKSK-UAgHbQpGyWohoOnypc6SDQzQ7OWosoIGqpatumK9cHlBT9DhllmeMYhDqmyspGuULMD2QFBcCLdGpMTaDh1sYQatRqmIMnREuxmyA_hIEsToglZ-x2A78P8Ew9ByaYo9dmNHloNZd-jCulxxFWvGqmpeKzE1owZBE3ynnSVRIR7gtWBmwKQgQTto8xfdVH33kCw2llFtgXacDI_cIGzvLyOV2qlwy9uQu7YxkmY3jAm3rFzTVmlhpEAsBrJnwA" />
            </div>
            <div className="rounded-xl overflow-hidden h-48 border border-outline-variant">
              <div className="p-8 h-full flex flex-col justify-end bg-surface-container-high">
                <span className="text-primary font-headline-md text-headline-md">25/04/2020</span>
                <span className="text-on-surface-variant font-body-md text-body-md">Ngày thành lập</span>
              </div>
            </div>
          </div>
          <div className="pt-12 space-y-4">
            <div className="rounded-xl overflow-hidden h-48 bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-5xl">liquor</span>
            </div>
            <div className="rounded-xl overflow-hidden h-64">
              <img alt="Barbershop environment 2" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA91IZfciHl7C9AkVR-iQBz99mM8NT65H_NcN9yyhWt1zn8b4GC5oc-NICYbgVT6byR6YaeZxIZAnfYxC9GFjUMXDf2hXx91eLK6Ih4osis2yqPK2FUT6tj9V1S9prsB4ZcINIVlBD2uGbj8l4MmFNXn3R287pNNMUB1SWqm_xratWQBawDaIfFsSddb5zrSo3XmjWcAG1inhCSsgwjtyz6rw_dwHH6Co6SDBqqfe3_wC27qp_1VHHxOYqH1hDd7KKYqKAsOad26rue" />
            </div>
          </div>
        </div>
        <div>
          <span className="font-label-md text-label-md text-primary tracking-widest mb-4 block uppercase">Our Legacy</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8">VỀ CHÚNG TÔI</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 leading-relaxed">
            Tại HALLO BARBER, chúng tôi tự hào mang đến trải nghiệm cắt tóc nam đẳng cấp với không gian hiện đại và sang trọng. Mỗi khách hàng đến với chúng tôi đều được phục vụ bằng sự tận tâm, nhiệt huyết và dịch vụ chuyên nghiệp nhất.
          </p>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed">
            Với đội ngũ thợ lành nghề, kết hợp giữa phong cách cổ điển và những xu hướng tóc mới nhất, chúng tôi cam kết sẽ định hình phong cách cá nhân hoàn hảo nhất dành cho bạn.
          </p>
          <button className="group flex items-center gap-3 text-primary font-headline-sm text-headline-sm">
            Xem thêm <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
          </button>
        </div>
      </div>
    </section>
  );
}
