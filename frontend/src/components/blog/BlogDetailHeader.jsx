import React from "react";
import Link from "next/link";

export default function BlogDetailHeader({ blog }) {
  if (!blog) return null;

  const authorName = blog.author?.name || "Admin";
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-label-md font-label-md text-outline mb-6">
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Chi tiết</span>
      </nav>
      
      <h1 className="font-headline-lg text-headline-lg md:text-display-lg md:font-display-lg text-on-surface leading-tight mb-8">
        {blog.title}
      </h1>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-outline-variant py-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-gold overflow-hidden flex items-center justify-center text-primary font-bold">
            {authorName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-body-md font-semibold text-primary">Bởi {authorName}</p>
            <p className="text-label-md text-outline">Tác giả</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-label-md text-on-surface-variant">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary">calendar_today</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <span>{blog.views || 0} lượt xem</span>
          </div>
        </div>
      </div>
    </div>
  );
}
