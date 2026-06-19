"use client";

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ServicePageHeader from '@/components/admin/services/ServicePageHeader';
import ServiceFilterBar from '@/components/admin/services/ServiceFilterBar';
import ServiceTable from '@/components/admin/services/ServiceTable';
import ServicePagination from '@/components/admin/services/ServicePagination';

export default function AdminServicesPage() {
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
          <div className="max-w-container-max mx-auto w-full">
            <ServicePageHeader />
            <ServiceFilterBar />
            <div className="flex flex-col">
              <ServiceTable />
              <ServicePagination />
            </div>
            
            {/* Bottom Spacer */}
            <div className="h-12 md:h-16 flex items-center justify-center opacity-30 mt-12">
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
