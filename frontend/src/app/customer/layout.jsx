import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CustomerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      {children}
    </ProtectedRoute>
  );
}
