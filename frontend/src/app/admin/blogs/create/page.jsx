import AdminBlogEditorPage from "@/page/admin/AdminBlogEditorPage";

export const metadata = {
  title: "Tạo Bài Viết | HALLO BARBER",
  description: "Trang tạo bài viết mới dành cho Admin",
};

export default function CreateBlogRoute() {
  return <AdminBlogEditorPage isEdit={false} />;
}
