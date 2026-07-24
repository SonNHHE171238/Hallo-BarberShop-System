"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogDetailHeader from "@/components/blog/BlogDetailHeader";
import BlogDetailHero from "@/components/blog/BlogDetailHero";
import BlogContent from "@/components/blog/BlogContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import BlogDetailCTA from "@/components/blog/BlogDetailCTA";

export default function BlogDetailPage({ slug }) {
  const [mounted, setMounted] = useState(false);
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/public/${slug}`);
        if (res.data.success) {
          setBlog(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch blog:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) fetchBlog();
  }, [slug]);

  if (!mounted) return null;

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-section-padding">
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : !blog ? (
          <div className="text-center py-32">
            <h1 className="text-3xl font-bold text-error mb-4">Không tìm thấy bài viết</h1>
            <p className="text-on-surface-variant">Bài viết có thể đã bị xoá hoặc không tồn tại.</p>
          </div>
        ) : (
          <>
            <BlogDetailHeader title={blog.title} author={blog.author} createdAt={blog.createdAt} />
            <BlogDetailHero image={blog.image} title={blog.title} />
            <BlogContent content={blog.content} />
            <BlogDetailCTA />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
