import React from "react";

export default function BlogContent({ content }) {
  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-0">
      <article 
        className="article-content font-body-lg text-body-lg text-on-surface-variant leading-relaxed [&>p]:mb-4 [&>h2]:font-serif-accent [&>h2]:italic [&>h2]:text-3xl [&>h2]:text-primary [&>h2]:mt-12 [&>h2]:mb-6 [&>h3]:font-headline-sm [&>h3]:text-on-surface [&>h3]:mt-10 [&>h3]:mb-4 [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-serif-accent [&>p:first-of-type]:first-letter:text-primary [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:float-left"
        dangerouslySetInnerHTML={{ __html: content || "<p>Đang tải nội dung...</p>" }}
      />
      
    </div>
  );
}
