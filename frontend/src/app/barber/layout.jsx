import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function BarberLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'barber']}>
      {children}
    </ProtectedRoute>
  );
}
