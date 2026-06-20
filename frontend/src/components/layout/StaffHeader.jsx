"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StaffHeader() {
  const pathname = usePathname();

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
          <button className="p-2 hover:bg-surface-bright/10 rounded-full transition-transform active:scale-95 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 hover:bg-surface-bright/10 rounded-full transition-transform active:scale-95 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary ml-2 cursor-pointer hover:scale-105 transition-transform">
            <img
              alt="Staff Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAkQs76rDjQ2LE41uM-qb9odZtBg7udAZ4a4QyikekUPIShJfmPlixGx_NPXgPUSbqd9q91rq46uvvVKsBoKNOehotl0ILJeJhq7pikEn7y_WdXggivkRYcX1EdPHXkPj3VQwMzMegSjYpXJgGRNOxAtXdIHxjKgPZ8y9sCuAKBwBPzoUAIwvPVjekkW3gKp0WwBa9gWJW3SlEpoJOHGULwDVJC4MpWn1BnJ4i0lXeqyg0Jb65r4gNvZJNktCZXQ5KYsdmCEkgjL75"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
