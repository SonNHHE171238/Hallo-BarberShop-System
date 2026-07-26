"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LogoutConfirmModal from "../ui/LogoutConfirmModal";
import NotificationDropdown from "./NotificationDropdown";
import axios from "axios";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (user) {
        try {
          const res = await axios.get("http://localhost:5000/api/cart", { withCredentials: true });
          if (res.data.success && Array.isArray(res.data.data)) {
            const items = res.data.data;
            const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            setCartCount(count);
          }
        } catch (error) {
          // Ignore error silently to not spam console
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
        const count = localCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      }
    };

    fetchCartCount();
    const interval = setInterval(fetchCartCount, 2000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveHash(window.location.hash);
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
    <>
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
          <div className="relative group flex items-center h-full py-2">
            <Link 
              href="/" 
              onClick={() => setActiveHash("")}
              className={`text-body-md font-body-md whitespace-nowrap transition-all flex items-center gap-1 ${
                pathname === "/" && !activeHash
                  ? "text-primary font-bold border-b-2 border-primary pb-1" 
                  : "text-on-surface-variant hover:text-primary transition-colors duration-200"
              }`}
            >
              Trang chủ <span className="material-symbols-outlined text-[16px] transition-transform group-hover:rotate-180">expand_more</span>
            </Link>
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 w-48 bg-surface-container-high border border-outline-variant rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden flex flex-col mt-2">
              <Link href="/#about" className="px-4 py-3 text-body-md text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors border-b border-outline-variant/50">Về chúng tôi</Link>
              <Link href="/#services" className="px-4 py-3 text-body-md text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors border-b border-outline-variant/50">Dịch vụ</Link>
              <Link href="/#team" className="px-4 py-3 text-body-md text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors">Đội ngũ</Link>
            </div>
          </div>

          <Link 
            href="/vouchers" 
            onClick={() => setActiveHash("")}
            className={`text-body-md font-body-md whitespace-nowrap transition-all ${
              pathname === "/vouchers" 
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-on-surface-variant hover:text-primary transition-colors duration-200"
            }`}
          >
            Khuyến mãi
          </Link>

          <Link 
            href="/shop" 
            onClick={() => setActiveHash("")}
            className={`text-body-md font-body-md whitespace-nowrap transition-all ${
              pathname === "/shop" 
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-on-surface-variant hover:text-primary transition-colors duration-200"
            }`}
          >
            Cửa hàng
          </Link>
          <Link 
            href={(mounted && user) ? "/customer/history" : "/lookup/bookings"} 
            className={`text-body-md font-body-md whitespace-nowrap transition-all ${
              pathname === "/customer/history" || pathname === "/lookup/bookings"
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-on-surface-variant hover:text-primary transition-colors duration-200"
            }`}
          >
            Lịch hẹn
          </Link>
          <Link 
            href="/blog" 
            className={`text-body-md font-body-md whitespace-nowrap transition-all ${
              pathname === "/blog" 
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-on-surface-variant hover:text-primary transition-colors duration-200"
            }`}
          >
            Blog & Tin tức
          </Link>
          <Link 
            href={(mounted && user) ? "/customer/orders" : "/lookup/orders"} 
            className={`text-body-md font-body-md whitespace-nowrap transition-all ${
              pathname.startsWith("/lookup/orders") || pathname.startsWith("/customer/orders")
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-on-surface-variant hover:text-primary transition-colors duration-200"
            }`}
          >
            Đơn hàng
          </Link>
        </div>

        {/* Trailing Action */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link href="/shop/cart" className="relative text-on-surface hover:text-primary transition-colors p-2 hidden md:flex items-center">
            <span className="material-symbols-outlined">shopping_bag</span>
            {mounted && cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-error text-on-error text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          
          {(mounted && user) ? (
            <div className="flex items-center space-x-2 md:space-x-4">
              <NotificationDropdown />
              <div className="relative group hidden md:flex items-center space-x-2 mr-4 cursor-pointer py-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center border border-outline-variant">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                )}
              </div>
              <span className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors uppercase tracking-wider truncate max-w-[120px]">
                {user.name.split(' ')[user.name.split(' ').length - 1]}
              </span>
              
              {/* Dropdown */}
              <div className="absolute top-full right-0 w-48 bg-surface-container-high border border-outline-variant rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-outline-variant bg-surface-container">
                  <p className="text-body-md font-bold text-on-surface truncate">{user.name}</p>
                  <p className="text-label-sm text-on-surface-variant truncate">{user.email}</p>
                </div>
                <Link href={`/${user.role}/dashboard`} className="flex items-center gap-2 px-4 py-3 text-body-md text-on-surface hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  Bảng điều khiển
                </Link>
                <Link href="/customer/profile" className="flex items-center gap-2 px-4 py-3 text-body-md text-on-surface hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Xem Hồ Sơ
                </Link>
                <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-2 w-full text-left px-4 py-3 text-body-md text-error hover:bg-error/10 transition-colors border-t border-outline-variant">
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Đăng xuất
                </button>
              </div>
            </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:block font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider mr-4"
            >
              Đăng nhập
            </Link>
          )}
          <Link 
            href="/booking" 
            className="hidden md:inline-flex bg-primary text-on-primary px-6 py-2 rounded-lg font-headline-sm text-headline-sm transition-all active:scale-95 duration-150 hover:bg-primary-container whitespace-nowrap"
          >
            Đặt Lịch Hẹn
          </Link>
          
          {/* Mobile Cart Icon */}
          <Link href="/shop/cart" className="relative md:hidden text-on-surface p-2 rounded-md hover:bg-surface-variant transition-colors mr-1">
            <span className="material-symbols-outlined">shopping_bag</span>
            {mounted && cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-error text-on-error text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
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
          <Link href="/" onClick={() => { setIsMobileMenuOpen(false); setActiveHash(""); }} className={`text-body-md font-body-md ${pathname === "/" && !activeHash ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Trang chủ</Link>
          <div className="flex flex-col space-y-4 pl-4 border-l-2 border-outline-variant/30">
            <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-body-md font-body-md text-on-surface-variant hover:text-primary">Về chúng tôi</Link>
            <Link href="/#services" onClick={() => setIsMobileMenuOpen(false)} className="text-body-md font-body-md text-on-surface-variant hover:text-primary">Dịch vụ</Link>
            <Link href="/#team" onClick={() => setIsMobileMenuOpen(false)} className="text-body-md font-body-md text-on-surface-variant hover:text-primary">Đội ngũ</Link>
          </div>
          <Link href="/shop" onClick={() => { setIsMobileMenuOpen(false); setActiveHash(""); }} className={`text-body-md font-body-md ${pathname === "/shop" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Cửa hàng</Link>
          <Link href={(mounted && user) ? "/customer/history" : "/lookup/bookings"} onClick={() => { setIsMobileMenuOpen(false); setActiveHash(""); }} className={`text-body-md font-body-md ${pathname === "/customer/history" || pathname === "/lookup/bookings" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Lịch hẹn</Link>
          <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className={`text-body-md font-body-md ${pathname === "/blog" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Blog & Tin tức</Link>
          <Link href={(mounted && user) ? "/customer/orders" : "/lookup/orders"} onClick={() => setIsMobileMenuOpen(false)} className={`text-body-md font-body-md ${pathname.startsWith("/lookup/orders") || pathname.startsWith("/customer/orders") ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Đơn hàng</Link>
          <div className="pt-4 border-t border-outline-variant flex flex-col space-y-4">
            {(mounted && user) ? (
              <>
                <div className="flex items-center space-x-3 mb-2 px-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center border border-outline-variant">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant">person</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-body-md">{user.name}</p>
                    <p className="text-on-surface-variant text-label-sm">{user.email}</p>
                  </div>
                </div>
                <Link href={`/${user.role}/dashboard`} onClick={() => setIsMobileMenuOpen(false)} className="font-label-md text-label-md text-on-surface hover:text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">dashboard</span> Bảng điều khiển
                </Link>
                <Link href="/customer/profile" onClick={() => setIsMobileMenuOpen(false)} className="font-label-md text-label-md text-on-surface hover:text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person</span> Xem Hồ Sơ
                </Link>
                <button onClick={() => { setIsLogoutModalOpen(true); }} className="font-label-md text-label-md text-error hover:text-error/80 uppercase tracking-wider flex items-center gap-2 text-left">
                  <span className="material-symbols-outlined text-sm">logout</span> Đăng xuất
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="font-label-md text-label-md text-on-surface-variant hover:text-primary uppercase tracking-wider">Đăng nhập</Link>
            )}
            <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-headline-sm text-center transition-all active:scale-95 hover:bg-primary-container">Đặt Lịch Hẹn</Link>
          </div>
        </div>
      </div>
    </nav>
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          setIsMobileMenuOpen(false);
        }}
      />
    </>
  );
}


