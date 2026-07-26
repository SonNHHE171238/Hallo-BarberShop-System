"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { customerService } from "@/services/customer.service";

export default function BarberProfilePage({ id }) {
  const router = useRouter();
  const [barber, setBarber] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
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
        
        // Lấy 3 đánh giá gần nhất
        try {
          const res = await axios.get(`http://localhost:5000/api/bookingfeedbacks/barber/${id}?limit=3`);
          if (res.data.success) {
            setFeedbacks(res.data.data);
          }
        } catch (fbErr) {
          console.error("Lỗi khi tải feedbacks:", fbErr);
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
    if (years >= 3) return "Senior Barber";
    if (years > 1) return "Junior Barber";
    return "Barber";
  };

  const computedExp = barber?.workingSince 
    ? Math.max(0, new Date().getFullYear() - new Date(barber.workingSince).getFullYear()) 
    : (barber?.experienceYears || 0);

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
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`px-4 py-1.5 rounded-full text-label-md font-bold flex items-center gap-2 backdrop-blur-sm w-max ${barber.isAvailable !== false ? 'bg-primary/90 text-on-primary' : 'bg-surface-variant/90 text-on-surface-variant border border-outline-variant'}`}>
                  <span className={`w-2 h-2 rounded-full ${barber.isAvailable !== false ? 'bg-on-primary animate-pulse' : 'bg-on-surface-variant'}`}></span>
                  {barber.isAvailable !== false ? 'Đang hoạt động' : 'Tạm vắng'}
                </span>
                {barber.level === 'vip' && (
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-surface-container-lowest px-4 py-1.5 rounded-full text-label-md font-bold flex items-center gap-2 backdrop-blur-sm shadow-lg border border-yellow-300/50 w-max">
                    <span className="material-symbols-outlined text-[16px] animate-bounce">workspace_premium</span>
                    Barber VIP
                  </span>
                )}
              </div>
            </div>
            <h1 className="font-serif text-display-lg lg:text-[72px] text-primary mb-2 leading-tight flex items-center gap-4 flex-wrap">
              {barber.userId?.name || "Thợ cắt tóc"}
              {barber.level === 'vip' && (
                <span className="material-symbols-outlined text-yellow-500 text-[40px] md:text-[50px] drop-shadow-md" title="Barber VIP">verified</span>
              )}
            </h1>
            <p className="text-headline-sm text-on-surface-variant mb-6 uppercase tracking-widest font-light">
              {getRoleLabel(computedExp)}
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <span className="text-label-md text-on-surface-variant">
                {barber.averageRating ? barber.averageRating.toFixed(1) : "0.0"}/5 ({barber.ratingCount || 0} Đánh giá)
              </span>
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
              <p className="text-primary font-headline-lg text-4xl">
                {computedExp} Năm
              </p>
            </div>
            
            {/* Stat Card 2 */}
            <div className="bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-8 flex flex-col justify-between min-h-[220px] rounded-xl">
              <div>
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">military_tech</span>
                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Đánh giá TB</h3>
              </div>
              <p className="text-primary font-headline-lg text-4xl">{barber.averageRating ? barber.averageRating.toFixed(1) : "0.0"} / 5.0</p>
            </div>
            
            {/* Stat Card 3 */}
            <div className="bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-8 flex flex-col justify-between min-h-[220px] rounded-xl">
              <div>
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">groups</span>
                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Tổng lượt khách</h3>
              </div>
              <p className="text-primary font-headline-lg text-4xl">
                {(barber.totalBookings || 0) < 100 
                  ? "100" 
                  : Math.floor((barber.totalBookings || 0) / 10) * 10}+
              </p>
            </div>
            
            {/* Stat Card 4 */}
            <div className="bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-8 flex flex-col justify-between min-h-[220px] rounded-xl">
              <div>
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">history</span>
                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Làm việc từ</h3>
              </div>
              <p className="text-primary font-headline-lg text-4xl">
                {barber.workingSince ? new Date(barber.workingSince).getFullYear() : (new Date().getFullYear() - (barber.experienceYears || 0))}
              </p>
            </div>
            
            {/* About Section Card (Large) */}
            <div className="col-span-2 bg-surface-container border border-outline-variant hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(233,193,118,0.15)] p-10 mt-gutter rounded-xl">
              <h2 className="font-headline-lg text-primary mb-6 flex items-center gap-4">
                <span className="w-12 h-px bg-primary/40"></span>
                Về Master Barber
              </h2>
              <div className="space-y-6 text-body-lg text-on-surface-variant leading-relaxed max-w-3xl whitespace-pre-line">
                <p>
                  {barber.bio || `Chuyên gia với ${barber.experienceYears || 0} năm kinh nghiệm trong nghệ thuật cắt tóc cổ điển và tạo kiểu hiện đại.`}
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                {barber.specialties && barber.specialties.length > 0 ? (
                  barber.specialties.map((tag, idx) => (
                    <span key={idx} className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">
                      {tag}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">Classic Cut</span>
                    <span className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">Skin Fade</span>
                    <span className="bg-surface-container-high text-on-surface-variant px-4 py-2 border border-outline-variant rounded-md text-label-md">Beard Grooming</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="animate-[fadeIn_0.8s_ease-out_forwards] opacity-0 mt-24 lg:mt-32 mb-24 lg:mb-32" style={{ animationDelay: "0.5s" }}>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-headline-lg text-primary mb-2">Tác phẩm tiêu biểu</h2>
              <p className="text-on-surface-variant font-body-md">Những kiểu tóc tiêu biểu do {barber.userId?.name || "Thợ cắt tóc"} thực hiện</p>
            </div>

          </div>
          {barber.gallery && barber.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {barber.gallery.map((url, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer p-0 shadow-sm hover:shadow-md transition-shadow">
                  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={url} alt="Featured work" loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">photo_library</span>
              <p className="text-on-surface-variant font-body-md text-center">Master Barber này chưa cập nhật tác phẩm tiêu biểu nào.</p>
            </div>
          )}
        </section>

        {/* Feedback Section */}
        <section className="animate-[fadeIn_0.8s_ease-out_forwards] opacity-0 mb-24" style={{ animationDelay: "0.6s" }}>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-headline-lg text-primary mb-2">Đánh giá từ khách hàng</h2>
              <p className="text-on-surface-variant font-body-md">Những nhận xét gần đây nhất về {barber.userId?.name || "Thợ cắt tóc"}</p>
            </div>
          </div>
          
          {feedbacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {feedbacks.map((fb, idx) => (
                <div key={idx} className="bg-surface-container rounded-xl p-6 border border-outline-variant hover:border-primary/50 transition-colors shadow-sm hover:shadow-md flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4 border-b border-outline-variant/30 pb-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden shrink-0 border border-outline-variant/50">
                      <img 
                        src={fb.userId?.avatarUrl ? `http://localhost:5000${fb.userId.avatarUrl}` : "https://ui-avatars.com/api/?name=Guest&background=random"} 
                        alt="Customer" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Guest&background=random"; }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{fb.userId?.name || "Khách Vãng Lai"}</p>
                      <div className="flex text-gold-dim mt-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: star <= fb.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-on-surface-variant">
                      {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  
                  <div className="flex-grow flex items-center justify-center">
                    {fb.comment ? (
                      <p className="text-on-surface-variant text-sm italic text-center leading-relaxed px-4">"{fb.comment}"</p>
                    ) : (
                      <p className="text-on-surface-variant/50 text-sm italic text-center">Khách hàng không để lại bình luận.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">rate_review</span>
              <p className="text-on-surface-variant font-body-md text-center">Chưa có đánh giá nào cho Barber này.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
