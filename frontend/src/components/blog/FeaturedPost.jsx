import React from "react";
import Link from "next/link";

export default function FeaturedPost({ post }) {
  if (!post) return null;

  // Fallback image since DB doesn't have thumbnail yet
  const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCr_pN-tKDT2cQoE-hJd67hsdQ-gR7ERI2cn908oN-bQsjwoFhUnY47V8J_Ssc8PhzVprjXQMhPf-rndV3qmpSoqbqHPdu-VjQZpH-sceh9AuclTh9aycUr9JCZxLItR9tgX8VcN0byZ56gHYNuqdPdaU3WT0q7u9K_XXXWpK6HJJE5HXcw3ITzyA6OlwVagFT3WagnrhrQ-eAo0CazxEFcjF5oUI4o87TTTGNK5Hzke-BjveNd1SuVCKvWundObxxWh5FbLrDf6Pa5";

  // Format date
  const dateObj = new Date(post.createdAt);
  const formattedDate = `${dateObj.getDate()} TH${String(dateObj.getMonth() + 1).padStart(2, '0')}, ${dateObj.getFullYear()}`;

  // Simple strip HTML for excerpt
  const plainTextContent = post.content ? post.content.replace(/<[^>]+>/g, '') : "";

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-base max-w-container-max mx-auto">
      <div className="glass-card group grayscale-hover overflow-hidden rounded-xl flex flex-col md:flex-row shadow-2xl">
        <div className="md:w-3/5 h-[300px] md:h-[500px] overflow-hidden">
          <img
            alt={post.title}
            className="w-full h-full object-cover"
            src={post.image || fallbackImage}
          />
        </div>
        <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-primary/20 text-primary px-3 py-1 text-label-md font-label-md rounded tracking-widest uppercase">
              BÀI MỚI NHẤT
            </span>
            <span className="text-on-surface-variant text-label-md font-label-md">
              {formattedDate}
            </span>
          </div>
          
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-white font-headline-lg text-headline-lg mb-6 group-hover:text-primary transition-colors cursor-pointer line-clamp-3">
              {post.title}
            </h2>
          </Link>
          
          <p className="text-on-surface-variant font-body-md text-body-md mb-8 line-clamp-3">
            {plainTextContent}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <span className="text-on-surface font-label-md text-label-md">
                {post.author?.name || "Admin"}
              </span>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
            >
              ĐỌC TIẾP <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
