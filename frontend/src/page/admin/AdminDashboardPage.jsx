"use client";

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMetricsGrid from '@/components/admin/AdminMetricsGrid';
import AdminChartsAndRankings from '@/components/admin/AdminChartsAndRankings';
import AdminRecentAppointments from '@/components/admin/AdminRecentAppointments';

export default function AdminDashboardPage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased h-screen flex overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* Sidebar Navigation */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-surface-obsidian">
        {/* Top App Bar */}
        <AdminHeader />
        
        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
            <AdminMetricsGrid />
            <AdminChartsAndRankings />
            <AdminRecentAppointments />
            
            {/* Bottom Spacer */}
            <div className="h-12 md:h-16 flex items-center justify-center opacity-30 mt-8">
              <span className="w-16 h-[1px] bg-outline-gold"></span>
              <span className="mx-4 font-label-md text-[10px] uppercase tracking-[0.3em]">Hallo Barber Heritage Est. 1994</span>
              <span className="w-16 h-[1px] bg-outline-gold"></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
