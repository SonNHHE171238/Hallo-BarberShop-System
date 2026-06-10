"use client";

import React, { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error_code || "Đăng nhập thất bại. Vui lòng kiểm tra lại!");
      }

      console.log("Đăng nhập thành công:", data);
      alert("Đăng nhập thành công!");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden py-16">
      <main className="relative z-20 w-full max-w-md px-container-padding">
        {/* Brand Header */}
        <div className="text-center mb-section-gap">
          <h1 className="font-display-lg text-display-lg font-bold tracking-tighter text-on-surface uppercase md:block hidden">
            HALLO BARBER
          </h1>
          <h1 className="font-display-lg-mobile text-display-lg-mobile font-bold tracking-tighter text-on-surface uppercase block md:hidden">
            HALLO BARBER
          </h1>
          <p className="font-label-sm text-label-sm text-secondary tracking-[0.2em] mt-unit uppercase">
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
                  href="#"
                >
                  Forgot?
                </Link>
              }
            />

            <div className="pt-4">
              <Button type="submit" variant="primary" size="full">
                {loading ? "Processing..." : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              New client?{" "}
              <Link
                className="text-primary hover:text-primary-fixed transition-colors font-bold underline decoration-primary/30 hover:decoration-primary underline-offset-4"
                href="#"
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
