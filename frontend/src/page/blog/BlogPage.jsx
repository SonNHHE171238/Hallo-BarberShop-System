"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedPost from "@/components/blog/FeaturedPost";
import BlogGrid from "@/components/blog/BlogGrid";

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     
    setMounted(true);
    
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/blogs/public");
        if (res.data.success) {
          setBlogs(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  if (!mounted) return null;

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const gridPosts = blogs.length > 1 ? blogs.slice(1) : [];

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32">
        
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {featuredPost && <FeaturedPost post={featuredPost} />}
            <BlogGrid posts={gridPosts} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
