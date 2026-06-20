"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 glass-nav border-b border-outline-variant shadow-md transition-all duration-300 ${
        isScrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="flex justify-between items-center px-4 md:px-8 lg:px-12 xl:px-20 max-w-[1600px] w-full mx-auto">
        {/* Brand */}
        <Link href="/" className="flex items-center">
          <div className="text-headline-md font-headline-md font-bold tracking-tighter text-primary dark:text-primary-fixed">
            HALLO BARBER
          </div>
        </Link>
        
        {/* Navigation Links (Web) */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
          <Link 
            href="/" 
            className={`text-body-md font-body-md whitespace-nowrap transition-all ${
              pathname === "/" 
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-on-surface-variant hover:text-primary transition-colors duration-200"
            }`}
          >
            Trang chủ
          </Link>
          <Link 
            href="/#about" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-md font-body-md whitespace-nowrap"
          >
            Về chúng tôi
          </Link>
          <Link 
            href="/#services" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-md font-body-md whitespace-nowrap"
          >
            Dịch vụ
          </Link>
          <Link 
            href="/#deals" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-md font-body-md whitespace-nowrap"
          >
            Khuyến mãi
          </Link>
          <Link 
            href="/#team" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-md font-body-md whitespace-nowrap"
          >
            Đội ngũ
          </Link>
          <Link 
            href="/shop" 
            className={`text-body-md font-body-md whitespace-nowrap transition-all ${
              pathname === "/shop" 
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-on-surface-variant hover:text-primary transition-colors duration-200"
            }`}
          >
            Cửa hàng
          </Link>
          <Link 
            href="#" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-md font-body-md whitespace-nowrap"
          >
            Blog
          </Link>
          <Link 
            href="#" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-md font-body-md whitespace-nowrap"
          >
            Tin tức
          </Link>
        </div>

        {/* Trailing Action */}
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="hidden md:block font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider mr-4"
          >
            Đăng nhập
          </Link>
          <Link 
            href="/booking" 
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-headline-sm text-headline-sm transition-all active:scale-95 duration-150 hover:bg-primary-container whitespace-nowrap"
          >
            Đặt Lịch Hẹn
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-on-surface p-2 rounded-md hover:bg-surface-variant transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-surface-container-high border-b border-outline-variant shadow-lg transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col px-4 space-y-4">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-body-md font-body-md ${pathname === "/" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Trang chủ</Link>
          <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-body-md font-body-md">Về chúng tôi</Link>
          <Link href="/#services" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-body-md font-body-md">Dịch vụ</Link>
          <Link href="/#deals" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-body-md font-body-md">Khuyến mãi</Link>
          <Link href="/#team" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary text-body-md font-body-md">Đội ngũ</Link>
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className={`text-body-md font-body-md ${pathname === "/shop" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Cửa hàng</Link>
          <div className="pt-4 border-t border-outline-variant flex flex-col space-y-4">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="font-label-md text-label-md text-on-surface-variant hover:text-primary uppercase tracking-wider">Đăng nhập</Link>
            <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-headline-sm text-center transition-all active:scale-95 hover:bg-primary-container">Đặt Lịch Hẹn</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
