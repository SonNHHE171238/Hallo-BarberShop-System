import React from "react";
import Link from "next/link";

export default function RelatedPosts() {
  const posts = [
    {
      id: 1,
      title: "5 Kiểu Tóc Pompadour Không Bao Giờ Lỗi Mốt",
      excerpt: "Khám phá những biến thể của kiểu tóc Pompadour huyền thoại phù hợp với gương mặt Á Đông.",
      category: "Phong cách",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSDz_CIvWXdwd6q9MX53o3IyEnrUy3qsb6dhMuDjUD6z7KdGmsQtSukVYVqkp6NFFTf9-bR8Q_sD24zxyQfw-Iskdt3VLocOFApiGN04iiAzOPO6AIK_aFYDhMmevcnE6End3xRO1Ea1h3ttEvgihr2iIdrDYsg-A1k62repMuqHsMvHZnz1hVHyi3HmUMEBjS5wa2mAuGrzbjdK-x86R4xB7dn_eMNcnLRPM4zHvGQMdbj16KWjrZLmJ79Scv2wlKOIABg-OqUZjb"
    },
    {
      id: 2,
      title: "Bí Quyết Chăm Sóc Râu Tại Nhà Như Chuyên Gia",
      excerpt: "Hướng dẫn chi tiết quy trình 5 bước để có một bộ râu bóng khỏe và lịch lãm mỗi ngày.",
      category: "Chăm sóc",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAN2APBz5zn6D--mbgY_-NEuKR_k9v2qyIKUDXfOE9bdluvh1w_6SftjDBERXNy_Lh6poQAZK0k0iCNmK7xfwIdFt3ODllVk1b0wiKp9NSYCcZVDVZKDeNs_tYb0UxgArP6xHwu2lTxVkKHZzgh_zqxtDPvIixMruzNAS-Pr66JLAXmzuxBNduXND9yssgJS2mF7ycq4W-ImM6qBMYuOhBuz-YdcYmX9xi013_PN__PuB2oLk6OTNiaVAEcl0DDMYMw3mXlv3A9qHR"
    },
    {
      id: 3,
      title: "Phân Biệt Fade Và Taper: Lựa Chọn Nào Cho Bạn?",
      excerpt: "Đừng nhầm lẫn giữa hai kỹ thuật này. Hãy cùng các Master Barber phân tích sự khác biệt.",
      category: "Kiến thức",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJP_iRSLAsMoIIbNvMzVS4M2Auhkhc0BPpmpiPHW8yzXggqAYZkUUgJiad-XpaerW5pdUENzeG7dH1nUoFTh44YuQVagPZHLK4xJMk2sRfMQKI4A2LGpOmmjg0dOh4td89g06xayxPlSU7OuXcin2EKATus2cih0ugEpTGDqcTc9O8rJdVMOC2dWwKvNjSxeA-5qC1Hi7sMtmAkNSpzaasfrhmJd6ls9-6LT68bJIdTXGSJScxX0doMGi8sCVj-RcX1iVx0yO_NbFF"
    }
  ];

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-24">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-10 text-center md:text-left">Bài viết liên quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {posts.map((post) => (
          <div key={post.id} className="group bg-surface-container rounded-xl border border-outline-variant overflow-hidden hover:-translate-y-2 transition-all duration-300">
            <div className="aspect-[16/10] overflow-hidden">
              <img 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                src={post.image} 
              />
            </div>
            <div className="p-6">
              <span className="text-label-md font-label-md text-primary bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
              <h3 className="font-headline-sm text-on-surface mt-4 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-body-md text-on-surface-variant mt-2 line-clamp-2">{post.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
