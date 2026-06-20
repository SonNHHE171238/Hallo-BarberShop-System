"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShopHero from "@/components/shop/ShopHero";
import SidebarFilters from "@/components/shop/SidebarFilters";
import ProductGrid from "@/components/shop/ProductGrid";

export default function ShopPage() {
  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
      <Navbar />

      <main className="flex-grow">
        <ShopHero />
        
        <section className="py-24 px-4 md:px-16 max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16">
          <SidebarFilters />
          <ProductGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
}
