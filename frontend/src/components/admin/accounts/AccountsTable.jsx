import React, { useMemo, useEffect, useState } from 'react';
import useSWR from 'swr';
import { adminAccountService } from '@/services/adminAccount.service';
import toast from 'react-hot-toast';

export default function AccountsTable({ searchTerm, roleFilter, onTotalCountChange }) {
    const { data: response, error, isLoading, mutate } = useSWR('/api/admin/accounts', async () => {
        return adminAccountService.getAllAccounts();
    });

    const accounts = response?.users || [];
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // Filter accounts based on search term and role filter
    const filteredAccounts = useMemo(() => {
        let result = [...accounts]; 

        if (roleFilter) {
            result = result.filter(account => account.role === roleFilter);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(account => 
                (account.name && account.name.toLowerCase().includes(lowerSearch)) ||
                (account.email && account.email.toLowerCase().includes(lowerSearch)) ||
                (account.phone && account.phone.includes(lowerSearch))
            );
        }

        return result;
    }, [accounts, searchTerm, roleFilter]);

    // Update parent's total count
    useEffect(() => {
        onTotalCountChange(filteredAccounts.length);
    }, [filteredAccounts.length, onTotalCountChange]);

    // Reset trang về 1 khi thay đổi filter
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
    const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleDelete = async (accountId) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.')) {
            return;
        }

        try {
            await adminAccountService.deleteAccount(accountId);
            toast.success('Xóa tài khoản thành công');
            mutate(); // Refresh the data
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa tài khoản');
        }
    };

    const handleStatusChange = async (accountId, newStatus) => {
        try {
            await adminAccountService.updateAccountStatus(accountId, newStatus);
            toast.success('Cập nhật trạng thái thành công');
            mutate();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-label-md font-medium bg-primary/10 text-primary border border-primary/20">Quản trị viên</span>;
            case 'barber':
                return <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-label-md font-medium border border-outline-variant text-on-surface-variant">Thợ cắt tóc</span>;
            case 'staff':
                return <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-label-md font-medium border border-outline-variant text-on-surface-variant">Nhân viên Lễ tân</span>;
            case 'customer':
                return <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-label-md font-medium border border-outline-variant text-on-surface-variant">Khách hàng</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-label-md font-medium border border-outline-variant text-on-surface-variant">{role}</span>;
        }
    };

    const getStatusIndicator = (status) => {
        if (status === 'active') {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4ADE80]"></div>
                    <span className="text-on-surface font-medium text-sm">Hoạt động</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-surface-variant border border-outline-variant"></div>
                <span className="text-on-surface-variant font-medium text-sm">
                    {status === 'banned' ? 'Bị khóa' : 'Tạm khóa'}
                </span>
            </div>
        );
    };

    if (error) return <div className="text-error p-4 bg-surface-container rounded border border-error/30 text-center">Lỗi tải dữ liệu tài khoản. Vui lòng tải lại trang.</div>;

    return (
        <div className="bg-surface-container/50 border border-outline-variant rounded-xl overflow-hidden backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                        <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider text-xs">
                            <th className="px-4 py-3 font-semibold">Tên người dùng</th>
                            <th className="px-4 py-3 font-semibold">Vai trò</th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Số điện thoại</th>
                            <th className="px-4 py-3 font-semibold">Trạng thái</th>
                            <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="font-body-md text-[15px] text-on-surface divide-y divide-outline-variant/50">
                        {isLoading ? (
                            <tr key="loading">
                                <td colSpan="6" className="px-4 py-6 text-center text-on-surface-variant animate-pulse">Đang tải dữ liệu...</td>
                            </tr>
                        ) : filteredAccounts.length === 0 ? (
                            <tr key="empty">
                                <td colSpan="6" className="px-4 py-6 text-center text-on-surface-variant">Không tìm thấy tài khoản nào.</td>
                            </tr>
                        ) : (
                            paginatedAccounts.map((account, index) => (
                                <tr key={account.id || account._id || index} className="hover:bg-surface-container-highest/50 transition-colors group">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary font-headline-sm font-bold overflow-hidden text-sm">
                                                {account.profileImageUrl ? (
                                                    <img src={account.profileImageUrl} alt={account.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (account.name || 'U').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                                                    {account.name}
                                                    <span className="text-[11px] text-on-surface-variant/50 font-mono tracking-tighter">#{(account.id || account._id) ? String(account.id || account._id).substring(String(account.id || account._id).length - 6).toUpperCase() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {getRoleBadge(account.role)}
                                    </td>
                                    <td className="px-4 py-2.5 text-on-surface-variant">{account.email}</td>
                                    <td className="px-4 py-2.5 text-on-surface-variant">{account.phone || 'N/A'}</td>
                                    <td className="px-4 py-2.5">
                                        <select
                                            value={account.status || 'active'}
                                            onChange={(e) => handleStatusChange(account.id || account._id, e.target.value)}
                                            disabled={account.role === 'admin' || account.role === 'barber'}
                                            title={account.role === 'barber' ? 'Vui lòng sang trang Quản lý Thợ để khóa tài khoản' : ''}
                                            className={`bg-transparent border rounded px-2 py-1 text-sm outline-none cursor-pointer transition-colors ${
                                                account.status === 'active' ? 'border-[#4ADE80] text-[#4ADE80] focus:border-[#4ADE80]' : 
                                                account.status === 'suspended' ? 'border-[#FBBF24] text-[#FBBF24] focus:border-[#FBBF24]' : 
                                                'border-error text-error focus:border-error'
                                            }`}
                                        >
                                            <option value="active" className="text-on-surface">Active</option>
                                            <option value="suspended" className="text-on-surface">Suspended</option>
                                            <option value="banned" className="text-on-surface">Banned</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Chỉnh sửa role/status bị ẩn theo yêu cầu */}
                                            {!['admin', 'barber'].includes(account.role) && (
                                                <button 
                                                    onClick={() => handleDelete(account.id || account._id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-error/10" 
                                                    title="Xóa tài khoản vĩnh viễn"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            )}
                                            {account.role === 'admin' && (
                                                <span className="text-outline text-[10px] uppercase tracking-wider">Không thể xóa</span>
                                            )}
                                            {account.role === 'barber' && (
                                                <span className="text-outline text-[10px] uppercase tracking-wider" title="Sang trang Quản lý Thợ">Khóa ở trang Thợ</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="border-t border-outline-variant bg-surface-container-low px-6 py-4 flex items-center justify-between">
                <div className="text-label-md font-label-md text-on-surface-variant">
                    Hiển thị {filteredAccounts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} đến {Math.min(currentPage * ITEMS_PER_PAGE, filteredAccounts.length)} trong số {filteredAccounts.length} tài khoản
                </div>
                {totalPages > 1 && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button 
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded font-label-md text-sm font-semibold flex items-center justify-center transition-colors ${
                                    currentPage === page 
                                    ? 'bg-primary text-on-primary' 
                                    : 'border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary'
                                }`}>
                                {page}
                            </button>
                        ))}

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
