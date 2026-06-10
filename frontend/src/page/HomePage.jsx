"use client";

import React from "react";
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
