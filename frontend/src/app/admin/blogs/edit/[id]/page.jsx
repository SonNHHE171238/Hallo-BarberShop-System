import AdminBlogEditorPage from "@/page/admin/AdminBlogEditorPage";

export const metadata = {
  title: "Chỉnh Sửa Bài Viết | HALLO BARBER",
  description: "Trang chỉnh sửa bài viết dành cho Admin",
};

export default function EditBlogRoute({ params }) {
  const { id } = params;
  return <AdminBlogEditorPage isEdit={true} blogId={id} />;
}
