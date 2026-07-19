import BlogDetailPage from "@/page/blog/BlogDetailPage";

export const metadata = {
  title: "HALLO BARBER | Nghệ Thuật Cắt Tỉa & Phong Cách Quý Tộc",
  description: "Trang chi tiết bài viết blog",
};

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <BlogDetailPage slug={resolvedParams.slug} />;
}
