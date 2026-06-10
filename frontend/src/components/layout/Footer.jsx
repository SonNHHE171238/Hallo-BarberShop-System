import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-16 lg:py-section-gap bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:gap-16 gap-12">
        <div className="mb-2 md:mb-0">
          <h4 className="font-display-lg text-3xl sm:text-4xl text-on-surface tracking-tighter mb-5">
            HALLO BARBER
          </h4>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant mb-8 max-w-sm">
            High-Tech Grooming. Precision engineered for the modern aesthetic.
          </p>
          <div className="flex space-x-6">
            <Link
              href="#"
              className="text-on-surface-variant hover:text-primary transition-colors p-2 -ml-2"
            >
              <span className="material-symbols-outlined">share</span>
            </Link>
            <Link
              href="#"
              className="text-on-surface-variant hover:text-primary transition-colors p-2"
            >
              <span className="material-symbols-outlined">mail</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8">
          <div>
            <h5 className="font-label-sm text-xs text-on-surface uppercase tracking-widest mb-6 border-b border-outline-variant pb-2 inline-block">
              Navigation
            </h5>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="font-body-md text-sm sm:text-base text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
                >
                  Location
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="font-body-md text-sm sm:text-base text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="font-body-md text-sm sm:text-base text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="font-body-md text-sm sm:text-base text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-sm text-xs text-on-surface uppercase tracking-widest mb-6 border-b border-outline-variant pb-2 inline-block">
              Hours
            </h5>
            <ul className="space-y-4 font-body-md text-sm sm:text-base text-on-surface-variant opacity-80">
              <li className="flex justify-between max-w-[200px]">
                <span>Mon-Fri</span> <span>9A - 8P</span>
              </li>
              <li className="flex justify-between max-w-[200px]">
                <span>Saturday</span> <span>10A - 6P</span>
              </li>
              <li className="flex justify-between max-w-[200px] text-secondary">
                <span>Sunday</span> <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-outline-variant text-center sm:text-left">
        <p className="font-label-sm text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-widest opacity-60">
          © 2024 HALLO BARBER. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
