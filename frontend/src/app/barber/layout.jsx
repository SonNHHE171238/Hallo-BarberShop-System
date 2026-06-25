import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BarberHeader from "@/components/layout/BarberHeader";

export default function BarberLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['barber']}>
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md">
        <BarberHeader />
        <main className="flex-1 mt-20 pb-10">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
