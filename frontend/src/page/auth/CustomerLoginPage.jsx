"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic goes here
    console.log("Customer login:", { email, password, rememberMe });
  };

  return (
    <div className="bg-inverse-surface text-inverse-on-surface min-h-screen flex items-center justify-center relative overflow-hidden font-body-md text-body-md">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz5W0HwvXtghJmgTyLGKxYhIUyeUGSFVJH-9jZ8lus3Dr4b850iwg9-vQezBKE-4yhZsJ2l8-rAfdo4TDvTiwTQF43JZc17G7MGBbAQIkAjRm-JPc61MTTOq3VTrZCXFNzhGYMJrVSqaZV42JScJzaS0D3-fom0OQP6av6BaoXlm_xhqJf-v7r7PIlHrWttL_OojkbMfPBU0zaADYDkfx6UUvoPlFjjWDhHLmQ0xTpA2ozsGoc6TqzHS4p_7ZH4-eekjxqguDb9Bz9" 
          alt="Luxury barbershop interior" 
          className="w-full h-full object-cover opacity-20 blur-sm"
        />
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[480px] px-4 md:px-0">
        <div className="glass-panel rounded-xl ambient-shadow p-8 md:p-12 border border-outline">
          {/* Brand/Header */}
          <div className="text-center mb-10">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-secondary-container tracking-tighter mb-2">
              HALLO BARBER
            </h1>
            <p className="font-body-md text-body-md text-inverse-primary">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block font-label-sm text-label-sm text-inverse-primary mb-1 uppercase tracking-widest" htmlFor="email">
                Email Address
              </label>
              <div className="input-field bg-transparent pb-1 pt-2 px-0">
                <input 
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-lg text-body-lg text-inverse-on-surface placeholder:text-outline transition-all duration-300 outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-label-sm text-label-sm text-inverse-primary uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <Link className="font-label-sm text-label-sm text-inverse-primary hover:text-secondary-container transition-colors duration-300" href="#">
                  Forgot Password?
                </Link>
              </div>
              <div className="input-field bg-transparent pb-1 pt-2 px-0 relative">
                <input 
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-lg text-body-lg text-inverse-on-surface placeholder:text-outline pr-10 transition-all duration-300 outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  required 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  aria-label="Toggle password visibility" 
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-outline hover:text-inverse-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input 
                className="h-4 w-4 text-secondary focus:ring-secondary border-outline bg-transparent rounded cursor-pointer" 
                id="remember-me" 
                name="remember-me" 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="ml-2 block font-body-md text-body-md text-inverse-primary cursor-pointer" htmlFor="remember-me">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                className="w-full flex justify-center py-4 px-6 border border-transparent shadow-sm font-label-md text-label-md text-on-secondary bg-secondary hover:bg-secondary-fixed-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-300 transform hover:-translate-y-[1px]" 
                type="submit"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 text-center border-t border-outline pt-6">
            <p className="font-body-md text-body-md text-inverse-primary">
              Don't have an account?{" "}
              <Link className="font-label-md text-label-md text-secondary-container hover:text-secondary-fixed-dim transition-colors duration-300" href="#">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
