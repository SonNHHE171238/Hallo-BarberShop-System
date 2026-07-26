"use client";

import React, { useEffect, useState, use, useRef } from "react";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogDetailHeader from "@/components/blog/BlogDetailHeader";
import BlogDetailHero from "@/components/blog/BlogDetailHero";
import BlogContent from "@/components/blog/BlogContent";
import BlogDetailCTA from "@/components/blog/BlogDetailCTA";

export default function BlogDetailPage({ slug }) {
  const resolvedSlug = typeof slug === "object" && slug !== null && "then" in slug ? use(slug) : slug;
  const [mounted, setMounted] = useState(false);
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
     
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Guard against React Strict Mode double-invocation (which would double the view count)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchBlogDetail = async () => {
      const targetSlug = typeof resolvedSlug === "object" ? resolvedSlug?.slug : resolvedSlug;
      if (!targetSlug) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/public/${targetSlug}`);
        if (res.data.success) {
          setBlog(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch blog detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogDetail();
  }, [resolvedSlug]);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center py-32">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col justify-center items-center py-32">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-section-padding">
        <BlogDetailHeader blog={blog} />
        <BlogDetailHero blog={blog} />
        <BlogContent blog={blog} />
        <BlogDetailCTA />
      </main>

      <Footer />
    </div>
  );
}
