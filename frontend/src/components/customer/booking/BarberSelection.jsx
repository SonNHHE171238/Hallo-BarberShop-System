import React from 'react';

export default function BarberSelection({ selectedBarber, onSelectBarber }) {
  const barbers = [
    {
      id: 'hung_tran',
      name: 'Hùng Trần',
      role: 'Master Hallo Barber',
      rating: '4.9 (120+)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUd614ZnsgHX5xOA1vTI9WHpLOm6UyzrxP1vMylabDBSYd2M8mohAybP1Yn_CU_q1Ycs8iAfyGbcdCUKvCMkyZ-LWXSAF3svkuzqNChpk-sd1E5NxjGoXOZ9KcLYcfaXdEETehgaIMgiPlByDS8_91OLq6FjNCiZMmWXl3rV2PCrv4MF7x2zlK67SG1syND9T9p53vuFad82oW223-BTVM3fwikR9ERqoplldJ_DkvN_SC24IDJadvGiSgXjKHzykwHAuglbwpWaeo'
    },
    {
      id: 'alex_nguyen',
      name: 'Alex Nguyễn',
      role: 'Stylist',
      rating: '4.8 (85+)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgdniEsKBhh_I1ED-O-sufN7NlJNMs4nn6SldoSN3iD29adpokNiqse1wVF5Vbrh3tycLedui5the9rorI7oZ8UqAYPTZG_nuGBRJiy9uTb1UPbMTWaWXZ1i9-xMRw7729XBWknUKrMsUe_pA3p5VAAMhD3fi-AasdSzpPKaHAExdxnAhOHb84sTrxynXZzKH6v1L1Oran3aBkWcHd6Js8xQTz9euXZm80YcmfLMzElE7ME2buBBq-Qc03FdN4eYuEHnJUBafqpWZD'
    },
    {
      id: 'minh_phan',
      name: 'Minh Phan',
      role: 'Senior Hallo Barber',
      rating: '5.0 (42)',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOS4K16uwBCO5bY7WfMdxtR4Ygjz3TD-FxuR9ga0fG5C2ijQrf_kkZtwUliws8_jlw4vVSQRDucmoAJvYENfNcnDzjQ7sHBDI3OgD2Q_anErbu36xTT_34Z40pZ_TR376T8Tf-GAj5rGbTQQvDlTWHPs9Yv7bO6iWyfaY-LsQ7emn93pTO_YfIq2vA0-ddjda0DOhZx6ST0DBfB6Tz6-nHeZfqC3X222YwHGdSq5FAkns4Kcju2oG8nCImeRQd7DY_IE5gYz_gp_KE'
    }
  ];

  return (
    <section id="step-2">
      <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
        <h2 className="font-headline-md text-headline-md flex items-center gap-4 text-primary">
          <span className="w-10 h-10 rounded-full border border-primary flex items-center justify-center text-label-md">02</span>
          Chọn Hallo Barber
        </h2>
        <span className="text-label-md font-label-md text-on-surface-variant underline cursor-pointer">Xem tất cả</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {barbers.map(barber => {
          const isSelected = selectedBarber === barber.id;
          return (
            <div 
              key={barber.id}
              onClick={() => onSelectBarber(barber.id)}
              className="group cursor-pointer"
            >
              <div className={`relative aspect-[3/4] rounded-xl overflow-hidden mb-4 border transition-all duration-500 ${isSelected ? 'border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                <img 
                  alt={`Hallo Barber ${barber.name}`}
                  className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'grayscale-0 scale-100' : 'grayscale scale-110 group-hover:grayscale-0 group-hover:scale-100'}`} 
                  src={barber.img}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className={`${isSelected ? 'text-primary' : 'text-on-surface'} font-headline-sm`}>{barber.name}</p>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest">{barber.role}</p>
                </div>
                <div className={`absolute top-4 right-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className="material-symbols-outlined text-primary bg-surface-obsidian rounded-full p-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-label-md font-label-md">{barber.rating}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
