import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StaffHeader from "@/components/layout/StaffHeader";
import StaffFooter from "@/components/layout/StaffFooter";

export default function StaffLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <StaffHeader />
        <div className="pt-20 flex-1 flex flex-col">
          {children}
        </div>
        <StaffFooter />
      </div>
    </ProtectedRoute>
  );
}
