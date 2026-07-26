"use client";

import React, { useState } from 'react';
import AccountsListTab from '@/components/admin/accounts/AccountsListTab';
import EmployeeListTab from '@/components/admin/accounts/EmployeeListTab';

export default function AdminAccountsPage() {
    const [mainTab, setMainTab] = useState("accounts"); // 'accounts', 'employees'

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-margin-desktop py-4 w-full h-[calc(100vh-80px)] flex flex-col overflow-hidden">
            
            {/* Top Navigation Tabs */}
            <div className="flex gap-8 border-b border-outline-variant mb-6 shrink-0">
                <button
                    onClick={() => setMainTab("accounts")}
                    className={`pb-4 text-label-md uppercase tracking-wider font-bold transition-all relative ${
                        mainTab === "accounts" 
                        ? "text-primary" 
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                >
                    Danh sách Tài khoản
                    {mainTab === "accounts" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setMainTab("employees")}
                    className={`pb-4 text-label-md uppercase tracking-wider font-bold transition-all relative ${
                        mainTab === "employees" 
                        ? "text-primary" 
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                >
                    Danh sách Nhân sự
                    {mainTab === "employees" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                    )}
                </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-hidden">
                {mainTab === "accounts" && <AccountsListTab />}
                {mainTab === "employees" && <EmployeeListTab />}
            </div>

        </div>
    );
}
