"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShopHero from "@/components/shop/ShopHero";
import SidebarFilters from "@/components/shop/SidebarFilters";
import ProductGrid from "@/components/shop/ProductGrid";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
      <Navbar />

      <main className="flex-grow">
        <ShopHero />
        
        <section className="py-24 px-4 md:px-16 max-w-[1400px] mx-auto">
          {/* Toggle Filter Button */}
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 border border-outline-variant px-6 py-3 rounded-lg hover:bg-surface-variant transition-colors text-label-md uppercase tracking-widest font-bold"
            >
              <span className="material-symbols-outlined">{isFilterOpen ? "close" : "tune"}</span>
              {isFilterOpen ? "Đóng bộ lọc" : "Bộ lọc sản phẩm"}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 relative">
            {/* Sidebar Filters */}
            <div className={`transition-all duration-500 overflow-hidden ${isFilterOpen ? 'max-h-[2000px] opacity-100 lg:w-1/4' : 'max-h-0 opacity-0 lg:w-0'}`}>
              <div className="w-full lg:w-[300px]">
                <SidebarFilters 
                  selectedCategory={selectedCategory} 
                  onSelectCategory={setSelectedCategory} 
                  selectedBrand={selectedBrand}
                  onSelectBrand={setSelectedBrand}
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className={`transition-all duration-500 ${isFilterOpen ? 'lg:w-3/4' : 'w-full'}`}>
              <ProductGrid 
                selectedCategory={selectedCategory} 
                selectedBrand={selectedBrand}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
