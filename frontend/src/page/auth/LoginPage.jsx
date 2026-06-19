"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden py-16 min-h-screen bg-background">
      {/* Nút thoát / Quay lại trang chủ */}
      <Link 
        href="/" 
        className="absolute top-6 right-6 md:top-8 md:left-8 md:right-auto flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors z-30 group"
      >
        {/* Mobile: Dấu X ở góc phải trên */}
        <span className="material-symbols-outlined md:hidden text-3xl bg-surface-container p-2 rounded-full border border-outline-variant active:scale-95">close</span>
        
        {/* Desktop: Mũi tên quay lại ở góc trái trên */}
        <span className="material-symbols-outlined hidden md:block group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="hidden md:block font-label-md text-label-md uppercase tracking-wider">Quay lại trang chủ</span>
      </Link>

      <main className="relative z-20 w-full max-w-md px-4">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <h1 className="font-display-lg text-display-lg font-bold tracking-tighter text-on-surface uppercase md:block hidden">
            HALLO BARBER
          </h1>
          <h1 className="font-display-lg-mobile text-display-lg-mobile font-bold tracking-tighter text-on-surface uppercase block md:hidden">
            HALLO BARBER
          </h1>
          <p className="font-label-sm text-label-sm text-secondary tracking-[0.2em] mt-2 uppercase">
            Client Portal
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-high border border-outline-variant p-8 relative rounded-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_12px_rgba(173,198,255,0.5)] rounded-t-lg"></div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-sm text-sm font-label-sm">
                {error}
              </div>
            )}
            
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="client@example.com"
              icon="mail"
              required={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              icon="lock"
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <Link
                  className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors"
                  href="/login/forgot-password"
                >
                  Forgot?
                </Link>
              }
            />

            <div className="pt-4">
              <Button type="submit" variant="primary" size="full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              New client?{" "}
              <Link
                className="text-primary hover:text-primary-fixed transition-colors font-bold underline decoration-primary/30 hover:decoration-primary underline-offset-4"
                href="/login/register"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
