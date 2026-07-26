import AdminBlogEditorPage from "@/page/admin/AdminBlogEditorPage";

export const metadata = {
  title: "Chỉnh Sửa Bài Viết | HALLO BARBER",
  description: "Trang chỉnh sửa bài viết dành cho Admin",
};

export default async function EditBlogRoute({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return <AdminBlogEditorPage isEdit={true} blogId={id} />;
}
