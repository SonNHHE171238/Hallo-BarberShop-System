import React from "react";
import Link from "next/link";

export default function BlogGrid({ posts = [] }) {
  
  // Fallback images to cycle through since DB lacks images
  const fallbackImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAzNPiQ8N89KnmpE_Y7-E5xO2GVdn3MD7Sr_oatXYobSUtPE-QSh1NzeCxmSgvVL9P1fIlpifGP_6z7u0aYl2VOxfIgeDvO1RbSTHDZCS6RqDT9p6Jgl0FKuP2ApMCBKwcS_TERuVDczoiMcRRQ99XifXMmaepMop2enb5CXdWOsC3MJFw8mG-90tVnMZNKeK4LxZwmZfSY5oCrynNu_yJWyELTuqZZgDZUxPnYxk3gVoPcayDSn0bB9SyWfiRdbSUI3gIZd87HWLrk",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCiZRg9E86akY3iqJeIrOHjCQh5lARhJuJWSMVYD_qul8n2vAe3cK7pVNkM4KmkgJ9RmtNaeb8NypvKQ60lJIusYEO0__yRvHp6zPbIOCSteC6JzAT2PlP2GVCa0Khl3YhbmEOO0qorVGQFsVsHEbkO7sf4d1mjCxyDXHoD5JBazvZGpqarufM3Mg8EJhF4yE4VSc8C5CaRQTa0XfVXwIjdrnlSW0sFhe5D45RI47LfXv--ZOw_cStleyHUraMndZwcn3X7461DgFSK",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0gP38Y7nzzS-z_NVIQDUyjoT1rv3hS4aDy1DokzTc0x8I1URNZpsHfsY0iEJ9134ZTv0UhDhU7kzq_iOeCEOtBIoVSRpEr1DCQxJvCcsfgxe7xacZHhJGTD5TqYysovvVrg1YUsypmbrlZMxfjFRIX8FtL6PALeOaBTBtsIOMf-GrDhNlsge4xn2aUhELkrDzhyouQ3jXOErCon9Qv2-F9FoBu8Gmk6B_misBz2C8qvUKnIlwvb_R_KkJn5vm-Rbe8Y_w9iS1wj57",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBSbvqiaX5y8Ck4Ry4RN3x5fihkAAfxjChZk1PbTtNwQJ_n48Pep5moicp-D2QDgHF1V-2J-iqQRe3Zui3571IkNf3KNBzW80DhNLvpAUb3QyFxdbdqmNru3kISHmYa7wyNVtIyxxBxYLJhdwrq-1FQk1DH3fh60IrhZtpYzohvnOGJ2R56vOhtWotWOXgNSAcGWrxxRM4WGg6XIq3z1Q1FVFmtow7n1J8q8jb-UKW9iTNJQtU_0kSOLfxvN3ANrZJ34t98mo7JgXD5"
  ];

  return (
    <>
      {/* Blog Grid */}
      <section className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto pt-24">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-outline mb-4">article</span>
            <p className="text-on-surface-variant">Chưa có bài viết nào khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {posts.map((blog, index) => {
              const dateObj = new Date(blog.createdAt);
              const formattedDate = `${dateObj.getDate()} TH${String(dateObj.getMonth() + 1).padStart(2, '0')}, ${dateObj.getFullYear()}`;
              const plainTextContent = blog.content ? blog.content.replace(/<[^>]+>/g, '') : "";
              const bgImg = fallbackImages[index % fallbackImages.length];

              return (
                <Link href={`/blog/${blog.slug}`} key={blog._id} className="group block">
                  <article className="flex flex-col glass-card rounded-xl overflow-hidden grayscale-hover transition-all duration-300 hover:-translate-y-2 h-full">
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        alt={blog.title}
                        className="w-full h-full object-cover" 
                        src={blog.image || bgImg} 
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-on-surface-variant text-xs font-label-md">
                          {formattedDate}
                        </span>
                      </div>
                      <h3 className="text-white font-headline-sm text-headline-sm mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-on-surface-variant font-body-md text-body-md mb-6 line-clamp-3">
                        {plainTextContent}
                      </p>
                      <div className="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between">
                        <span className="text-on-surface font-label-md text-label-md">
                          {blog.author?.name || "Admin"}
                        </span>
                        {/* Bookmark button removed per request */}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Pagination (Tạm thời tĩnh) */}
      {posts.length > 0 && (
        <section className="px-margin-mobile md:px-margin-desktop py-12 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded bg-primary text-on-primary font-label-md">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        </section>
      )}
    </>
  );
}
