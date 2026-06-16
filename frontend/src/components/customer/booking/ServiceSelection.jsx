import React from 'react';

export default function ServiceSelection({ selectedService, onSelectService }) {
  const services = [
    {
      id: 'classic_gentleman',
      title: 'Classic Gentleman',
      desc: 'Cắt tóc, gội đầu thư giãn và tạo kiểu chuẩn quý ông.',
      duration: '45 phút',
      price: '350.000đ',
      popular: true
    },
    {
      id: 'vanguard_signature',
      title: 'The Vanguard Signature',
      desc: 'Combo cao cấp bao gồm cắt, cạo mặt bằng khăn nóng và đắp mặt nạ.',
      duration: '75 phút',
      price: '650.000đ'
    },
    {
      id: 'royal_hot_towel',
      title: 'Royal Hot Towel Shave',
      desc: 'Trải nghiệm cạo râu truyền thống với khăn nóng và tinh dầu.',
      duration: '30 phút',
      price: '250.000đ'
    },
    {
      id: 'beard_trim',
      title: 'Beard Trim & Sculpt',
      desc: 'Tạo dáng và tỉa râu chuyên nghiệp theo khuôn mặt.',
      duration: '20 phút',
      price: '180.000đ'
    }
  ];

  return (
    <section id="step-1">
      <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
        <h2 className="font-headline-md text-headline-md flex items-center gap-4 text-primary">
          <span className="w-10 h-10 rounded-full border border-primary flex items-center justify-center text-label-md">01</span>
          Chọn Dịch Vụ
        </h2>
        <span className="text-label-md font-label-md text-on-surface-variant">Phổ biến nhất</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(srv => {
          const isSelected = selectedService === srv.id;
          return (
            <div 
              key={srv.id}
              onClick={() => onSelectService(srv.id)}
              className={`glass-panel p-6 rounded-xl hover:border-primary transition-all cursor-pointer ${
                isSelected ? 'border-primary bg-surface-container-high/40' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className={`font-headline-sm ${isSelected ? 'text-primary' : ''}`}>{srv.title}</h4>
                <span 
                  className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-outline'}`}
                  style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {isSelected ? 'check_circle' : 'circle'}
                </span>
              </div>
              <p className="text-on-surface-variant text-body-md mb-6 line-clamp-2">{srv.desc}</p>
              <div className="flex justify-between items-center text-label-md font-label-md">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> {srv.duration}
                </span>
                <span className="text-primary text-lg">{srv.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
