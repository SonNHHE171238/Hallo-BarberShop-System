import BlogDetailPage from "@/page/blog/BlogDetailPage";

export const metadata = {
  title: "HALLO BARBER | Nghệ Thuật Cắt Tỉa & Phong Cách Quý Tộc",
  description: "Trang chi tiết bài viết blog",
};

export default function Page({ params }) {
  // Use params.slug if needed, for static UI we just render the page
  return <BlogDetailPage slug={params.slug} />;
}
