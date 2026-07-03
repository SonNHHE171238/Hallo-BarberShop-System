"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { authService } from '@/services/auth.service';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success'
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (!id || !token) {
      setError('Đường dẫn không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setStatus('loading');

    try {
      await authService.resetPassword(id, token, newPassword);
      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Khôi phục mật khẩu thất bại.');
      setStatus('idle');
    }
  };

  return (
    <div className="bg-surface-obsidian text-on-surface font-body-md flex flex-col min-h-screen overflow-x-hidden selection:bg-primary selection:text-on-primary">
      <Navbar />
      <div className="relative flex-grow flex items-center justify-center overflow-hidden p-4 mt-24 mb-16">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-surface-obsidian via-transparent to-surface-obsidian"></div>
        </div>

        {/* Brand Header */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
          <Link href="/">
            <h1 className="text-headline-md font-bold tracking-tighter text-primary uppercase">
              HALLO BARBER
            </h1>
          </Link>
        </div>

        {/* Main Content Area */}
        <main className="relative z-10 w-full max-w-[480px]">
          <div className="glass-panel p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden group border border-outline-variant/30">
            {/* Decorative Side Line */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/30"></div>
            
            <header className="mb-10 animate-fade-in-up">
              <h2 className="font-playfair text-[32px] leading-tight text-primary-fixed-dim italic mb-2">
                Phục hồi tài khoản
              </h2>
              <p className="text-on-surface-variant text-body-md">
                Nhập mật khẩu mới để tiếp tục trải nghiệm dịch vụ tại Hallo Barber.
              </p>
            </header>

            <form className="space-y-6 animate-fade-in-up" onSubmit={handleSubmit} style={{ animationDelay: '100ms' }}>
              <div className="space-y-2">
                <label className="block text-label-md text-primary uppercase tracking-widest" htmlFor="new_password">
                  Mật khẩu mới
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-gold transition-colors group-focus-within:text-primary">
                    lock
                  </span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-300 outline-none" 
                    id="new_password" 
                    name="new_password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    disabled={status === 'loading' || status === 'success'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-label-md text-primary uppercase tracking-widest" htmlFor="confirm_password">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-gold transition-colors group-focus-within:text-primary">
                    lock_reset
                  </span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-300 outline-none" 
                    id="confirm_password" 
                    name="confirm_password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    disabled={status === 'loading' || status === 'success'}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-error text-label-md animate-fade-in-up flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button 
                  className={`w-full font-headline-sm py-4 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group ${
                    status === 'success' 
                      ? 'bg-green-600 text-white pointer-events-none' 
                      : 'bg-primary text-on-primary hover:bg-primary-fixed active:scale-95'
                  }`} 
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                >
                  {status === 'idle' && (
                    <>
                      Cập Nhật Mật Khẩu
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                        arrow_right_alt
                      </span>
                    </>
                  )}
                  {status === 'loading' && (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span> 
                      Đang cập nhật...
                    </>
                  )}
                  {status === 'success' && (
                    <>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 
                      Thành công!
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-outline-variant/30 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Link 
                className="text-label-md text-on-surface-variant hover:text-primary transition-colors duration-300 flex items-center justify-center gap-2" 
                href="/login"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Quay lại trang đăng nhập
              </Link>
            </div>

            {/* Glowing orb bottom right */}
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[64px] pointer-events-none"></div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 w-full h-[300px] pointer-events-none opacity-20">
          <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-primary/20 to-transparent"></div>
        </div>
      </div>
      <div className="w-full relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-obsidian flex justify-center items-center text-primary font-headline-sm">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
