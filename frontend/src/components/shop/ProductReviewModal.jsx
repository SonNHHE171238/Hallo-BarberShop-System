"use client";

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProductReviewModal({ isOpen, onClose, product, orderCode, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(`http://localhost:5000/api/products/${product._id}/feedbacks`, {
        rating,
        comment,
        orderCode
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success(res.data.message || "Gửi đánh giá thành công!");
        if (res.data.data?.rewardVoucherCode) {
           toast.success(`Bạn được tặng 1 Voucher: ${res.data.data.rewardVoucherCode}`, { duration: 5000 });
        }
        setRating(0);
        setComment("");
        if (onSuccess) onSuccess(product._id);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-headline-sm text-lg text-primary uppercase tracking-widest">Đánh giá sản phẩm</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-highest text-on-surface hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
            <img 
              src={product.image || "/placeholder.png"} 
              alt={product.name} 
              className="w-16 h-16 object-contain rounded-md bg-white p-1"
            />
            <p className="font-headline-sm text-sm text-on-surface line-clamp-2">{product.name}</p>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest">Chất lượng sản phẩm</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                >
                  <span 
                    className={`material-symbols-outlined text-[40px] transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'text-primary fill-current' 
                        : 'text-outline-variant'
                    }`}
                    style={{ fontVariationSettings: star <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0" }}
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
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này nhé..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none"
              required
            ></textarea>
          </div>

          <div className="flex gap-4 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-outline-variant text-on-surface-variant font-label-md uppercase tracking-widest hover:bg-surface-container-high transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-label-md uppercase tracking-widest hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Gửi...</>
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
