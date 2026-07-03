import React from "react";

export default function BookingStepper({ hasService, hasBarber, hasTime }) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-8 text-label-md">
        <div className={`flex items-center space-x-2 pb-2 border-b-2 text-primary border-primary`}>
          <span className="w-6 h-6 rounded-full border border-primary flex items-center justify-center text-[10px]">01</span>
          <span>DỊCH VỤ</span>
        </div>
        <div className={`flex items-center space-x-2 pb-2 border-b-2 ${hasService ? 'text-primary border-primary' : 'text-outline border-transparent'}`}>
          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${hasService ? 'border-primary' : 'border-outline'}`}>02</span>
          <span>BARBER</span>
        </div>
        <div className={`flex items-center space-x-2 pb-2 border-b-2 ${hasBarber ? 'text-primary border-primary' : 'text-outline border-transparent'}`}>
          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${hasBarber ? 'border-primary' : 'border-outline'}`}>03</span>
          <span>THỜI GIAN</span>
        </div>
      </div>
    </div>
  );
}
