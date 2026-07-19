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
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [blogRes, allBlogsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/blogs/public/${slug}`),
          axios.get("http://localhost:5000/api/blogs/public")
        ]);
        
        if (blogRes.data.success) {
          setBlog(blogRes.data.data);
        }
        
        if (allBlogsRes.data.success) {
          const all = allBlogsRes.data.data;
          setRelatedBlogs(all.filter(b => b.slug !== slug).slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch blog data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (!mounted || loading) return null;

  if (!blog) return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col justify-center items-center">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-2xl">Không tìm thấy bài viết.</h1>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-section-padding">
        <BlogDetailHeader blog={blog} />
        <BlogDetailHero blog={blog} />
        <BlogContent blog={blog} />
        {relatedBlogs.length > 0 && <RelatedPosts posts={relatedBlogs} />}
        <BlogDetailCTA />
      </main>

      <Footer />
    </div>
  );
}
