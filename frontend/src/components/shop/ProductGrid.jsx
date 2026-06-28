import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProductGrid({ selectedCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = selectedCategory 
          ? `http://localhost:5000/api/products?categoryId=${selectedCategory}` 
          : `http://localhost:5000/api/products`;
        const res = await axios.get(url);
        if (res.data.success) {
          setProducts(res.data.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (product) => {
    try {
      // Gọi API ném vào giỏ hàng DB
      const res = await axios.post("http://localhost:5000/api/cart", {
        productId: product._id,
        quantity: 1
      }, { withCredentials: true });
      
      if (res.data.success) {
        alert("Đã thêm vào giỏ hàng!");
      }
    } catch (error) {
      // Ném lỗi 401 (chưa đăng nhập) -> Fallback xuống LocalStorage
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
    }
  };

  if (loading) {
    return <div className="flex-grow flex items-center justify-center min-h-[400px]">Đang tải sản phẩm...</div>;
  }

  if (products.length === 0) {
    return <div className="flex-grow flex items-center justify-center min-h-[400px]">Chưa có sản phẩm nào.</div>;
  }

  return (
    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8">
      {products.map((product) => (
        <div key={product._id} className="group flex flex-col bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant transition-all duration-500">
          <div className="relative aspect-[4/5] overflow-hidden bg-background flex items-center justify-center p-6">
            <img 
              alt={product.name} 
              className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
              src={product.image} 
            />
            {product.isBestSeller && (
              <span className="absolute top-0 right-0 bg-primary text-on-primary font-label-md text-[10px] px-3 py-1 uppercase tracking-[0.2em]">
                Bán Chạy
              </span>
            )}
          </div>
          <div className="p-8 flex flex-col flex-grow">
            <span className="font-label-md text-[12px] text-primary uppercase tracking-[0.3em] mb-3">{product.brand}</span>
            <h4 className="font-headline-sm text-headline-sm mb-3 text-white group-hover:text-primary transition-colors">{product.name}</h4>
            <p className="font-label-md text-headline-sm text-on-surface-variant mb-8">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </p>
            <button 
              onClick={() => handleAddToCart(product)}
              className="mt-auto w-full bg-transparent border border-outline-variant text-primary font-label-md text-label-md py-4 uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300"
            >
              Thêm Vào Giỏ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
