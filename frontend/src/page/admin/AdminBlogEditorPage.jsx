"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function AdminBlogEditorPage({ isEdit = false, blogId = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/staff') ? '/staff/blogs' : '/admin/blogs';
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  
  const fileInputRef = useRef(null);

  // Fetch data if editing
  useEffect(() => {
    if (isEdit && blogId) {
      const fetchBlog = async () => {
        try {
          // In the future, you might want to use a specific GET /admin/blogs/:id route
          // For now, we assume the public route or admin list returns all details.
          // Wait, backend has getAdminBlogs and getBlogBySlug. We don't have getBlogById.
          // Actually, we can just fetch all admin blogs and find the one with this ID.
          const res = await axios.get("http://localhost:5000/api/blogs/admin", {
            withCredentials: true
          });
          if (res.data.success) {
            const blog = res.data.data.find(b => b._id === blogId);
            if (blog) {
              const canEdit = user?.role === 'admin' || blog.author?._id === user?.id;
              if (!canEdit) {
                alert("Bạn không có quyền chỉnh sửa bài viết của người khác!");
                router.push(basePath);
                return;
              }
              setFormData({
                title: blog.title,
                content: blog.content,
              });
              if (blog.image) {
                setImagePreview(blog.image);
              }
            } else {
              alert("Không tìm thấy bài viết");
              router.push(basePath);
            }
          }
        } catch (error) {
          console.error("Failed to fetch blog:", error);
          alert("Lỗi tải dữ liệu bài viết");
        } finally {
          setIsFetching(false);
        }
      };
      fetchBlog();
    }
  }, [isEdit, blogId, router, user, basePath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      if (imageFile) {
        data.append("image", imageFile);
      }

      let res;
      if (isEdit) {
        res = await axios.put(`http://localhost:5000/api/blogs/${blogId}`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        res = await axios.post("http://localhost:5000/api/blogs", data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      if (res.data.success) {
        alert(isEdit ? "Cập nhật thành công!" : "Tạo bài viết thành công!");
        router.push(basePath);
        router.refresh();
      }
    } catch (error) {
      console.error("Lưu bài viết thất bại:", error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi lưu bài viết.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?")) return;
    
    setIsLoading(true);
    try {
      const res = await axios.delete(`http://localhost:5000/api/blogs/${blogId}`, {
        withCredentials: true
      });
      if (res.data.success) {
        alert("Xóa thành công!");
        router.push(basePath);
        router.refresh();
      }
    } catch (error) {
      console.error("Xóa bài viết thất bại:", error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi xóa bài viết.");
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const isStaff = pathname?.startsWith('/staff');

  return (
    <div className={`max-w-container-max mx-auto w-full pb-12 ${isStaff ? 'px-4 md:px-8 pt-8 md:pt-12' : ''}`}>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <Link href={basePath} className="flex items-center gap-2 text-gold-dim hover:text-primary transition-colors mb-4 group">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-label-md text-label-md uppercase">QUAY LẠI DANH SÁCH</span>
          </Link>
          <h1 className="serif-header text-headline-lg md:text-5xl text-primary leading-tight">
            {isEdit ? "Chỉnh sửa Bài viết" : "Tạo Bài viết Mới"}
          </h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            disabled={isLoading}
            onClick={handleSave}
            className="flex-1 md:flex-none px-8 py-3 bg-primary text-on-primary font-bold hover:opacity-90 transition-all active:scale-95 font-label-md text-label-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "ĐANG LƯU..." : "LƯU BÀI VIẾT"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Content Editor */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Title Section */}
          <section className="glass-panel p-8 space-y-6">
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-gold-dim">TIÊU ĐỀ BÀI VIẾT</label>
              <input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant p-4 text-headline-sm font-headline-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-sm" 
                placeholder="Nhập tiêu đề hấp dẫn..." 
                type="text"
              />
            </div>
          </section>

          {/* Featured Image */}
          <section className="glass-panel p-8">
            <label className="block font-label-md text-label-md text-gold-dim mb-4">HÌNH ẢNH NỔI BẬT</label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
            />
            <div 
              onClick={handleImageClick}
              className="relative aspect-video w-full bg-surface-container-lowest border-2 border-dashed border-outline-variant flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-colors overflow-hidden rounded-sm"
            >
              {imagePreview ? (
                <>
                  <div className="absolute inset-0 opacity-60 group-hover:opacity-40 transition-all duration-300">
                    <div 
                      className="w-full h-full bg-cover bg-center" 
                      style={{ backgroundImage: `url('${imagePreview}')` }}
                    ></div>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="material-symbols-outlined text-4xl text-primary drop-shadow-md">edit</span>
                    <span className="font-label-md text-label-md text-white drop-shadow-md font-bold bg-black/50 px-3 py-1 rounded">Đổi ảnh</span>
                  </div>
                </>
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">Click để chọn ảnh đại diện</span>
                </div>
              )}
            </div>
          </section>

          {/* Rich Text Editor Placeholder */}
          <section className="glass-panel p-8">
            <label className="block font-label-md text-label-md text-gold-dim mb-4">NỘI DUNG BÀI VIẾT</label>
            <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden rounded-sm">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 p-2 border-b border-outline-variant bg-surface-container">
                <button type="button" className="p-2 hover:bg-outline-variant text-on-surface transition-colors rounded"><span className="material-symbols-outlined">format_bold</span></button>
                <button type="button" className="p-2 hover:bg-outline-variant text-on-surface transition-colors rounded"><span className="material-symbols-outlined">format_italic</span></button>
                <button type="button" className="p-2 hover:bg-outline-variant text-on-surface transition-colors rounded"><span className="material-symbols-outlined">format_list_bulleted</span></button>
                <button type="button" className="p-2 hover:bg-outline-variant text-on-surface transition-colors rounded"><span className="material-symbols-outlined">format_quote</span></button>
                <div className="w-px h-6 bg-outline-variant mx-1 self-center"></div>
                <button type="button" className="p-2 hover:bg-outline-variant text-on-surface transition-colors rounded"><span className="material-symbols-outlined">image</span></button>
              </div>
              {/* Content Area */}
              <textarea 
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full min-h-[400px] p-6 bg-transparent border-none text-body-lg font-body-lg text-on-surface leading-relaxed resize-none focus:outline-none focus:ring-0 custom-scrollbar" 
                placeholder="Bắt đầu viết những điều tinh tế tại đây..."
              ></textarea>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Settings */}
        <aside className="lg:col-span-4 space-y-6">
          {/* History / Logs (Mock) */}
          <div className="glass-panel p-6 space-y-4">
            <h4 className="font-label-md text-label-md text-gold-dim border-b border-outline-variant pb-2 uppercase">Lịch sử hệ thống</h4>
            <div className="space-y-3">
              {isEdit ? (
                <>
                  <div className="flex gap-3 text-xs">
                    <div className="w-2 h-2 mt-1 rounded-full bg-gold-dim shrink-0"></div>
                    <div>
                      <p className="text-on-surface">Đang chỉnh sửa bản nháp</p>
                      <p className="text-on-surface-variant/60">Ngay bây giờ</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <div className="w-2 h-2 mt-1 rounded-full bg-outline-variant shrink-0"></div>
                    <div>
                      <p className="text-on-surface">Khởi tạo bài viết</p>
                      <p className="text-on-surface-variant/60">Thời điểm tạo: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex gap-3 text-xs">
                  <div className="w-2 h-2 mt-1 rounded-full bg-outline-variant shrink-0"></div>
                  <div>
                    <p className="text-on-surface">Bắt đầu tạo mới</p>
                    <p className="text-on-surface-variant/60">Chưa lưu dữ liệu</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          {isEdit && (
            <div className="p-6 border border-error/30 bg-error-container/10 rounded-sm">
              <button 
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 text-error hover:bg-error-container/20 py-2 transition-all font-label-md text-label-md disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                XÓA BÀI VIẾT NÀY
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
