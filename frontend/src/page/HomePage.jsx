"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Services from "@/components/shared/Services";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Hero />
        <Services />
      </main>
      <Footer />
    </>
  );
}
