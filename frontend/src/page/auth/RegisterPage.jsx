"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const router = useRouter();
  const { checkAuth } = useAuth();
  const cardRef = useRef(null);

  useEffect(() => {
    // Kích hoạt animation khi component mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.register(formData.name, formData.email, formData.phone, formData.password);
      setStep(2); // Go to OTP step
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      return setError('Vui lòng nhập đủ 6 số OTP');
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.verifyOtp(formData.email, otp);
      await checkAuth(); // Restore session
      router.push('/'); // Redirect
    } catch (err) {
      setError(err.message || 'Xác thực OTP thất bại.');
    } finally {
      setIsLoading(false);
    }
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
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Registration Container */}
      <main 
        className="relative z-10 w-full max-w-[500px] px-margin-mobile md:px-0 py-section-padding mt-16 flex-grow flex items-center justify-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="glass-panel border border-outline-variant p-8 md:p-12 shadow-2xl relative w-full rounded-xl">
          {/* Decorative Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-primary"></div>
          
          <header className="text-center mb-10">
            <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight mb-2 uppercase">Đăng Ký Thành Viên</h1>
            <p className="text-body-md font-body-md text-on-surface-variant">Trải nghiệm phong cách quý ông thượng lưu cùng HALLO BARBER.</p>
          </header>

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              {error && (
                <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded text-label-md">
                  {error}
                </div>
              )}
              {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Họ và Tên</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">person</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                  placeholder="Nguyễn Văn A" 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                  placeholder="email@vi-du.com" 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Số Điện Thoại</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">call</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                  placeholder="090 123 4567" 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Mật Khẩu</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                    placeholder="••••••••" 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-label-md font-label-md text-primary uppercase tracking-widest">Xác Nhận</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">verified_user</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all rounded placeholder:text-outline/50 outline-none" 
                    placeholder="••••••••" 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Promotion Checkbox */}
            <div className="flex items-start gap-3">
              <div className="relative flex items-center pt-1">
                <input 
                  className="w-5 h-5 rounded bg-surface-container border-outline-gold text-primary focus:ring-primary/50 focus:ring-offset-0 transition-all cursor-pointer" 
                  id="terms" 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
              </div>
              <label className="text-label-md font-body-md text-on-surface-variant cursor-pointer select-none leading-relaxed" htmlFor="terms">
                Tôi đồng ý với việc nhận email về các chương trình khuyến mãi từ bên cửa hàng.
              </label>
            </div>

            {/* Action Button */}
            <button 
              className="w-full bg-primary text-on-primary py-4 text-body-lg font-bold hover:bg-gold-dim transition-all duration-300 transform active:scale-95 shadow-lg shadow-primary/10 rounded uppercase tracking-widest disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Đang xử lý...' : 'Tạo Tài Khoản Ngay'}
            </button>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-body-md font-body-md text-on-surface-variant">
                Bạn đã có tài khoản? 
                <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1 transition-all" href="/login">Đăng nhập tại đây</Link>
              </p>
            </div>
          </form>
          ) : (
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="animate-fade-in-up"
              style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full border border-outline-gold flex items-center justify-center bg-surface-container-low text-primary mb-4">
                  <span className="material-symbols-outlined text-4xl">mark_email_read</span>
                </div>
                <h2 className="font-playfair text-2xl font-bold text-on-surface mb-2 italic">Xác Thực Mã OTP</h2>
                <p className="text-body-md text-on-surface-variant">
                  Vui lòng nhập mã gồm 6 chữ số đã được gửi đến email <span className="text-primary">{formData.email}</span>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                {error && (
                  <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded text-label-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-label-md text-primary uppercase tracking-widest block pl-1">Mã OTP</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">password</span>
                    <input 
                      className="w-full bg-surface-container-lowest border border-outline-gold text-on-surface py-4 pl-12 pr-4 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-on-surface-variant/40 outline-none text-center tracking-[0.5em] font-bold" 
                      placeholder="------" 
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/[^0-9]/g, ''));
                        setError('');
                      }}
                      required
                    />
                  </div>
                </div>

                <button 
                  className="w-full bg-primary text-on-primary font-bold py-4 rounded-lg flex items-center justify-center gap-3 active:scale-95 transition-all duration-200 hover:bg-primary-container group shadow-lg shadow-primary/10 disabled:opacity-50" 
                  type="submit"
                  disabled={isLoading}
                >
                  <span className="text-label-md uppercase tracking-wider">{isLoading ? 'Đang xác thực...' : 'Hoàn tất Đăng ký'}</span>
                  {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>}
                </button>

                <div className="pt-4 text-center">
                  <button 
                    type="button"
                    onClick={async () => {
                      try {
                        await authService.resendOtp(formData.email);
                        alert("Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
                      } catch(err) {
                        setError("Không thể gửi lại mã OTP.");
                      }
                    }}
                    className="text-label-md text-on-surface-variant hover:text-primary transition-colors duration-300" 
                  >
                    Chưa nhận được mã? Gửi lại
                  </button>
                  <div className="mt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto group"
                    >
                      <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
                      Quay lại Sửa thông tin
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="w-full relative z-10">
        <Footer />
      </div>
    </div>
  );
}
