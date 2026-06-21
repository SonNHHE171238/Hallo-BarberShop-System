"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StaffHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems = [
    { name: "Tổng quan", href: "/staff/dashboard" },
    { name: "Lịch hẹn", href: "/staff/appointments" },
    { name: "POS", href: "/staff/pos" },
    { name: "Nhân sự", href: "/staff/employees" },
    { name: "Kho hàng", href: "/staff/inventory" },
    { name: "Khách hàng", href: "/staff/customers" },
  ];

  return (
    <header className="fixed top-0 w-full bg-surface/90 backdrop-blur-xl border-b border-outline-variant shadow-sm h-20 z-50">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop h-full max-w-[1600px] mx-auto">
        <div className="flex items-center gap-8">
          <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary whitespace-nowrap">
            HALLO BARBER
          </span>
          <nav className="hidden lg:flex gap-6 items-center h-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-label-md transition-colors ${
                    isActive
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="hidden md:block p-2 hover:bg-surface-bright/10 rounded-full transition-transform active:scale-95 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hidden md:block p-2 hover:bg-surface-bright/10 rounded-full transition-transform active:scale-95 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="relative hidden md:block ml-2">
            <div 
              className="w-10 h-10 rounded-full overflow-hidden border border-primary cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <img
                alt="Staff Profile"
                className="w-full h-full object-cover"
                src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAAkQs76rDjQ2LE41uM-qb9odZtBg7udAZ4a4QyikekUPIShJfmPlixGx_NPXgPUSbqd9q91rq46uvvVKsBoKNOehotl0ILJeJhq7pikEn7y_WdXggivkRYcX1EdPHXkPj3VQwMzMegSjYpXJgGRNOxAtXdIHxjKgPZ8y9sCuAKBwBPzoUAIwvPVjekkW3gKp0WwBa9gWJW3SlEpoJOHGULwDVJC4MpWn1BnJ4i0lXeqyg0Jb65r4gNvZJNktCZXQ5KYsdmCEkgjL75"}
              />
            </div>
            
            {/* Profile Menu Dropdown */}
            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-high border border-outline-variant shadow-lg rounded py-1 z-50 origin-top-right animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-2 border-b border-outline-variant/30 mb-1">
                    <p className="text-sm font-bold text-on-surface truncate">{user?.name || "Staff Member"}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email || "staff@hallobarber.com"}</p>
                  </div>
                  <Link 
                    href="/staff/profile" 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Thông tin
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-surface-variant transition-colors text-on-surface"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-surface-container-high border-b border-outline-variant shadow-lg transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col px-4 space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-label-md py-2 border-b border-outline-variant/30 ${
                  isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2 flex items-center gap-4 border-t border-outline-variant">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary">
              <img
                alt="Staff Profile"
                className="w-full h-full object-cover"
                src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAAkQs76rDjQ2LE41uM-qb9odZtBg7udAZ4a4QyikekUPIShJfmPlixGx_NPXgPUSbqd9q91rq46uvvVKsBoKNOehotl0ILJeJhq7pikEn7y_WdXggivkRYcX1EdPHXkPj3VQwMzMegSjYpXJgGRNOxAtXdIHxjKgPZ8y9sCuAKBwBPzoUAIwvPVjekkW3gKp0WwBa9gWJW3SlEpoJOHGULwDVJC4MpWn1BnJ4i0lXeqyg0Jb65r4gNvZJNktCZXQ5KYsdmCEkgjL75"}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface truncate max-w-[200px]">{user?.name || "Staff Member"}</p>
              <div className="flex gap-3 mt-1">
                <Link 
                  href="/staff/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs text-primary hover:underline"
                >
                  Thông tin
                </Link>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-error hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
