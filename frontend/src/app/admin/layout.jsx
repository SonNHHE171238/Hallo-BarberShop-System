"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="bg-surface text-on-surface font-body-md antialiased h-screen flex overflow-hidden selection:bg-primary selection:text-on-primary">
        <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-surface-obsidian">
          <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {children}
            {/* Bottom Spacer */}
            <div className="h-12 md:h-16 flex items-center justify-center opacity-30 mt-12">
              <span className="w-16 h-[1px] bg-outline-gold"></span>
              <span className="mx-4 font-label-md text-[10px] uppercase tracking-[0.3em]">Hallo Barber Heritage Est. 1994</span>
              <span className="w-16 h-[1px] bg-outline-gold"></span>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
