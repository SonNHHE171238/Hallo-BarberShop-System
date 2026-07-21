"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProductReviewModal({ isOpen, onClose, products, orderCode, onSuccess }) {
  const [reviews, setReviews] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo state reviews dựa vào mảng products
  useEffect(() => {
    if (products && products.length > 0) {
      const initialReviews = {};
      products.forEach(p => {
        initialReviews[p._id] = { rating: 0, comment: "" };
      });
      setReviews(initialReviews);
    }
  }, [products]);

  if (!isOpen || !products || products.length === 0) return null;

  const handleRatingChange = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra tất cả đã có sao và comment chưa
    for (const p of products) {
      const review = reviews[p._id];
      if (!review || review.rating === 0) {
        toast.error(`Vui lòng chọn số sao đánh giá cho sản phẩm ${p.name}.`);
        return;
      }
      if (!review.comment.trim()) {
        toast.error(`Vui lòng nhập nhận xét cho sản phẩm ${p.name}.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      let allSuccess = true;
      let lastVoucherCode = null;

      // Submit tuần tự (hoặc Promise.all) để đánh giá tất cả
      await Promise.all(products.map(async (p) => {
        const review = reviews[p._id];
        try {
          const res = await axios.post(`http://localhost:5000/api/products/${p._id}/feedbacks`, {
            rating: review.rating,
            comment: review.comment,
            orderCode
          }, { withCredentials: true });

          if (res.data.success) {
            if (res.data.data?.rewardVoucherCode) {
              lastVoucherCode = res.data.data.rewardVoucherCode;
            }
            if (onSuccess) onSuccess(p._id);
          } else {
             allSuccess = false;
          }
        } catch (error) {
           console.error(`Lỗi khi đánh giá sản phẩm ${p._id}:`, error);
           allSuccess = false;
        }
      }));

      if (allSuccess) {
         toast.success("Gửi tất cả đánh giá thành công!");
         if (lastVoucherCode) {
            toast.success(`Bạn được tặng 1 Voucher: ${lastVoucherCode}`, { duration: 5000 });
         }
         onClose();
      } else {
         toast.error("Một số đánh giá gửi không thành công. Vui lòng kiểm tra lại.");
      }

    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <h2 className="font-headline-sm text-lg text-primary uppercase tracking-widest">Đánh giá sản phẩm ({products.length})</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-highest text-on-surface hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
          {products.map((product, index) => {
             const rev = reviews[product._id] || { rating: 0, comment: "" };
             return (
              <div key={product._id} className={index !== products.length - 1 ? "pb-8 border-b border-outline-variant/50" : ""}>
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant mb-6">
                  <img 
                    src={product.image || "/placeholder.png"} 
                    alt={product.name} 
                    className="w-16 h-16 object-contain rounded-md bg-white p-1"
                  />
                  <p className="font-headline-sm text-sm text-on-surface line-clamp-2 flex-1">{product.name}</p>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-center gap-2 mb-6">
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest">Chất lượng sản phẩm <span className="text-error">*</span></p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(product._id, star)}
                        onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [product._id]: star }))}
                        onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [product._id]: 0 }))}
                        className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                      >
                        <span 
                          className={`material-symbols-outlined text-[40px] transition-colors ${
                            star <= ((hoverRatings[product._id] || 0) || rev.rating) 
                              ? 'text-primary fill-current' 
                              : 'text-outline-variant'
                          }`}
                          style={{ fontVariationSettings: star <= ((hoverRatings[product._id] || 0) || rev.rating) ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-2">
                  <label className="text-on-surface-variant text-xs uppercase tracking-widest">Nhận xét của bạn <span className="text-error">*</span></label>
                  <textarea
                    value={rev.comment}
                    onChange={(e) => handleCommentChange(product._id, e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này nhé..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
                    required
                  ></textarea>
                </div>
              </div>
             );
          })}
        </form>

        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex gap-4 flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-outline-variant text-on-surface-variant font-label-md uppercase tracking-widest hover:bg-surface-container-high transition-colors"
          >
            Hủy
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-label-md uppercase tracking-widest hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Đang gửi...</>
            ) : (
              "Gửi đánh giá tất cả"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
