import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function ProductGrid({ selectedCategory, selectedBrand }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedBrand]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `http://localhost:5000/api/products?limit=20&page=${page}&`;
        if (selectedCategory) url += `categoryId=${selectedCategory}&`;
        if (selectedBrand) url += `brand=${encodeURIComponent(selectedBrand)}&`;

        const res = await axios.get(url);
        if (res.data.success) {
          setProducts(res.data.data.products);
          setTotalPages(res.data.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedBrand, page]);

  const handleAddToCart = async (product) => {
    if (!user) {
      console.log("Guest mode: adding to LocalStorage");
      const localCart = JSON.parse(localStorage.getItem('hallo_cart') || '[]');
      const existingItem = localCart.find(item => item.productId._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        localCart.push({
          productId: product,
          quantity: 1
        });
      }
      
      localStorage.setItem('hallo_cart', JSON.stringify(localCart));
      alert("Đã thêm vào giỏ hàng tạm (Guest)!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/cart", {
        productId: product._id,
        quantity: 1
      }, { withCredentials: true });
      
      if (res.data.success) {
        alert("Đã thêm vào giỏ hàng!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return <div className="flex-grow flex items-center justify-center min-h-[400px]">Đang tải sản phẩm...</div>;
  }

  if (products.length === 0) {
    return <div className="flex-grow flex items-center justify-center min-h-[400px]">Chưa có sản phẩm nào.</div>;
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center space-x-2 mt-12">
        <button 
          onClick={() => {
            setPage(p => Math.max(1, p - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={page === 1}
          className="p-2 border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant transition-colors rounded flex items-center justify-center"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded transition-colors ${page === p ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary'}`}
          >
            {p}
          </button>
        ))}
        
        <button 
          onClick={() => {
            setPage(p => Math.min(totalPages, p + 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={page === totalPages}
          className="p-2 border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant transition-colors rounded flex items-center justify-center"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    );
  };

  return (
    <div className="flex-grow flex flex-col">
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-6">
        {products.map((product) => (
          <div key={product._id} className="group flex flex-col bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant transition-all duration-500 rounded-lg overflow-hidden">
            <div className="relative aspect-square overflow-hidden bg-background flex items-center justify-center p-4">
              <img 
                alt={product.name} 
                className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
                src={product.image} 
              />
              {product.isBestSeller && (
                <span className="absolute top-0 right-0 bg-primary text-on-primary font-label-md text-[9px] px-2 py-1 uppercase tracking-[0.1em]">
                  Bán Chạy
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <span className="font-label-md text-[10px] text-primary uppercase tracking-[0.2em] mb-2">{product.brand}</span>
              <h4 className="font-body-lg text-base font-bold mb-2 text-white group-hover:text-primary transition-colors line-clamp-2">{product.name}</h4>
              <p className="font-label-md text-base font-semibold text-on-surface-variant mb-6">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </p>
              <button 
                onClick={() => handleAddToCart(product)}
                className="mt-auto w-full bg-transparent border border-outline-variant text-primary font-label-md text-xs py-3 uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all duration-300 rounded"
              >
                Thêm Vào Giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
      {renderPagination()}
    </div>
  );
}
