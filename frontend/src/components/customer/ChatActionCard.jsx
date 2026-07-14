"use client";

import React from 'react';

export default function ChatActionCard() {
  const handleOpenChat = () => {
    // Phóng ra custom event để ChatbotWidget bắt lấy
    window.dispatchEvent(new Event('open-chatbot'));
  };

  return (
    <div className="col-span-12 md:col-span-4 bg-surface-container-low border border-outline-variant rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden relative group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
          <span className="material-symbols-outlined text-[32px] text-primary">chat_bubble</span>
        </div>
        
        <div>
          <h3 className="font-headline-sm text-xl text-on-surface serif-title mb-2">Cần Hỗ Trợ?</h3>
          <p className="font-body-md text-on-surface-variant max-w-[200px] mx-auto text-sm">
            Chat ngay với trợ lý AI hoặc chuyên gia của chúng tôi để được tư vấn dịch vụ.
          </p>
        </div>
      </div>

      <button 
        onClick={handleOpenChat}
        className="relative z-10 w-full mt-6 py-3 bg-transparent border border-primary text-primary hover:bg-primary hover:text-on-primary font-label-md font-bold uppercase tracking-widest rounded-xl transition-all duration-300"
      >
        Trò Chuyện Ngay
      </button>
    </div>
  );
}
