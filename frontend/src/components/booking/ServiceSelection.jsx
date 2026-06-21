import React, { useEffect, useState, useMemo, useRef } from "react";
import { bookingService } from "@/services/booking.service";

export default function ServiceSelection({ selectedService, setSelectedService }) {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await bookingService.getServices();
        setServices(response.services || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách dịch vụ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocus(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  };

  const displayedServices = useMemo(() => {
    const keyword = normalizeText(searchTerm.trim());
    let result = [...services];

    if (keyword) {
      result = result.filter((service) =>
        normalizeText(service.name).includes(keyword) || 
        normalizeText(service.description).includes(keyword)
      );
    }

    // Sort by price ascending as per Sapo reference, fallback to 0
    return result.sort((a, b) => (a.price || 0) - (b.price || 0));
  }, [searchTerm, services]);

  const handleSelectService = (service) => {
    setSelectedService({ ...service, id: service._id });
    setSearchTerm("");
    setIsFocus(false);
  };

  return (
    <section className="space-y-6" id="step-services">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Chọn Dịch Vụ</h2>
        <span className="text-label-md text-outline">Bước 1/3</span>
      </div>

      <div className="relative" ref={dropdownRef}>
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Tìm kiếm dịch vụ..." 
            value={searchTerm}
            onFocus={() => setIsFocus(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Do not auto-clear selected service here to allow user to just look around
            }}
            className={`w-full pl-12 pr-12 py-4 bg-surface-container border transition-colors font-body-md shadow-lg outline-none ${
              isFocus ? "border-primary ring-1 ring-primary/50 rounded-t-xl" : "border-outline-variant rounded-xl"
            } text-on-surface`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Dropdown List */}
        {isFocus && (
          <div className="absolute top-full left-0 right-0 z-50 bg-surface-container-high border-x border-b border-primary/30 rounded-b-xl shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="bg-surface-container px-4 py-2 border-b border-outline-variant/30 text-label-md text-on-surface-variant uppercase tracking-widest text-xs">
              {searchTerm.trim()
                ? `Kết quả tìm kiếm cho "${searchTerm}"`
                : "Danh sách dịch vụ - Sắp xếp theo giá tăng dần"}
            </div>

            <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                </div>
              ) : displayedServices.length > 0 ? (
                displayedServices.map((service) => {
                  const firstChar = service.name ? service.name.charAt(0).toUpperCase() : "S";
                  return (
                    <div
                      key={service._id}
                      onClick={() => handleSelectService(service)}
                      className="flex items-center justify-between p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-primary/10 transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-headline-md shrink-0 border border-primary/30 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          {firstChar}
                        </div>
                        <div>
                          <div className="text-body-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
                            {service.name}
                          </div>
                          <div className="text-label-md text-on-surface-variant mt-0.5 flex items-center">
                            <span className="material-symbols-outlined text-[14px] mr-1">schedule</span>
                            {service.durationMinutes || service.duration ? `${service.durationMinutes || service.duration} Phút` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-headline-sm font-headline-sm text-primary">
                        {service.price ? service.price.toLocaleString('vi-VN') : '0'}đ
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 text-on-surface-variant">
                  Không tìm thấy dịch vụ phù hợp.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Service Card */}
      {selectedService && (
        <div className="glass-card p-6 border-l-4 border-l-primary bg-surface-container shadow-[0_0_15px_rgba(233,193,118,0.15)] rounded-r-xl rounded-l-sm mt-6 flex justify-between items-center animate-fade-in">
          <div>
            <div className="text-label-md text-primary tracking-widest uppercase mb-1 font-bold">
              ✨ Dịch vụ đã chọn
            </div>
            <div className="text-headline-sm font-headline-sm text-on-surface">
              {selectedService.name}
            </div>
            {(selectedService.durationMinutes || selectedService.duration) && (
              <div className="text-body-md text-on-surface-variant mt-1 flex items-center">
                <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                {selectedService.durationMinutes || selectedService.duration} Phút
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-headline-md font-headline-md text-primary">
              {selectedService.price ? selectedService.price.toLocaleString('vi-VN') : '0'}đ
            </div>
            <span className="material-symbols-outlined text-primary mt-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>
      )}
    </section>
  );
}
