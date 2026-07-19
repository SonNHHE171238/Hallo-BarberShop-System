import React from "react";

export default function BlogDetailHero({ blog }) {
  if (!blog) return null;
  const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCM0e_M-ed86Lt1ejSG_N3YTsP6pnM3yZN9z2A9Utvmt2ZLyHOIvpuNc_nQOcb5b-Y-dpVqsJGPHZZHMlddKWWuKcgDFSSEQEEHQjmRRLT_UIP1CaYJT47hunHO_C0ft50VwdNAWJEQvelpz8a9thNgGoOHFO3h_xmTs7n_3rt2W0kSCIWsIzmqHS9DdgBBgrysUfrCW-sRK1ZxazAwNxb-n7dE4a1Klx5zYSBaU47pyt5ixjkGxM0eym_ivu5GdG8c04Y9CvPUTCyJ";
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop mb-16">
      <div className="aspect-[21/9] overflow-hidden rounded-xl border border-outline-variant shadow-2xl relative bg-black flex items-center justify-center">
        <img 
          alt={blog.title}
          className="w-full h-full object-contain grayscale-hover" 
          src={blog.image || fallbackImage} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
