"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
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
      className={`w-full sticky top-0 z-50 border-b border-outline-variant transition-all duration-300 ${
        isScrolled
          ? "bg-surface-container-low shadow-md"
          : "bg-background dark:bg-background"
      }`}
      id="main-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        {/* Brand */}
        <Link
          href="/"
          className="font-display-lg text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tighter text-on-surface"
        >
          HALLO BARBER
        </Link>
        {/* Navigation Links (Web) */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <Link
            href="#"
            className="font-body-md text-sm lg:text-base text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-300"
          >
            Services
          </Link>
          <Link
            href="#"
            className="font-body-md text-sm lg:text-base text-on-surface-variant hover:text-primary transition-all duration-300"
          >
            Shop
          </Link>
          <Link
            href="#"
            className="font-body-md text-sm lg:text-base text-on-surface-variant hover:text-primary transition-all duration-300"
          >
            Booking
          </Link>
          <Link
            href="#"
            className="font-body-md text-sm lg:text-base text-on-surface-variant hover:text-primary transition-all duration-300"
          >
            Gallery
          </Link>
        </div>
        {/* Trailing Action */}
        <div className="flex items-center space-x-4">
          <button className="hidden md:flex text-on-surface-variant hover:text-primary transition-all duration-300">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              search
            </span>
          </button>
          <Link
            href="#"
            className="font-body-md text-sm lg:text-base text-primary dark:text-primary scale-95 active:opacity-80 transition-transform uppercase font-bold tracking-wider hover:text-primary-container"
          >
            Login
          </Link>
          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-on-surface p-2 rounded-md hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
