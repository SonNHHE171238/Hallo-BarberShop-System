import React from "react";

export default function BookingStepper({ currentStep }) {
  const steps = [
    { num: 1, label: "Dịch vụ" },
    { num: 2, label: "Barber" },
    { num: 3, label: "Thời gian" },
    { num: 4, label: "Thông tin" }
  ];

  return (
    <div className="mb-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep >= step.num;
          const isCurrent = currentStep === step.num;
          
          return (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-on-primary border border-primary' 
                    : 'bg-surface-container border border-outline text-outline'
                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                  {step.num}
                </div>
                <span className={`mt-2 font-label-md text-label-md ${
                  isActive ? 'text-primary' : 'text-outline'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`h-[2px] flex-grow mx-3 transition-colors duration-300 ${
                  currentStep > step.num ? 'bg-primary' : 'bg-outline-variant'
                }`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
