import AdminBlogEditorPage from "@/page/admin/AdminBlogEditorPage";

export const metadata = {
  title: "Tạo Bài Viết | HALLO BARBER Staff",
  description: "Trang tạo bài viết mới dành cho Staff",
};

export default function CreateBlogRoute() {
  return <AdminBlogEditorPage isEdit={false} />;
}
