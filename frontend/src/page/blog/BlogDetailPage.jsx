"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogDetailHeader from "@/components/blog/BlogDetailHeader";
import BlogDetailHero from "@/components/blog/BlogDetailHero";
import BlogContent from "@/components/blog/BlogContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import BlogDetailCTA from "@/components/blog/BlogDetailCTA";

export default function BlogDetailPage({ slug }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-section-padding">
        <BlogDetailHeader />
        <BlogDetailHero />
        <BlogContent />
        <RelatedPosts />
        <BlogDetailCTA />
      </main>

      <Footer />
    </div>
  );
}
