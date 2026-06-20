import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CustomerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff', 'barber', 'customer']}>
      {children}
    </ProtectedRoute>
  );
}
