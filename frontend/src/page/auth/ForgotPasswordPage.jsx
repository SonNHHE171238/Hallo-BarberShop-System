"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (email) {
      try {
        await authService.forgotPassword(email);
        setIsSubmitted(true);
      } catch (err) {
        setError(err.message || "Không thể gửi email. Vui lòng thử lại.");
      }
    }
    setIsLoading(false);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    cardRef.current.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className="min-h-screen bg-surface-obsidian text-on-surface flex flex-col relative overflow-hidden font-body-md">
      {/* Top Navigation */}
      <Navbar />

      <main className="relative z-10 w-full max-w-lg px-4 xl:max-w-xl flex-grow flex flex-col justify-center mx-auto mt-24 mb-16">
        {/* Brand Header */}
        <header className="z-10 mb-12 text-center">
          <h1 className="text-display-lg md:text-display-lg text-[48px] leading-tight font-bold tracking-tighter text-primary uppercase">
            HALLO BARBER
          </h1>
          <div className="h-px w-12 bg-primary mx-auto mt-2"></div>
        </header>

        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="glass-panel p-8 md:p-12 rounded-lg shadow-2xl transition-transform duration-200 ease-out hover:shadow-primary/10 border border-outline-variant"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {!isSubmitted ? (
            <div className="animate-fade-in-up">
              {/* Context Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full border border-outline-gold flex items-center justify-center bg-surface-container-low text-primary">
                  <span className="material-symbols-outlined text-4xl">lock_reset</span>
                </div>
              </div>

              <div className="text-center mb-10">
                <h2 className="font-playfair text-3xl font-bold text-on-surface mb-3 tracking-tight italic">
                  Khôi phục mật khẩu
                </h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed px-4">
                  Nhập địa chỉ email đã đăng ký của quý khách. Chúng tôi sẽ gửi một liên kết bảo mật để thiết lập lại mật khẩu.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded text-label-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-label-md text-primary uppercase tracking-widest block pl-1" htmlFor="email">
                    Địa chỉ Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors duration-200">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <input 
                      className="w-full bg-surface-container-lowest border border-outline-gold text-on-surface py-4 pl-12 pr-4 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-on-surface-variant/40 outline-none" 
                      id="email" 
                      name="email" 
                      placeholder="example@hallobarber.vn" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  className="w-full bg-primary text-on-primary font-bold py-4 rounded-lg flex items-center justify-center gap-3 active:scale-95 transition-all duration-200 hover:bg-primary-container group shadow-lg shadow-primary/10 disabled:opacity-50" 
                  type="submit"
                  disabled={isLoading}
                >
                  <span className="text-label-md uppercase tracking-wider">{isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}</span>
                  {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>}
                </button>

                <div className="pt-4 text-center">
                  <Link 
                    className="text-label-md text-on-surface-variant hover:text-primary transition-colors duration-300 flex items-center justify-center gap-2 group" 
                    href="/login"
                  >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
                    Trở về Đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-4 animate-fade-in-up">
              <div className="mb-6 text-primary flex justify-center">
                <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="font-playfair text-2xl font-bold text-on-surface mb-2 italic">Kiểm tra Email của bạn</h3>
              <p className="text-body-md text-on-surface-variant mb-8">
                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của quý khách. Vui lòng kiểm tra hộp thư đến (hoặc thư rác).
              </p>
              <button 
                className="w-full border border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/10 transition-colors" 
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
              >
                Thử lại với Email khác
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Identity */}
      <div className="w-full relative z-10 mt-auto">
        <Footer />
      </div>

      {/* Decorative Side Images for Large Screens */}
      <div className="hidden xl:block fixed right-0 top-0 h-full w-1/4 z-0 pointer-events-none opacity-40">
        <div 
          className="h-full w-full bg-cover bg-center grayscale mix-blend-luminosity border-l border-outline-gold" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5jZagRaVNPiL7PkDkc1FfD49HAhHmU0Jvla_oIXrkxVZDTbKaz8gNugDocy8sSWD2ZFoxkDpvlL0DNDBIl3edRqWrhBK43nKqrqY48UXNp9X1Pf0LyInd0CQZgQFaTR4hri2Fvc6eJS6uhshRbMdqb2GcGECyhdfHEBIuYCENdksNhR0ZeFv1XihVW0l_eRons9i7Sbc5LNa0sDBcUjvqbWkab7Ox9BRxoJls8QTSTMA2r1MAPuA-OO1RAwmh1K5a11hrpfGZSJBO')" }}
        ></div>
      </div>
      <div className="hidden xl:block fixed left-0 top-0 h-full w-1/4 z-0 pointer-events-none opacity-40">
        <div 
          className="h-full w-full bg-cover bg-center grayscale mix-blend-luminosity border-r border-outline-gold" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8O5SbT9OpyzKT_c8L8Q0K1EI4XRgOXQdo8QO6I6Z9qqx01F__ELBhGWNz6OrKJaCm5pt7pGlIjYEroPQMd-RZno1ADzSte2OyeI-EmvIFKHZ4eMCskypREAnsQuNqzV2sTWWmjRR10TwAuGZvvzRsLLgtoWLrSPsTpUWiyUNuUMlGmMGKNaMBzE5euQJX6I7qGZZ_nDXd2U9pRqTO1mHrZUJNUyMpPuEsafpkw0gXTdgSr44YkzhgiSpQ_T3fN4ts2x08PI84WMAt')" }}
        ></div>
      </div>
    </div>
  );
}
