import AdminBlogEditorPage from "@/page/admin/AdminBlogEditorPage";

export const metadata = {
  title: "Chỉnh Sửa Bài Viết | HALLO BARBER Staff",
  description: "Trang chỉnh sửa bài viết dành cho Staff",
};

export default function EditBlogRoute({ params }) {
  const { id } = params;
  return <AdminBlogEditorPage isEdit={true} blogId={id} />;
}
