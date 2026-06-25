"use client";

import React, { useState, useEffect } from "react";
import { customerService } from "@/services/customer.service";

export default function Barbers() {
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setIsLoading(true);
        const data = await customerService.getAllBarbers();
        if (data && data.barbers) {
          setBarbers(data.barbers);
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
    if (years >= 10) return "Master Barber";
    if (years >= 5) return "Senior Barber";
    if (years >= 3) return "Top Stylist";
    return "Junior Barber";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {barbers.slice(0, 8).map((barber) => (
            <div key={barber._id} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-outline-variant">
              <img
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                alt={barber.userId?.name || "Barber"}
                src={getImageUrl(barber)}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-primary font-label-md text-label-md uppercase mb-1">
                  {getRoleLabel(barber.experienceYears || 0)}
                </p>
                <h3 className="text-white font-headline-md text-headline-md">{barber.userId?.name || "Thợ cắt tóc"}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
