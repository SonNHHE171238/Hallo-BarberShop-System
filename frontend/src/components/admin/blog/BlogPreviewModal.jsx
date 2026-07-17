import React from "react";

export default function BlogPreviewModal({ blog, onClose }) {
  if (!blog) return null;

  // Render status badge
  let statusColor = "text-yellow-500 border-yellow-500/30 bg-yellow-500/20"; // pending
  if (blog.status === "approved")
    statusColor = "text-green-500 border-green-500/30 bg-green-500/20";
  if (blog.status === "rejected")
    statusColor = "text-error border-error/30 bg-error/20";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-surface-obsidian/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-4xl max-h-[90vh] bg-surface-container-low border border-outline-variant rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Xem trước bài viết
            </h2>
            <span className={`status-pill border ${statusColor} text-xs px-2 py-0.5 rounded-full uppercase tracking-wider`}>
              {blog.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Rejection Reason if any */}
        {blog.status === "rejected" && blog.rejectionReason && (
          <div className="px-6 py-3 bg-error/10 border-b border-error/20 shrink-0 flex items-start gap-3">
            <span className="material-symbols-outlined text-error mt-0.5">error</span>
            <div>
              <p className="font-bold text-error text-sm uppercase mb-1">Lý do từ chối:</p>
              <p className="text-on-surface-variant text-sm">{blog.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-background text-on-surface">
          <div className="max-w-2xl mx-auto">
            {blog.image && (
              <div className="w-full aspect-[21/9] rounded-lg overflow-hidden mb-8 border border-outline-variant">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-gold flex items-center justify-center text-primary font-bold">
                {blog.author?.name ? blog.author.name.substring(0, 2).toUpperCase() : "AD"}
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{blog.author?.name || "Admin"}</p>
                <p className="text-xs text-outline">{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            {/* Rich Text Content */}
            <div 
              className="article-content font-body-lg text-body-lg text-on-surface-variant leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded font-label-md uppercase tracking-widest bg-surface-variant text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
}
