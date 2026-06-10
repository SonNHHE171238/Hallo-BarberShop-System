import React from "react";

const mockServices = [
  {
    id: 1,
    name: "Cắt Tóc Executive",
    description: "Kỹ thuật cắt tỉa đỉnh cao, gội sấy tạo kiểu chuyên nghiệp phối hợp cùng liệu trình massage thư giãn.",
    duration: "45 Phút",
    price: 450000,
    isPopular: false
  },
  {
    id: 2,
    name: "Combo Di Sản",
    description: "Trải nghiệm trọn vẹn: Cắt tóc, tỉa râu nóng, chăm sóc da mặt và massage cổ vai gáy.",
    duration: "90 Phút",
    price: 850000,
    isPopular: true
  },
  {
    id: 3,
    name: "Tỉa Râu Nghệ Thuật",
    description: "Điêu khắc khuôn râu tinh tế với khăn nóng và dao cạo truyền thống.",
    duration: "30 Phút",
    price: 300000,
    isPopular: false
  }
];

export default function ServiceSelection({ selectedService, setSelectedService }) {
  return (
    <section className="space-y-6" id="step-services">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Chọn Dịch Vụ</h2>
        <span className="text-label-md text-outline">Bước 1/3</span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {mockServices.map(service => {
          const isSelected = selectedService?.id === service.id;
          return (
            <div 
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`glass-card p-6 flex justify-between items-center cursor-pointer group transition-all duration-300 border-l-4 ${
                isSelected 
                  ? 'border-l-primary bg-surface-container-high border-outline-variant/50 shadow-[0_0_15px_rgba(233,193,118,0.15)]' 
                  : 'border-l-transparent hover:border-l-primary hover:bg-surface-container-high'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">{service.name}</h3>
                  {service.isPopular && (
                    <span className="bg-primary-container text-on-primary-container text-[10px] px-2 py-0.5 font-bold rounded uppercase tracking-widest">
                      Phổ biến
                    </span>
                  )}
                </div>
                <p className="text-body-md text-on-surface-variant max-w-md">{service.description}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <span className="flex items-center text-label-md text-primary">
                    <span className="material-symbols-outlined text-sm mr-1">schedule</span> {service.duration}
                  </span>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-headline-md font-headline-md text-primary">
                  {service.price.toLocaleString('vi-VN')}đ
                </p>
                {isSelected ? (
                  <span className="material-symbols-outlined text-primary mt-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : (
                  <button className="mt-2 text-label-md text-on-surface-variant group-hover:text-primary flex items-center justify-end">
                    Chọn <span className="material-symbols-outlined ml-1">add_circle</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
