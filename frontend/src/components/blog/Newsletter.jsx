import React from "react";

export default function Newsletter() {
  return (
    <section className="px-margin-mobile md:px-margin-desktop py-section-padding bg-surface-container-low border-y border-outline-variant relative overflow-hidden">
      <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full"></div>
      <div className="max-w-container-max mx-auto flex flex-col items-center text-center relative z-10">
        <h2 className="text-white font-headline-lg text-headline-lg mb-4">
          Đăng ký nhận tin từ Heritage Corner
        </h2>
        <p className="text-on-surface-variant font-body-lg text-body-lg mb-8 max-w-xl">
          Cập nhật những xu hướng tóc mới nhất và các bí quyết chăm sóc nam giới độc quyền trực tiếp qua email của bạn.
        </p>
        <form className="flex flex-col md:flex-row gap-4 w-full max-w-lg" onSubmit={(e) => e.preventDefault()}>
          <input 
            className="bg-surface-dim border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-6 py-4 flex-grow outline-none text-on-surface" 
            placeholder="Địa chỉ email của bạn" 
            type="email" 
          />
          <button 
            type="button"
            className="bg-primary text-on-primary px-8 py-4 rounded-lg font-headline-sm text-headline-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
          >
            Đăng Ký Ngay
          </button>
        </form>
      </div>
    </section>
  );
}
