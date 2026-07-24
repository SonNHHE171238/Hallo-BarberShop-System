import React from "react";
import Link from "next/link";

export default function BlogDetailHeader({ title, author, createdAt }) {
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const formattedDate = `${dateObj.getDate()} Tháng ${dateObj.getMonth() + 1}, ${dateObj.getFullYear()}`;

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-label-md font-label-md text-outline mb-6">
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Xu hướng</span>
      </nav>
      
      <h1 className="font-headline-lg text-headline-lg md:text-display-lg md:font-display-lg text-on-surface leading-tight mb-8">
        {title || "Đang tải tiêu đề bài viết..."}
      </h1>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-outline-variant py-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-gold overflow-hidden flex items-center justify-center">
            {author?.avatarUrl ? (
              <img 
                alt={author.name} 
                className="w-full h-full object-cover" 
                src={author.avatarUrl} 
              />
            ) : (
              <span className="material-symbols-outlined text-outline">person</span>
            )}
          </div>
          <div>
            <p className="text-body-md font-semibold text-primary">Bởi {author?.name || "Admin"}</p>
            <p className="text-label-md text-outline">Barber Shop</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-label-md text-on-surface-variant">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary">calendar_today</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <span>8 phút đọc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
