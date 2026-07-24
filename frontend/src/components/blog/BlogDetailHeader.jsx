import React from "react";
import Link from "next/link";

export default function BlogDetailHeader() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-label-md font-label-md text-outline mb-6">
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Bài viết</span>
      </nav>
      
      <h1 className="font-headline-lg text-headline-lg md:text-display-lg md:font-display-lg text-on-surface leading-tight mb-8">
        Nghệ Thuật Cắt Tóc Cổ Điển: Khi Di Sản Gặp Gỡ Hiện Đại
      </h1>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-outline-variant py-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-gold overflow-hidden">
            <img 
              alt="Author" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMIViLXw6_WKgAIPJv-YjqAMRzSUTU5Ll-7nQ5G_NFSvAOnWyqidAR5b4HWLtR7RD7WbkDxqpC5tmaUpdcmwM6WzrPqsZgGn-I4453o4HeQ8tezBRAJVL1N-njsi0FtQMC9431r_0H_4pIkGtCkTimPZEQZQV0mGGfFDcP9g0XL8OFaEOI4NzubPdTmOpnVylPRFxwqMTY0jxtcMs4kJ-ZZphkWwkF59h6DRhU6LB4BqqbI-MK5Q8wyDR6xBbEEZCwISPFwY611OT7" 
            />
          </div>
          <div>
            <p className="text-body-md font-semibold text-primary">Bởi Nguyễn Hoàng Long</p>
            <p className="text-label-md text-outline">Master Barber • 12 năm kinh nghiệm</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-label-md text-on-surface-variant">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary">calendar_today</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary">visibility</span>
            <span>{blog.views || 0} lượt xem</span>
          </div>
        </div>
      </div>
    </div>
  );
}
