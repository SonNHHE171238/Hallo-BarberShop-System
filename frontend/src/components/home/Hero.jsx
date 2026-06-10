import React from "react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[80vh] lg:min-h-[600px] lg:h-[819px] flex items-center bg-surface-container-low border-b border-outline-variant overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Modern high-tech barbershop interior"
          className="w-full h-full object-cover object-center"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV4eLCS4Ah3ipwWnyOlSVxF-07u4DAsGuHDvIlCEQyxjXz5mSO9gZ3rDT3Mdb3Pr0gOrlqjeh_F3BILt93zAUqSzQoQafGo_R7sdWYxHPLaBlguIPU5RxXPUbaMrwL8sJYkr54Nj6rYSNQkHcCYY5KQ0z-4XYAG9ccAWqqTFHtLn3bcTbmMvwHoHg35rBrWQltlywKa_o1TQRZcGMHKKV__oY2e2OkKn6yri-jMvQfSgM_eKZ4Ho4l8Xq0aUBHAtrO7UQitHpy2-bJ"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-16">
        <div className="md:col-span-10 lg:col-span-8 flex flex-col items-start space-y-6 sm:space-y-8">
          <div className="inline-flex items-center space-x-2 bg-surface-container-highest px-3 py-1.5 rounded-sm border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-[10px] sm:text-xs text-secondary uppercase tracking-widest">
              Accepting Appointments
            </span>
          </div>
          <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-[64px] text-on-surface uppercase leading-none tracking-tight">
            Precision<br className="hidden sm:block" /> Engineering <br /> For
            Your Aesthetic.
          </h1>
          <p className="font-body-lg text-base sm:text-lg lg:text-xl text-on-surface-variant max-w-xl border-l-2 border-primary-container pl-4 sm:pl-6 py-1">
            Experience high-tech grooming in an environment designed for ultimate
            clarity and focus. No vintage clichés, just architectural precision.
          </p>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 pt-4 sm:pt-6">
            <button className="w-full sm:w-auto bg-[#3B82F6] text-[#F8FAFC] font-label-sm text-sm uppercase px-8 py-4 rounded-sm tracking-widest transition-all duration-300 electric-glow hover:bg-primary-container active:scale-95 text-center">
              Book Now
            </button>
            <button className="w-full sm:w-auto bg-transparent border border-outline-variant text-on-surface font-label-sm text-sm uppercase px-8 py-4 rounded-sm tracking-widest hover:border-primary hover:text-primary transition-all duration-300 active:scale-95 text-center">
              View Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
