"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/bookingfeedbacks/testimonials`);
        if (res.data && res.data.success) {
          setTestimonials(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="py-24 bg-surface-container-low border-t border-outline-variant">
      <div className="max-w-[1200px] mx-auto px-4 md:px-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-16 text-center">Khách hàng nói gì về chúng tôi</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant font-body-md">
            Chưa có đánh giá nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t._id} className="bg-surface p-8 rounded-xl border border-outline-variant relative flex flex-col h-full hover:border-primary/50 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-6 right-6 pointer-events-none">format_quote</span>
                <div className="flex gap-1 mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`material-symbols-outlined text-sm ${i < t.rating ? 'text-primary' : 'text-outline-variant'}`} 
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 italic flex-1 relative z-10 line-clamp-4">
                  &quot;{t.comment}&quot;
                </p>
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-outline-variant/30 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 shrink-0">
                    <img 
                      src={t.customerAvatar} 
                      alt={t.customerName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.customerName)}&background=random`;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-on-surface font-headline-sm text-headline-sm truncate">{t.customerName}</p>
                    <p className="text-outline font-label-md text-label-md truncate">{t.customerRole}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
