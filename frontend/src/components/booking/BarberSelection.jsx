import React, { useEffect, useState, useMemo, useRef } from "react";
import { bookingService } from "@/services/booking.service";

export default function BarberSelection({ selectedBarber, setSelectedBarber }) {
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await bookingService.getBarbers();
        setBarbers(response.barbers || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách thợ cắt", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBarbers();
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

  const displayedBarbers = useMemo(() => {
    const keyword = normalizeText(searchTerm.trim());
    let result = [...barbers];

    if (keyword) {
      result = result.filter((barber) => {
        const name = barber.userId?.name || "";
        const title = barber.specialties?.join(", ") || "";
        return normalizeText(name).includes(keyword) || normalizeText(title).includes(keyword);
      });
    }

    return result;
  }, [searchTerm, barbers]);

  const handleSelectBarber = (barber) => {
    setSelectedBarber({ 
      ...barber, 
      id: barber._id,
      name: barber.userId?.name || "Barber",
      title: barber.specialties?.[0] || "Stylist",
      experience: `${barber.experienceYears} năm kinh nghiệm`
    });
    setSearchTerm("");
    setIsFocus(false);
  };

  return (
    <section className="space-y-6" id="step-barbers">
      <div className="flex items-center justify-between border-t border-outline-variant pt-12">
        <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Chọn Barber</h2>
        <span className="text-label-md text-outline">Bước 2/3</span>
      </div>
      
      <div className="relative" ref={dropdownRef}>
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Tìm kiếm thợ cắt..." 
            value={searchTerm}
            onFocus={() => setIsFocus(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
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
                : "Danh sách thợ cắt"}
            </div>

            <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                </div>
              ) : displayedBarbers.length > 0 ? (
                displayedBarbers.map((barber) => {
                  const name = barber.userId?.name || "Unknown Barber";
                  const firstChar = name.charAt(0).toUpperCase();
                  const title = barber.specialties?.join(", ") || "Stylist";
                  const exp = barber.experienceYears ? `${barber.experienceYears} năm kinh nghiệm` : "Đang cập nhật";
                  const imageUrl = barber.profileImageUrl;

                  return (
                    <div
                      key={barber._id}
                      onClick={() => handleSelectBarber(barber)}
                      className="flex items-center justify-between p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-primary/10 transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-primary/30 group-hover:border-primary transition-colors bg-surface-container flex items-center justify-center">
                          {imageUrl ? (
                            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary font-bold">{firstChar}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-body-lg text-on-surface font-semibold group-hover:text-primary transition-colors flex items-center">
                            {name}
                            <span className="material-symbols-outlined text-[14px] text-primary ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          </div>
                          <div className="text-label-sm text-primary uppercase tracking-widest mt-0.5">
                            {title}
                          </div>
                          <div className="text-body-sm text-on-surface-variant mt-0.5 flex items-center">
                            <span className="material-symbols-outlined text-[14px] mr-1">history_edu</span>
                            {exp}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end text-label-md text-primary mb-1">
                          <span className="material-symbols-outlined text-[16px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {barber.averageRating > 0 ? barber.averageRating.toFixed(1) : "N/A"}
                        </div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                          {barber.totalBookings} Lượt cắt
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 text-on-surface-variant">
                  Không tìm thấy thợ cắt phù hợp.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Barber Card */}
      {selectedBarber && (
        <div className="glass-card p-6 border-l-4 border-l-primary bg-surface-container shadow-[0_0_15px_rgba(233,193,118,0.15)] rounded-r-xl rounded-l-sm mt-6 flex justify-between items-center animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shrink-0 bg-surface-container-high flex items-center justify-center">
              {selectedBarber.profileImageUrl ? (
                <img src={selectedBarber.profileImageUrl} alt={selectedBarber.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-xl">{selectedBarber.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="text-label-md text-primary tracking-widest uppercase mb-1 font-bold">
                ✂️ Barber đã chọn
              </div>
              <div className="text-headline-sm font-headline-sm text-on-surface">
                {selectedBarber.name}
              </div>
              <div className="text-body-md text-on-surface-variant mt-1">
                {selectedBarber.title} • {selectedBarber.experience}
              </div>
            </div>
          </div>
          <div className="text-right">
             <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>
      )}
    </section>
  );
}
