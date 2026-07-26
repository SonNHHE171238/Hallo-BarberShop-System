import React from "react";
import Link from "next/link";

export default function RelatedPosts({ posts = [] }) {
  if (!posts || posts.length === 0) return null;

  const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCSDz_CIvWXdwd6q9MX53o3IyEnrUy3qsb6dhMuDjUD6z7KdGmsQtSukVYVqkp6NFFTf9-bR8Q_sD24zxyQfw-Iskdt3VLocOFApiGN04iiAzOPO6AIK_aFYDhMmevcnE6End3xRO1Ea1h3ttEvgihr2iIdrDYsg-A1k62repMuqHsMvHZnz1hVHyi3HmUMEBjS5wa2mAuGrzbjdK-x86R4xB7dn_eMNcnLRPM4zHvGQMdbj16KWjrZLmJ79Scv2wlKOIABg-OqUZjb";

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-24">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-10 text-center md:text-left">Bài viết liên quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {posts.map((post) => {
          const plainTextContent = post.content ? post.content.replace(/<[^>]+>/g, '') : "";
          
          return (
            <Link href={`/blog/${post.slug}`} key={post._id} className="group block">
              <div className="group bg-surface-container rounded-xl border border-outline-variant overflow-hidden hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-black flex items-center justify-center">
                  <img 
                    alt={post.title} 
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                    src={post.image || fallbackImage} 
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-label-md font-label-md text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">Bài viết</span>
                  <h3 className="font-headline-sm text-on-surface mt-4 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-body-md text-on-surface-variant mt-2 line-clamp-2">{plainTextContent}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
