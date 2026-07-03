"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import AboutUs from "@/components/home/AboutUs";
import Services from "@/components/shared/Services";
import HotDeals from "@/components/home/HotDeals";
import BusinessHours from "@/components/home/BusinessHours";
import Barbers from "@/components/home/Barbers";
import Testimonials from "@/components/home/Testimonials";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    authService.getMe().then(data => {
      if (data && data.user) {
        if (data.user.role === 'barber') {
          router.push('/barber/dashboard');
        } else if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'staff') {
          router.push('/staff/dashboard');
        }
      }
    }).catch(() => {
      // Ignored: Not logged in or normal customer
    });
  }, [router]);

  return (
    <div className="bg-background min-h-screen text-on-surface">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Main Content */}
      <main>
        <Hero />
        <AboutUs />
        <Services />
        <HotDeals />
        <BusinessHours />
        <Barbers />
        <Testimonials />
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
