import React from "react";

const mockBarbers = [
  {
    id: 1,
    name: "Minh 'Old Soul'",
    title: "Master Barber",
    experience: "15 năm kinh nghiệm về phong cách Classic.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATDW8sguZwvGkpdLTp9KRc3IOYrE5Zcz_eHhWEfCcsW2-k2cmNb5DMcOfo6pctrNjFT-DQd0OvGDmNFZzEB_fDyYNmtyroAatCfgtO_-jvrmepHnBtJqL5FFTitVo8-T8ah3MKHkofR3CCeyT0zvDn_bdf88dUU8y89TXl9OH-wacjfzJrWr05ufA7Gq494hIkPdd36txYLNvnuYKhEIWrcTFyHKA_uEaea5iDRqz8O-wzCY3LKhiB-wlh3AqBOVBL7njr0pyirNEt"
  },
  {
    id: 2,
    name: "Hoàng Anh",
    title: "Artisan Barber",
    experience: "Chuyên gia về Freestyle và Fade hiện đại.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuBvS6pQmXL8r2qJc_BcM9xp1BnlH4rrnC__QIjf_ujpuTZHBUJAP6qUdlfEQ3LWCA2b3qFPkUuXBO7tHiLpkSRmP4DhaYdQx1-PgyyuzU5vjNZ4kHoGhhrN6NtVoPv3ziIqGo_SwXRopI_8WbpC_FIo-kKyjbZe2iyR1XG_GDooG8nyGHwWdaLRP5JQiWSb61bs43ah0Hv33SoOWtBWarQnvTU_Brb57v-IvE2u0PAXGahS4NgUzq5r9byJOwEgLkzK6qpzb69Cb8"
  }
];

export default function BarberSelection({ selectedBarber, setSelectedBarber }) {
  return (
    <section className="space-y-6" id="step-barbers">
      <div className="flex items-center justify-between border-t border-outline-variant pt-12">
        <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Chọn Barber</h2>
        <span className="text-label-md text-outline">Bước 2/3</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockBarbers.map(barber => {
          const isSelected = selectedBarber?.id === barber.id;
          return (
            <div 
              key={barber.id}
              onClick={() => setSelectedBarber(barber)}
              className={`glass-card p-4 flex items-center space-x-4 cursor-pointer group transition-all duration-300 border ${
                isSelected ? 'border-primary bg-surface-container-high shadow-[0_0_15px_rgba(233,193,118,0.15)]' : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className={`w-24 h-24 flex-shrink-0 transition-all duration-500 overflow-hidden rounded-lg ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>
                <img className="w-full h-full object-cover" src={barber.imageUrl} alt={barber.name} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-headline-sm font-headline-sm text-on-surface">{barber.name}</h4>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
                <p className="text-label-md text-primary font-bold">{barber.title}</p>
                <p className="text-body-md text-on-surface-variant mt-1">{barber.experience}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
