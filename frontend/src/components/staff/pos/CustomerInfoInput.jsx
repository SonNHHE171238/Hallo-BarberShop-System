import React from 'react';

export default function CustomerInfoInput({ customerInfo, setCustomerInfo }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="glass-card p-6 rounded-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant">
            Customer Name
          </label>
          <input 
            type="text"
            name="name"
            value={customerInfo.name}
            onChange={handleChange}
            className="bg-surface-container border border-outline-variant rounded p-3 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-colors" 
            placeholder="Khách vãng lai" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant">
            Phone Number
          </label>
          <input 
            type="tel"
            name="phone"
            value={customerInfo.phone}
            onChange={handleChange}
            className="bg-surface-container border border-outline-variant rounded p-3 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/50 transition-colors" 
            placeholder="0xxx xxx xxx" 
          />
        </div>
      </div>
    </div>
  );
}
