"use client";

import React, { useState } from 'react';
import AccountsTable from '@/components/admin/accounts/AccountsTable';
import AddAccountModal from '@/components/admin/accounts/AddAccountModal';

export default function AdminAccountsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Pass total count state from child to parent
    const [totalCount, setTotalCount] = useState(0);

    return (
        <div className="max-w-[1400px] mx-auto w-full">
            {/* Page Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">Quản Lý Tài Khoản</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-xl">
                        Quản lý phân quyền, trạng thái và thông tin liên lạc của tất cả nhân sự trong hệ thống.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-on-primary font-label-md text-label-md font-semibold px-6 py-3 rounded hover:scale-95 transition-transform duration-200 flex items-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(255,222,165,0.15)]"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm tài khoản mới
                </button>
            </div>

            {/* Controls (Search & Filter) */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-end justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative w-full md:w-80 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface rounded pl-10 pr-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/50 font-body-md transition-all" 
                            placeholder="Tìm kiếm theo tên, email..." 
                            type="text"
                        />
                    </div>
                    {/* Filter Dropdown */}
                    <div className="relative w-full md:w-48">
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface rounded pl-4 pr-10 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md appearance-none cursor-pointer transition-all"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="staff">Nhân viên Lễ tân</option>
                            <option value="barber">Thợ cắt tóc</option>
                            <option value="customer">Khách hàng</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                </div>
                <div className="text-on-surface-variant font-label-md text-label-md">
                    Tổng cộng: <span className="text-primary">{totalCount}</span> tài khoản
                </div>
            </div>

            {/* Data Table */}
            <AccountsTable 
                searchTerm={searchTerm} 
                roleFilter={roleFilter} 
                onTotalCountChange={setTotalCount} 
            />

            {/* Modals */}
            <AddAccountModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
        </div>
    );
}
