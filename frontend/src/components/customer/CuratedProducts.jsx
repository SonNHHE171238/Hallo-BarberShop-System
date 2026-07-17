"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function CuratedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch up to 3 latest products
        const res = await axios.get("http://localhost:5000/api/products?limit=3");
        if (res.data.success && res.data.data) {
          // If the API returns pagination, products might be in res.data.data or res.data.data.products
          // We assume standard pagination format: { data: [...], pagination: {...} } or just { data: [...] }
          const fetchedProducts = Array.isArray(res.data.data) ? res.data.data : (res.data.data.products || []);
          setProducts(fetchedProducts.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch curated products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <section className="flex flex-col gap-10 pt-4">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-headline-md text-3xl text-on-surface serif-title">Dành Riêng Cho Bạn</h2>
          <p className="text-on-surface-variant italic mt-1">Những sản phẩm thiết yếu được tuyển chọn cho riêng bạn.</p>
        </div>
        <Link href="/shop" className="font-label-md text-xs text-primary-container uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 font-bold">
          Xem Cửa Hàng <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? (
          // Skeleton Loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-5 animate-pulse">
              <div className="aspect-[4/5] bg-surface-variant rounded-lg"></div>
              <div className="h-4 bg-surface-variant rounded w-1/2"></div>
              <div className="h-6 bg-surface-variant rounded w-3/4"></div>
            </div>
          ))
        ) : (
          products.map((product) => (
            <div key={product._id} className="group flex flex-col gap-5 cursor-pointer">
              <div className="aspect-[4/5] bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden relative">
                <img 
                  alt={product.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale" 
                  src={product.image || "https://placehold.co/400x500/1A1D1E/D4AF37?text=Product"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Link href={`/shop/${product._id}`} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-md text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 whitespace-nowrap">
                  Xem Chi Tiết
                </Link>
              </div>
              <div className="flex justify-between items-start px-1">
                <div>
                  <div className="font-label-md text-[10px] text-primary-container uppercase tracking-[0.2em] mb-1 font-bold">
                    {product.brand?.name || 'Sản phẩm'}
                  </div>
                  <div className="font-headline-sm text-lg text-on-surface serif-title line-clamp-1">{product.name}</div>
                </div>
                <div className="font-body-md text-on-surface-variant font-bold ml-2">
                  {formatCurrency(product.price)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Browse Card */}
        <Link href="/shop" className="group flex flex-col gap-5 cursor-pointer">
          <div className="aspect-[4/5] bg-surface-container-low border border-outline-variant rounded-lg flex items-center justify-center relative hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-outline-variant text-6xl group-hover:text-primary-container transition-all group-hover:scale-110">auto_awesome</span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-sm">
              <span className="font-label-md text-xs uppercase text-on-surface tracking-[0.3em] border border-primary-container/40 px-6 py-3 rounded-full bg-background/80 font-bold whitespace-nowrap">Xem Toàn Bộ</span>
            </div>
          </div>
          <div className="flex justify-between items-start px-1">
            <div>
              <div className="font-label-md text-[10px] text-primary-container uppercase tracking-[0.2em] mb-1 font-bold">Tất cả sản phẩm</div>
              <div className="font-headline-sm text-lg text-on-surface-variant serif-title">Khám Phá Cửa Hàng</div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
