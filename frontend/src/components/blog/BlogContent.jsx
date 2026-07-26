import React from "react";

export default function BlogContent({ blog }) {
  if (!blog) return null;

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-0">
      <article 
        className="article-content font-body-lg text-body-lg text-on-surface-variant leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: blog.content || "" }}
      />
      
    </div>
  );
}
