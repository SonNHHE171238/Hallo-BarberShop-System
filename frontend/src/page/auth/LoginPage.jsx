"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login, loginWithGoogle } = useAuth();

  const handleRedirect = (userObj) => {
    if (userObj?.role === 'admin') {
      router.push("/admin/dashboard");
    } else if (userObj?.role === 'staff') {
      router.push("/staff/dashboard");
    } else if (userObj?.role === 'barber') {
      router.push("/barber/dashboard");
    } else {
      router.push("/customer/dashboard");
    }
  };

  React.useEffect(() => {
    if (!isAuthLoading && user) {
      handleRedirect(user);
    }
  }, [user, isAuthLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await login(email, password);
      handleRedirect(user);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError("");
      try {
        const { access_token } = tokenResponse;
        const user = await loginWithGoogle(access_token);
        handleRedirect(user);
      } catch (err) {
        setError(err.message || "Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Đăng nhập bằng Google bị lỗi.");
    }
  });

  return (
    <div className="bg-surface-obsidian text-on-surface font-body-md min-h-screen flex flex-col relative overflow-hidden">
      {/* Top Navigation */}
      <Navbar />

      {/* Login Card */}
      <main className="relative z-20 w-full max-w-lg px-4 flex-grow flex flex-col justify-center mx-auto mt-24 mb-16">
        {/* Brand Header */}
        <div className="text-center mb-12">
          <h1 className="font-display-lg text-4xl md:text-5xl font-bold tracking-tighter text-on-surface uppercase mb-2">HALLO BARBER</h1>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-low border border-outline-gold/20 p-8 md:p-10 relative rounded-xl shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-primary mb-2">Đăng Nhập</h2>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-sm text-sm font-label-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block font-label-md text-xs text-on-surface-variant mb-2 uppercase tracking-wider" htmlFor="email">Địa Chỉ Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-gold-dim/60 px-2">mail</span>
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-gold text-on-surface font-body-md pl-10 py-3 focus:ring-0 focus:border-primary transition-colors placeholder-outline"
                  id="email"
                  name="email"
                  placeholder="khachhang@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-md text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="password">Mật Khẩu</label>
                <Link className="font-label-md text-xs text-primary hover:text-primary-fixed transition-colors" href="/forgot-password">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-gold-dim/60 px-2">lock</span>
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-gold text-on-surface font-body-md pl-10 py-3 focus:ring-0 focus:border-primary transition-colors placeholder-outline"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gold-dim/60 px-2 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                className="w-full bg-primary text-on-primary font-label-md text-sm uppercase py-4 tracking-widest hover:bg-gold-dim transition-all duration-300 shadow-lg hover:shadow-primary/20 rounded-lg font-bold disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={isLoading}
                className="w-full bg-transparent border border-outline-gold text-on-surface font-label-md text-sm uppercase py-4 tracking-widest hover:bg-primary/5 transition-all duration-300 rounded-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span>Đăng nhập với Google</span>
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="font-body-md text-sm text-on-surface-variant">
              Khách hàng mới?{" "}
              <Link className="text-primary hover:text-primary-fixed transition-colors font-bold underline decoration-primary/30 hover:decoration-primary underline-offset-8" href="/register">
                Tạo Tài Khoản
              </Link>
            </p>
          </div>
        </div>
      </main>
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] -z-10"></div>

      {/* Footer */}
      <div className="w-full relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
