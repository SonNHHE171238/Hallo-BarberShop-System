"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ProductFeedbackModal({ isOpen, onClose, productId, productName }) {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');

  const fetchFeedbacks = async (currentPage = 1, append = false) => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/products/${productId}/feedbacks?page=${currentPage}&limit=5`;
      if (ratingFilter) {
        url += `&rating=${ratingFilter}`;
      }
      const res = await axios.get(url);
      
      if (res.data.success) {
        if (append) {
          setFeedbacks(prev => [...prev, ...res.data.data]);
        } else {
          setFeedbacks(res.data.data);
        }
        setTotalPages(res.data.pagination.totalPages);
        setPage(res.data.pagination.page);
      }
    } catch (error) {
      console.error("Lỗi lấy đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchFeedbacks(1, false);
    }
  }, [isOpen, productId, ratingFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container w-full max-w-2xl h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <div>
            <h2 className="font-headline-sm text-lg text-primary uppercase tracking-widest">Đánh giá sản phẩm</h2>
            <p className="text-sm text-on-surface-variant truncate max-w-[300px] sm:max-w-md">{productName}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-highest text-on-surface hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Filter */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-3">
          <span className="text-sm font-bold text-on-surface-variant">Lọc theo sao:</span>
          <select 
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-surface-container border border-outline-variant rounded px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
          >
            <option value="">Tất cả</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {loading && feedbacks.length === 0 ? (
             <div className="flex justify-center items-center h-full">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
             </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low rounded-lg border border-outline-variant border-dashed m-auto w-full">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">reviews</span>
              <p className="text-on-surface-variant font-label-md">Không có đánh giá nào phù hợp.</p>
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb._id} className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={fb.userAvatar} alt={fb.userName} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                  <div>
                    <p className="font-bold text-sm text-on-surface">{fb.userName}</p>
                    <p className="text-[11px] text-on-surface-variant">{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="ml-auto flex text-primary">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className="material-symbols-outlined text-base" style={{ fontVariationSettings: star <= fb.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant whitespace-pre-line pl-13">
                  {fb.comment}
                </p>
              </div>
            ))
          )}

          {page < totalPages && (
            <div className="flex justify-center mt-2">
              <button 
                onClick={() => fetchFeedbacks(page + 1, true)}
                disabled={loading}
                className="px-6 py-2 border border-primary text-primary font-bold text-xs rounded uppercase hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Xem thêm'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
