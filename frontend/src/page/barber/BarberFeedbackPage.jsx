"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { barberService } from "@/services/barber.service";
import BarberHeaderControls from "@/components/barber/BarberHeaderControls";

export default function BarberFeedbackPage() {
  const [barberProfile, setBarberProfile] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const profileRes = await barberService.getMeBarber();
      
      if (profileRes && profileRes.barber) {
        setBarberProfile(profileRes.barber);
        
        // Fetch all feedbacks (limit=0)
        const fbRes = await axios.get(`http://localhost:5000/api/bookingfeedbacks/barber/${profileRes.barber._id}?limit=0`);
        if (fbRes.data.success) {
          setFeedbacks(fbRes.data.data);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading && !barberProfile) {
    return <div className="h-full flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col text-on-surface font-body-md h-full">
      <main className="flex-grow max-w-7xl w-full mx-auto px-gutter py-section-gap flex flex-col gap-8">
        
        {/* Header Controls for consistent look */}
        {barberProfile && (
          <BarberHeaderControls 
            profile={barberProfile} 
            subtitle="THỐNG KÊ ĐÁNH GIÁ / TỪ KHÁCH HÀNG"
          />
        )}

        {/* Feedback Header */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="font-serif text-headline-md text-primary mb-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px]">reviews</span>
                Tất Cả Đánh Giá
              </h1>
              <p className="text-on-surface-variant text-sm">
                Những lời nhận xét, góp ý từ khách hàng dành riêng cho bạn.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-low px-6 py-3 rounded-lg border border-outline-variant">
              <div className="text-center">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Đánh giá TB</p>
                <p className="font-headline-lg text-primary text-2xl flex items-center justify-center gap-1">
                  {barberProfile?.averageRating ? barberProfile.averageRating.toFixed(1) : "0.0"}
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </p>
              </div>
              <div className="w-px h-10 bg-outline-variant/50"></div>
              <div className="text-center">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Tổng lượt</p>
                <p className="font-headline-lg text-on-surface text-2xl">{barberProfile?.ratingCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Feedbacks Grid */}
          {feedbacks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {feedbacks.map((fb, idx) => (
                <div key={idx} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant hover:border-primary/50 transition-colors shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4 border-b border-outline-variant/30 pb-4">
                    <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden shrink-0 border border-outline-variant/50">
                      <img 
                        src={fb.userId?.avatarUrl ? `http://localhost:5000${fb.userId.avatarUrl}` : "https://ui-avatars.com/api/?name=Guest&background=random"} 
                        alt="Customer" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Guest&background=random"; }}
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-on-surface text-base">{fb.userId?.name || "Khách Vãng Lai"}</p>
                      <div className="flex text-gold-dim mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: star <= fb.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full border border-outline-variant/50">
                        {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    {fb.comment ? (
                      <p className="text-on-surface-variant text-sm leading-relaxed px-2 border-l-2 border-primary/30 pl-4 italic">"{fb.comment}"</p>
                    ) : (
                      <p className="text-on-surface-variant/50 text-sm italic text-center">Khách hàng không để lại bình luận.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">rate_review</span>
              <h3 className="font-headline-sm text-on-surface mb-2">Chưa có đánh giá nào</h3>
              <p className="text-on-surface-variant text-center max-w-sm">
                Bạn chưa nhận được nhận xét nào từ khách hàng. Hãy cố gắng phục vụ thật tốt để nhận những đánh giá 5 sao nhé!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
