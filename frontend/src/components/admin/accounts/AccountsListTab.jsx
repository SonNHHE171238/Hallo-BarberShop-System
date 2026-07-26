"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import AddAccountModal from '@/components/admin/accounts/AddAccountModal';

const AccountsTable = dynamic(() => import('@/components/admin/accounts/AccountsTable'), { 
    ssr: false,
    loading: () => (
        <div className="bg-surface-container/50 border border-outline-variant rounded-xl p-12 flex justify-center items-center flex-1">
            <span className="text-on-surface-variant animate-pulse font-medium">Đang tải bảng dữ liệu...</span>
        </div>
    )
});

export default function AccountsListTab() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in fade-in">
            {/* Page Header Section */}
            <div className="flex justify-end items-center mb-4 md:mb-6 shrink-0">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full md:w-auto justify-center bg-primary text-on-primary font-label-md text-[12px] md:text-label-md font-semibold px-4 py-2.5 md:px-6 md:py-3 rounded hover:scale-95 transition-transform duration-200 flex items-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(255,222,165,0.15)]"
                >
                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">add</span>
                    Thêm tài khoản mới
                </button>
            </div>

            {/* Controls (Search & Filter) */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6 items-end justify-between shrink-0">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative w-full md:w-80 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] md:text-[24px] text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface rounded pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-[13px] md:text-[16px] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/50 font-body-md transition-all" 
                            placeholder="Tìm kiếm theo tên, email..." 
                            type="text"
                        />
                    </div>
                    {/* Filter Dropdown */}
                    <div className="relative w-full md:w-48">
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface rounded pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-2.5 text-[13px] md:text-[16px] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md appearance-none cursor-pointer transition-all"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="staff">Nhân viên Lễ tân</option>
                            <option value="barber">Thợ cắt tóc</option>
                            <option value="customer">Khách hàng</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[18px] md:text-[24px] text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                </div>
                <div className="text-on-surface-variant font-label-md text-[12px] md:text-[14px] w-full md:w-auto text-right md:text-left mt-1 md:mt-0">
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
