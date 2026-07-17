import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BlogPreviewModal from "./BlogPreviewModal";

export default function BlogTable({ blogs = [], page = 1, totalPages = 1, total = 0, onPageChange, error, onDelete, onReview }) {
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/staff') ? '/staff/blogs' : '/admin/blogs';
  const { user } = useAuth();
  const [previewBlog, setPreviewBlog] = useState(null);

  // Fallback image in case the real image isn't available
  const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuACcRy8sgfcI0uj1g_HiiG1AQRCWV3JnXDZEqNaQgfBiGe6Hlao53ZMXkrgHUy5V2lBRsYg4V42e70KxjxHSRo9qdNd5lJQpsvDMMwGWOG_KMdoUhCu1ZSxFBt3p4mSrrITVR-qqLAl68UoqiiA661B5Rs4G6X6GBf5MgODpHq6sRauBGoiipA_iwtpdT5ti4zB772usd9SnU54YzPDkoMoi3bkKxY9BZwJvBHRUZxlv5iKOWajJhL-NYHivZJgGLNsY3Rm6eH8y6f-";

  return (
    <>
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-surface-container-high border-b border-outline-variant/30">
            <tr>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Bài viết</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Người viết</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {error ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-error font-body-md">
                  Lỗi tải dữ liệu. Vui lòng thử lại sau.
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              blogs.map((blog) => {
                const dateObj = new Date(blog.createdAt);
                const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
                
                let statusColor = "text-yellow-500 border-yellow-500/30 bg-yellow-500/20"; // pending
                if (blog.status === 'approved') statusColor = "text-green-500 border-green-500/30 bg-green-500/20";
                if (blog.status === 'rejected') statusColor = "text-error border-error/30 bg-error/20";

                const authorName = blog.author?.name || "Admin";
                const authorInitials = authorName.substring(0, 2).toUpperCase();
                const image = blog.image || fallbackImage;
                const canEdit = user?.role === 'admin' || blog.author?._id === user?.id;
                const canDelete = user?.role === 'admin' || (blog.author?._id === user?.id && blog.status === 'rejected');

                return (
                  <tr key={blog._id} className="table-row-hover group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-surface-container-highest overflow-hidden border border-outline-variant/30 shrink-0">
                          <img 
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            src={image} 
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{blog.title}</h3>
                          <p className="text-xs text-on-surface-variant">{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-outline-variant flex items-center justify-center text-[10px] text-on-surface font-bold shrink-0">
                          {authorInitials}
                        </div>
                        <span className="text-sm">{authorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-pill border ${statusColor}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-label-md text-on-surface-variant">{formattedDate}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setPreviewBlog(blog)} className="p-1.5 rounded hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center" title="Xem trước">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        {user?.role === 'admin' && blog.status === 'pending' && (
                          <button onClick={() => { if(confirm('Bạn có chắc chắn duyệt bài viết này?')) onReview && onReview(blog._id, 'approved'); }} className="p-1.5 rounded hover:bg-green-500/20 text-on-surface-variant hover:text-green-500 transition-all flex items-center justify-center" title="Duyệt bài">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                        )}
                        {user?.role === 'admin' && blog.status === 'pending' && (
                          <button onClick={() => { const reason = prompt('Nhập lý do từ chối:'); if(reason !== null) onReview && onReview(blog._id, 'rejected', reason); }} className="p-1.5 rounded hover:bg-error/20 text-on-surface-variant hover:text-error transition-all flex items-center justify-center" title="Từ chối">
                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                          </button>
                        )}
                        {canEdit ? (
                          <Link href={`${basePath}/edit/${blog._id}`} className="p-1.5 rounded hover:bg-blue-500/20 text-on-surface-variant hover:text-blue-400 transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </Link>
                        ) : (
                          <button className="p-1.5 rounded text-on-surface-variant opacity-30 cursor-not-allowed transition-all flex items-center justify-center" title="Chỉ tác giả mới có quyền sửa">
                            <span className="material-symbols-outlined text-[20px]">edit_off</span>
                          </button>
                        )}
                        {canDelete ? (
                          <button onClick={() => onDelete && onDelete(blog._id)} className="p-1.5 rounded hover:bg-error/20 text-on-surface-variant hover:text-error transition-all">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        ) : (
                          <button className="p-1.5 rounded text-on-surface-variant opacity-30 cursor-not-allowed transition-all flex items-center justify-center" title="Bạn chỉ được xóa bài của mình khi đã bị từ chối">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <BlogPreviewModal 
        blog={previewBlog} 
        onClose={() => setPreviewBlog(null)} 
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-8 px-2">
          <p className="text-sm text-on-surface-variant">Hiển thị {blogs.length} trên tổng {total} bài viết</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-10 h-10 flex items-center justify-center rounded border transition-all ${
                  page === p
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {p}
              </button>
            ))}

            <button 
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
