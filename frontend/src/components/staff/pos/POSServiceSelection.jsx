import React from 'react';

export const posMockServices = [
  { id: 1, name: "The Heritage Cut", duration: "45 mins", price: 350000 },
  { id: 2, name: "Beard Sculpt", duration: "30 mins", price: 200000 },
  { id: 3, name: "Hot Towel Shave", duration: "30 mins", price: 250000 },
];

export default function POSServiceSelection({ selectedServices, toggleService }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Select Services</h2>
        <span className="font-label-md text-label-md text-gold-dim">{posMockServices.length} Services Available</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posMockServices.map((service) => {
          const isSelected = selectedServices.some(s => s.id === service.id);
          
          return (
            <div 
              key={service.id}
              onClick={() => toggleService(service)}
              className={`glass-card p-4 rounded-lg cursor-pointer group transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden ${
                isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary border-outline-variant'
              }`}
            >
              <div className="relative z-10">
                <h3 className="font-headline-sm text-on-surface group-hover:text-primary">{service.name}</h3>
                <p className="font-label-md text-on-surface-variant text-sm">{service.duration}</p>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <span className="font-headline-sm text-primary">{service.price.toLocaleString('vi-VN')}đ</span>
                <span 
                  className={`material-symbols-outlined transition-colors ${isSelected ? 'text-primary' : 'text-outline-variant group-hover:text-primary'}`}
                  style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {isSelected ? 'check_circle' : 'add_circle'}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
