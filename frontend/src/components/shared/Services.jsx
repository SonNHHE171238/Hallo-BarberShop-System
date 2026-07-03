"use client";

import React, { useState, useEffect, useRef } from "react";
import { customerServiceApi } from "@/services/service.service";

export default function Services() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const tabs = ["Tất cả", "Cắt tóc", "Uốn tóc", "Nhuộm tóc", "Combo"];

  const categoryMapping = {
    "Tất cả": null,
    "Cắt tóc": "cut",
    "Uốn tóc": "perm",
    "Nhuộm tóc": "color",
    "Combo": "combo"
  };

  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await customerServiceApi.getAllServices();
        if (data && data.services) {
          setServices(data.services);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách dịch vụ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    const targetCategory = categoryMapping[activeTab];
    if (targetCategory === null) return true;
    return service.category === targetCategory;
  });

  const formatPrice = (price) => {
    if (!price) return "0đ";
    if (price >= 1000) {
      return (price / 1000) + "k";
    }
    return price + "đ";
  };

  const getImageUrl = (service) => {
    if (service.images && service.images.length > 0 && service.images[0]) {
      return service.images[0];
    }
    // Placeholder image
    return "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop";
  };

  // Nếu không có dịch vụ nào, hiển thị skeleton hoặc thông báo
  // (Cho ngắn gọn ta chỉ hiện thông báo đang tải)

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

        {isLoading ? (
          <div className="text-center py-10 text-on-surface-variant font-body-md">Đang tải danh sách dịch vụ...</div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant font-body-md">Chưa có dịch vụ nào trong danh mục này.</div>
        ) : (
          <div className="relative group">
            {/* Scroll Buttons - Hidden on mobile */}
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
              {filteredServices.map((service) => (
                <div key={service._id || service.id} className="bento-card rounded-xl overflow-hidden flex flex-col h-full bg-surface-container-low w-full md:w-[calc(33.333%-1rem)] shrink-0 snap-center">
                  <div className="h-56 relative overflow-hidden">
                    <img className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" alt={service.name} src={getImageUrl(service)} />
                    {service.popularity >= 5 && (
                      <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded font-label-md text-label-md shadow-md">
                        Bestseller
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-1 pr-2">{service.name}</h3>
                      <span className="text-primary font-headline-md text-headline-md shrink-0">{formatPrice(service.price)}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2 min-h-[48px]">{service.description || "Dịch vụ chất lượng cao tại Hallo Barber."}</p>
                    <div className="flex items-center gap-2 text-outline mb-8 mt-auto">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span className="font-label-md text-label-md">{service.durationMinutes ? `${service.durationMinutes} phút` : "Liên hệ"}</span>
                    </div>
                    <button className="w-full border border-primary text-primary py-3 rounded-lg font-headline-sm text-headline-sm hover:bg-primary hover:text-on-primary transition-all">
                      Đặt lịch ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
