"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ProductDetailPage({ id }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        } else {
          router.push('/shop');
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin sản phẩm:", error);
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.stock === 0) {
      toast.error("Sản phẩm đã hết hàng, không thể thêm vào giỏ");
      return;
    }

    if (!user) {
      const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
      const existingItem = localCart.find(i => i.productId._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        localCart.push({
          productId: product,
          quantity: quantity
        });
      }
      localStorage.setItem('hallo_cart', JSON.stringify(localCart));
      toast.success("Đã thêm vào giỏ hàng tạm (Guest)!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/cart", {
        productId: product._id,
        quantity: quantity
      }, { withCredentials: true });
      
      if (res.data.success) {
        toast.success("Đã thêm vào giỏ hàng!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-on-surface flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-32">
          Đang tải thông tin sản phẩm...
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stock === 0 || !product.isActive;

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
      <Navbar />

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-margin-mobile md:px-gutter pt-28 pb-12 lg:pt-32 lg:pb-16 flex flex-col">
        {/* Product Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col space-y-4 items-center justify-start">
            {/* Main Featured Image */}
            <div className="w-full max-w-[500px] lg:max-w-[550px] xl:max-w-[600px] aspect-square bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden relative group flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest/40 to-transparent pointer-events-none z-10"></div>
              <img 
                alt={product.name} 
                className={`max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out p-4 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
                src={product.image || "/placeholder.png"}
              />
              {isOutOfStock && (
                 <div className="absolute inset-0 bg-background/30 flex items-center justify-center backdrop-blur-[2px] z-20">
                   <span className="bg-error text-on-error font-headline-md uppercase px-6 py-2 tracking-widest rounded shadow-lg shadow-error/20">
                     {product.isActive ? "Hết hàng" : "Ngừng kinh doanh"}
                   </span>
                 </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="lg:col-span-6 flex flex-col pt-4 lg:pt-0">
            {/* Title & Reviews */}
            <div className="border-b border-outline-variant pb-6 mb-6">
              <h1 className="font-display-lg text-[24px] md:text-[28px] lg:text-[32px] text-on-surface mb-4 leading-tight">{product.name}</h1>
              
              {/* Price */}
              <div className="font-headline-md text-primary text-2xl flex items-center gap-4">
                {formatPrice(product.price)}
                {isOutOfStock && <span className="text-xs font-label-md bg-error/10 text-error px-3 py-1 rounded uppercase tracking-wider">Không có sẵn</span>}
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant mb-10">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-4">Mô tả sản phẩm</h3>
              
              <div className={`relative transition-all duration-500 ${!isDescriptionExpanded ? 'max-h-32 overflow-hidden' : ''}`}>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {product.description || "Được thiết kế để mang lại sự rõ nét về cấu trúc và khả năng dưỡng ẩm sâu. Sản phẩm cao cấp dành cho quý phái."}
                </p>
                {/* Fade out effect when collapsed */}
                {!isDescriptionExpanded && (product.description?.length > 150 || !product.description) && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-container-low to-transparent pointer-events-none"></div>
                )}
              </div>
              
              {/* Toggle Button */}
              {(!product.description || product.description.length > 150) && (
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3 text-primary font-label-md text-sm uppercase tracking-wider hover:text-primary-fixed transition-colors flex items-center gap-1"
                >
                  {isDescriptionExpanded ? "Thu gọn" : "Hiển thị thêm"}
                  <span className="material-symbols-outlined text-[16px]">
                    {isDescriptionExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              )}
              <div className="mt-4 pt-4 border-t border-outline-variant/30">
                <p className="font-body-md text-body-md text-on-surface-variant italic">
                  Thương hiệu: {product.brand || "HALLO BARBER"}
                </p>
              </div>
            </div>

            {/* Configuration Options */}
            <div className="space-y-8 mb-10">
              {/* Quantity */}
              <div>
                <span className="font-label-md text-label-md text-on-surface uppercase tracking-widest block mb-4">Số Lượng</span>
                <div className="flex items-center border border-outline-variant rounded-sm w-max bg-surface-container-lowest overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                    disabled={isOutOfStock}
                    aria-label="Decrease quantity" 
                    className="w-12 h-12 flex items-center justify-center text-on-surface hover:text-primary transition-colors focus:outline-none disabled:opacity-50">
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <input 
                    aria-label="Quantity" 
                    className="w-12 h-12 bg-transparent border-none text-center font-label-md text-on-surface focus:ring-0 p-0 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    min="1" 
                    type="number" 
                    value={quantity}
                    disabled={isOutOfStock}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                    }}
                    onBlur={() => {
                      let val = parseInt(quantity, 10);
                      if (isNaN(val) || val < 1) val = 1;
                      if (product.stock > 0 && val > product.stock) val = product.stock;
                      setQuantity(val);
                    }}
                  />
                  <button 
                    onClick={() => setQuantity(Number(quantity) + 1)}
                    disabled={isOutOfStock || (product.stock > 0 && quantity >= product.stock)}
                    aria-label="Increase quantity" 
                    className="w-12 h-12 flex items-center justify-center text-on-surface hover:text-primary transition-colors focus:outline-none disabled:opacity-50">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
                <div className="mt-2 text-xs text-on-surface-variant font-label-md tracking-wider">
                  {product.stock > 0 ? `CÒN ${product.stock} SẢN PHẨM TRONG KHO` : ""}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-primary text-on-primary py-5 rounded-sm font-label-md text-label-md uppercase tracking-[0.3em] hover:bg-primary/90 transition-all active:scale-[0.99] shadow-[0_4px_20px_rgba(233,193,118,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                  Thêm Vào Giỏ Hàng - {formatPrice(product.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
