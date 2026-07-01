"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isPosPage = pathname === '/admin/pos';

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="bg-surface text-on-surface font-body-md antialiased h-screen flex overflow-hidden selection:bg-primary selection:text-on-primary">
        <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-surface-obsidian">
          <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
          <div className={`flex-1 flex flex-col ${isPosPage ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8'} custom-scrollbar`}>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
