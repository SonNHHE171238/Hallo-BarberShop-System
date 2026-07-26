"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { customerService } from "@/services/customer.service";

export default function Barbers() {
  const router = useRouter();
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setIsLoading(true);
        const data = await customerService.getAllBarbers();
        if (data && data.barbers) {
          // Chỉ lấy những barber đã cấu hình hồ sơ
          const configuredBarbers = data.barbers.filter(barber => 
            barber.bio || barber.workingSince || (barber.experienceYears && barber.experienceYears > 0) || (barber.gallery && barber.gallery.length > 0) || (barber.specialties && barber.specialties.length > 0)
          );
          setBarbers(configuredBarbers);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách thợ cắt tóc:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  const getRoleLabel = (years) => {
    if (years >= 3) return "Senior Barber";
    if (years > 1) return "Junior Barber";
    return "Barber";
  };

  const getComputedExp = (barber) => {
    return barber.workingSince 
      ? Math.max(0, new Date().getFullYear() - new Date(barber.workingSince).getFullYear()) 
      : (barber.experienceYears || 0);
  };

  const getImageUrl = (barber) => {
    if (barber.userId?.avatarUrl) return barber.userId.avatarUrl;
    // Ảnh mặc định nếu không có
    return "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop";
  };

  return (
    <section id="team" className="py-24 bg-surface max-w-[1200px] mx-auto px-4 md:px-16">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-16 text-center">Đội ngũ của chúng tôi</h2>

      {isLoading ? (
        <div className="text-center py-10 text-on-surface-variant font-body-md">Đang tải danh sách thợ cắt tóc...</div>
      ) : barbers.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant font-body-md">Chưa có thông tin thợ cắt tóc.</div>
      ) : (
        <div className="relative group">
          <button 
            onClick={scrollLeft} 
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 p-3 bg-surface text-on-surface rounded-full shadow-lg border border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button 
            onClick={scrollRight} 
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 p-3 bg-surface text-on-surface rounded-full shadow-lg border border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 pb-8 pt-4 px-4 -mx-4 scroll-hide snap-x snap-mandatory">
            {barbers.map((barber) => (
              <div 
                key={barber._id} 
                onClick={() => router.push(`/barber-profile/${barber._id}`)}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-outline-variant w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] shrink-0 snap-center cursor-pointer"
              >
                <img
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                  alt={barber.userId?.name || "Barber"}
                  src={getImageUrl(barber)}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-primary font-label-md text-label-md uppercase mb-1 flex items-center gap-2">
                    {getRoleLabel(getComputedExp(barber))}
                    {barber.level === 'vip' && (
                      <span className="material-symbols-outlined text-[16px] text-yellow-500 drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }} title="Barber VIP">workspace_premium</span>
                    )}
                  </p>
                  <h3 className="text-white font-headline-md text-headline-md">{barber.userId?.name || "Thợ cắt tóc"}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
