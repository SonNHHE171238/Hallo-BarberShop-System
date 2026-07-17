"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BlogTableFilter from "@/components/admin/blog/BlogTableFilter";
import BlogTable from "@/components/admin/blog/BlogTable";

export default function AdminBlogManagementPage() {
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/staff') ? '/staff/blogs' : '/admin/blogs';
  
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest"); // 'newest', 'oldest', 'a-z'

  useEffect(() => {
    const fetchAdminBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/blogs/admin", {
          withCredentials: true
        });
        if (res.data.success) {
          setBlogs(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminBlogs();
  }, []);

  const handleDelete = async (blogId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/blogs/${blogId}`, {
        withCredentials: true
      });
      if (res.data.success) {
        setBlogs(blogs.filter(b => b._id !== blogId));
        alert("Xóa bài viết thành công!");
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert(error.response?.data?.message || "Lỗi khi xóa bài viết");
    }
  };

  const handleReview = async (blogId, status, rejectionReason = '') => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/blogs/${blogId}/review`, {
        status,
        rejectionReason
      }, {
        withCredentials: true
      });
      if (res.data.success) {
        setBlogs(blogs.map(b => b._id === blogId ? { ...b, status, rejectionReason } : b));
        alert(status === 'approved' ? "Đã duyệt bài viết!" : "Đã từ chối bài viết!");
      }
    } catch (error) {
      console.error("Failed to review blog:", error);
      alert(error.response?.data?.message || "Lỗi khi duyệt bài viết");
    }
  };

  // Handle Sorting
  const sortedBlogs = [...blogs].sort((a, b) => {
    if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOption === "a-z") return a.title.localeCompare(b.title);
    return 0;
  });

  const isStaff = pathname?.startsWith('/staff');

  return (
    <div className={`max-w-container-max mx-auto w-full pb-12 ${isStaff ? 'px-4 md:px-8 pt-8 md:pt-12' : ''}`}>
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="serif-header text-4xl md:text-5xl text-primary font-bold mb-2">Danh sách bài viết</h2>
          <p className="text-on-surface-variant font-body-lg">Quản lý và cập nhật nội dung tin tức cho hệ thống Hallo Barber.</p>
        </div>
        <Link href={`${basePath}/create`} className="bg-primary text-on-primary px-8 py-4 font-bold flex items-center gap-3 hover:bg-primary-container hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 group">
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
          TẠO BÀI VIẾT MỚI
        </Link>
      </div>

      <BlogTableFilter sortOption={sortOption} setSortOption={setSortOption} />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <BlogTable blogs={sortedBlogs} onDelete={handleDelete} onReview={handleReview} />
      )}
    </div>
  );
}
