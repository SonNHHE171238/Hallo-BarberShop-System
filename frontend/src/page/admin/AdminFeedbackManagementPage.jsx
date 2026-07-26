"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";
import FeedbackTableFilter from "@/components/admin/feedback/FeedbackTableFilter";
import FeedbackTable from "@/components/admin/feedback/FeedbackTable";
import FeedbackDetailModal from "@/components/admin/feedback/FeedbackDetailModal";

export default function AdminFeedbackManagementPage() {
  const pathname = usePathname();
  const isStaff = pathname?.startsWith("/staff");

  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest"); // 'newest', 'oldest', 'high-rating', 'low-rating'
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/bookingfeedbacks/all?page=${page}&limit=10`,
          {
            withCredentials: true,
          },
        );
        if (res.data.success && res.data.data) {
          setFeedbacks(res.data.data);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotal(res.data.pagination.total || 0);
          } else {
            // Fallback if pagination object isn't exactly as expected
            setTotalPages(1);
            setTotal(res.data.data.length);
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin feedbacks:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedbacks();
  }, [page]);

  // Handle Search Filtering
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    
    // Tìm theo số điện thoại
    const phone = fb.bookingId?.customerPhone || "";
    if (phone.toLowerCase().includes(term)) return true;
    
    // Tìm theo mã booking (6 ký tự cuối)
    const bookingCode = fb.bookingId?._id ? fb.bookingId._id.slice(-6).toLowerCase() : "";
    if (bookingCode.includes(term.replace('#', ''))) return true;
    
    return false;
  });

  // Handle Sorting client-side since API doesn't support sorting directly yet
  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sortOption === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === "oldest")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOption === "high-rating") return b.rating - a.rating;
    if (sortOption === "low-rating") return a.rating - b.rating;
    return 0;
  });

  return (
    <div
      className={`max-w-container-max mx-auto w-full pb-12 ${isStaff ? "px-4 md:px-8 pt-8 md:pt-12" : "pt-8"}`}
    >
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="serif-header text-4xl md:text-5xl text-primary font-bold mb-2">
            Đánh giá của khách hàng
          </h2>
          <p className="text-on-surface-variant font-body-lg">
            Quản lý các phản hồi và đánh giá dịch vụ từ khách hàng.
          </p>
        </div>
      </div>

      <FeedbackTableFilter
        sortOption={sortOption}
        setSortOption={setSortOption}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <FeedbackTable
          feedbacks={sortedFeedbacks}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          error={error}
          onView={(fb) => setSelectedFeedback(fb)}
        />
      )}

      <FeedbackDetailModal 
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        feedback={selectedFeedback}
      />
    </div>
  );
}
