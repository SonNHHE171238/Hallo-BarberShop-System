import React from "react";

export default function BlogContent({ blog }) {
  if (!blog) return null;

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-0">
      <article 
        className="article-content font-body-lg text-body-lg text-on-surface-variant leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: blog.content || "" }}
      />
      
      {/* Social Share */}
      <div className="flex items-center justify-center space-x-4 mt-16 pt-8 border-t border-outline-variant">
        <span className="text-label-md text-outline uppercase tracking-widest">Chia sẻ:</span>
        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">share</span>
        </button>
      </div>
    </div>
  );
}
