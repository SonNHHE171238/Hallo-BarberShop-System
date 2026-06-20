"use client";

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBarberManagement from '@/components/admin/AdminBarberManagement';

export default function AdminBarberManagementPage() {
    return (
        <div className="bg-surface text-on-surface font-body-md antialiased h-screen flex overflow-hidden selection:bg-primary selection:text-on-primary">
            <AdminSidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-surface-obsidian">
                <AdminHeader />
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-container-max mx-auto w-full">
                        <AdminBarberManagement />
                    </div>
                </div>
            </main>
        </div>
    );
}
