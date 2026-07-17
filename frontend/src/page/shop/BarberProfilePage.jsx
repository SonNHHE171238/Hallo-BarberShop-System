"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { customerService } from "@/services/customer.service";

export default function BarberProfilePage({ id }) {
  const router = useRouter();
  const [barber, setBarber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBarber = async () => {
      try {
        setIsLoading(true);
        // Lấy tất cả barbers và lọc (nếu sau này có API chi tiết thì thay thế)
        const data = await customerService.getAllBarbers();
        if (data && data.barbers) {
          const foundBarber = data.barbers.find(b => b._id === id);
          if (foundBarber) {
            setBarber(foundBarber);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin barber:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchBarber();
    }
  }, [id]);

  const getRoleLabel = (years) => {
    if (years >= 10) return "Master Barber";
    if (years >= 5) return "Senior Barber";
    if (years >= 3) return "Top Stylist";
    return "Junior Barber";
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen text-on-background font-body-md flex flex-col items-center justify-center">
        <Navbar />
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mt-32">progress_activity</span>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="bg-background min-h-screen text-on-background font-body-md flex flex-col items-center justify-center">
        <Navbar />
        <h2 className="text-2xl text-on-surface mt-32">Không tìm thấy thông tin Barber</h2>
        <button onClick={() => router.push('/')} className="mt-4 text-primary">Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start mb-section-padding">
          {/* Left Profile Detail */}
          <div className="lg:col-span-5 animate-[fadeIn_0.8s_ease-out_forwards] opacity-0" style={{ animationDelay: "0.1s" }}>
            <div className="relative group aspect-[4/5] overflow-hidden rounded-xl bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-0 mb-8">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt={barber.userId?.name || "Barber"} 
                src={barber.userId?.avatarUrl || "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop"} 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-primary/90 text-on-primary px-4 py-1.5 rounded-full text-label-md font-bold flex items-center gap-2 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-on-primary animate-pulse"></span>
                  Đang hoạt động
                </span>
              </div>
            </div>
            <h1 className="font-serif text-display-lg lg:text-[72px] text-primary mb-2 leading-tight">
              {barber.userId?.name || "Thợ cắt tóc"}
            </h1>
            <p className="text-headline-sm text-on-surface-variant mb-6 uppercase tracking-widest font-light">
              {getRoleLabel(barber.experienceYears || 0)}
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <span className="text-label-md text-on-surface-variant">4.9/5 (2,500+ Đánh giá)</span>
            </div>
            <button 
              onClick={() => router.push(`/booking?barber=${barber._id}`)}
              className="w-full md:w-auto bg-primary text-on-primary px-10 py-5 rounded-lg font-bold text-headline-sm hover:bg-primary-fixed-dim transition-all duration-300 shadow-xl shadow-primary/10 flex items-center justify-center gap-3 active:scale-95"
            >
              <span className="material-symbols-outlined">calendar_month</span>
              Đặt lịch với Barber này
            </button>
          </div>

          {/* Right Stats Bento Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-gutter animate-[fadeIn_0.8s_ease-out_forwards] opacity-0" style={{ animationDelay: "0.3s" }}>
            {/* Stat Card 1 */}
            <div className="bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-8 flex flex-col justify-between min-h-[220px] rounded-xl">
              <div>
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">workspace_premium</span>
                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Kinh nghiệm</h3>
              </div>
              <p className="text-primary font-headline-lg text-4xl">{barber.experienceYears || 0} Năm</p>
            </div>
            
            {/* Stat Card 2 */}
            <div className="bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-8 flex flex-col justify-between min-h-[220px] rounded-xl">
              <div>
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">military_tech</span>
                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Đánh giá TB</h3>
              </div>
              <p className="text-primary font-headline-lg text-4xl">4.9 / 5.0</p>
            </div>
            
            {/* Stat Card 3 */}
            <div className="bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-8 flex flex-col justify-between min-h-[220px] rounded-xl">
              <div>
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">groups</span>
                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Tổng lượt khách</h3>
              </div>
              <p className="text-primary font-headline-lg text-4xl">2500+</p>
            </div>
            
            {/* Stat Card 4 */}
            <div className="bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-8 flex flex-col justify-between min-h-[220px] rounded-xl">
              <div>
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">history</span>
                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Làm việc từ</h3>
              </div>
              <p className="text-primary font-headline-lg text-4xl">{new Date().getFullYear() - (barber.experienceYears || 0)}</p>
            </div>
            
            {/* About Section Card (Large) */}
            <div className="col-span-2 bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-10 mt-gutter rounded-xl">
              <h2 className="font-serif text-headline-lg text-primary mb-6 flex items-center gap-4">
                <span className="w-12 h-px bg-primary/40"></span>
                Về Master Barber
              </h2>
              <div className="space-y-6 text-body-lg text-on-surface-variant leading-relaxed max-w-3xl">
                <p className="font-light italic border-l-2 border-primary/30 pl-6 text-primary/80">
                  "Mỗi đường kéo không chỉ là một kiểu tóc, mà là lời tuyên ngôn về phong cách và sự tự tin của một quý ông."
                </p>
                <p>
                  Chuyên gia với {barber.experienceYears || 0} năm kinh nghiệm trong nghệ thuật cắt tóc cổ điển và tạo kiểu hiện đại. Từng tu nghiệp tại các học viện danh tiếng quốc tế. {barber.userId?.name || "Barber"} nổi tiếng với kỹ thuật Fade sắc sảo và khả năng tư vấn kiểu tóc phù hợp nhất với khuôn mặt và phong cách sống của từng khách hàng.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <span className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">Classic Cut</span>
                <span className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">Skin Fade</span>
                <span className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">Beard Grooming</span>
                <span className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">Hot Towel Shave</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="animate-[fadeIn_0.8s_ease-out_forwards] opacity-0" style={{ animationDelay: "0.5s" }}>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-headline-lg text-primary mb-2">Tác phẩm tiêu biểu</h2>
              <p className="text-on-surface-variant font-body-md">Những kiểu tóc tiêu biểu do {barber.userId?.name || "Thợ cắt tóc"} thực hiện</p>
            </div>
            <button className="text-primary border-b border-primary hover:text-primary-fixed-dim transition-colors text-label-md font-bold pb-1 flex items-center gap-2">
              Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer p-0">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQSD7jwQOBo41eg2KAHV9XfDkt3qjcMWihTc4lyFstVEdR8VceD3xGaMQ_WB4bmZgoVh7cD4FbjZ5b3sK7EOlKfgTpdtFj1zM2sxMCgXKrBsLqV9MkQgSVFklHRMzcaUw5eExqG_m8xvvotSu8HLVtEyCgLl50G5ivUUrIsBqxOsIG12XJZTSIMDIrNm3TQg0qWPvbv-GSgYEMB8etWu7erf8AtPSZJ0HazZSv3j1m4O8zJ5AhomFTPdxGspF9BYfo_HnRbFwb7voD" alt="Gallery" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer p-0">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmR3ifwHNh53wCcWZc1PCiJMbJ5uxdDjl4ClqYF_eEOz8Frq9I8RtZ6Q9Z1KEVywgsgSxbP9IYY4bnU1g6Bzto7O2cAhJKO-RvjHtLoLt7Xxz2qhr_erBdNVmaG6IXp_ttSDLtwlmQgzARx2Io3BtwHAZMNbLPDpcyp6IWaSClT5fATHtgE2OBOmrVSY4h83217_gFZJwl4of8JxtJtLYwFpOpluKXMdFV6pGQ9T6itqbbI-qwckOKLizpBYpCFF6tfbpH-oOONaCR" alt="Gallery" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer p-0">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRy0GyMkF71fbE6GIKzDqUbym7XxLunRaXfMPBjlBeEmDCl1l3XwmUysPXmFBFMtf50-t9OmTPUS5E5p671eGT3YBql7ko-YZ1GJJ8D52dADU-rl6ffvbWvbF2iRwCEXsnCuWgRo7eiJr4gtIUhkrltW1KDI8I0IaHK_CfD4dK3bmKCxDXV5giqqlnmQMMubqrGhca31ou8-fwcR_CJWtPzbrlZK9yxzDC_dtwQQf8QjLyLz8GLwDzrMJ_iadLJwSp3KCyeC77JcBY" alt="Gallery" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer p-0">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSGBoiOTIBUwi0TIZwQM4rPnkU6org31jX77N-SRafX9owzw_avw6i6mZBorpmXJfqrses7Pj9GiDsEcWMYTqdlajt9mahTKEmNyindLzwPX9UBxWHu2ObHFeqH38pQdz6TyVGvGYSV3OlYWsala-LcPRkXBxrit2raRz10_1mPceUsZg4apMW0C_9dAeQd86adm06tWmuejGR0hRU2A3fi2FRZx3QBKriO9EamvU_0qdSTdS5sP36KASh7Wa98CJLZDOe5ZW4k5TV" alt="Gallery" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
