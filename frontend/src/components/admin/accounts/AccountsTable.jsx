import React, { useMemo, useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { adminAccountService } from '@/services/adminAccount.service';
import toast from 'react-hot-toast';
import GenericConfirmModal from '@/components/ui/GenericConfirmModal';
import BarberUpcomingBookingsModal from './BarberUpcomingBookingsModal';

export default function AccountsTable({ searchTerm, roleFilter, onTotalCountChange }) {
    const { data: response, error, isLoading, mutate } = useSWR('/api/admin/accounts', async () => {
        return adminAccountService.getAllAccounts();
    });

    const accounts = response?.users || [];
    
    // Fix hydration mismatch for Next.js SSR
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter accounts based on search term and role filter
    const filteredAccounts = useMemo(() => {
        let result = accounts;

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

    // Pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const tableContainerRef = useRef(null);
    const [expandedRowId, setExpandedRowId] = useState(null);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, roleFilter]);

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Modal States
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleInitiateDelete = (account) => {
        setAccountToDelete(account);
        setConfirmModalOpen(true);
    };

    const handleConfirmDeleteClick = () => {
        if (!accountToDelete) return;
        setConfirmModalOpen(false);
        if (accountToDelete.role === 'barber') {
            setBookingsModalOpen(true);
        } else {
            executeDelete(accountToDelete._id || accountToDelete.id);
        }
    };

    const executeDelete = async (accountId) => {
        setIsDeleting(true);
        try {
            await adminAccountService.deleteAccount(accountId);
            toast.success('Xóa tài khoản thành công');
            setBookingsModalOpen(false);
            setAccountToDelete(null);
            mutate();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa tài khoản');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (accountId, currentStatus) => {
        const isBanning = currentStatus === 'active';
        const actionText = isBanning ? 'khóa' : 'mở khóa';
        if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
            return;
        }

        try {
            const newStatus = isBanning ? 'banned' : 'active';
            await adminAccountService.updateAccountStatus(accountId, newStatus);
            toast.success(`${isBanning ? 'Khóa' : 'Mở khóa'} tài khoản thành công`);
            mutate(); // Refresh the data
        } catch (error) {
            toast.error(error.message || `Có lỗi xảy ra khi ${actionText} tài khoản`);
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
        <div className="bg-surface-container/50 border border-outline-variant rounded-xl overflow-hidden backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex-1 flex flex-col min-h-0">
            <div ref={tableContainerRef} className="overflow-auto custom-scrollbar flex-1 relative">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead className="sticky top-0 bg-surface-container-low z-10 shadow-sm">
                        <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider text-[10px] sm:text-xs">
                            <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Tên người dùng</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Vai trò</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Email</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Số điện thoại</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Trạng thái</th>
                            <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 font-semibold text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="font-body-md text-[13px] md:text-[14px] text-on-surface divide-y divide-outline-variant/50" suppressHydrationWarning>
                        {(!isMounted || isLoading) ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-6 text-center text-on-surface-variant animate-pulse">Đang tải dữ liệu...</td>
                            </tr>
                        ) : filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-6 text-center text-on-surface-variant">Không tìm thấy tài khoản nào.</td>
                            </tr>
                        ) : (
                            paginatedAccounts.map(account => (
                                <React.Fragment key={account._id || account.id}>
                                <tr 
                                    onClick={() => setExpandedRowId(expandedRowId === (account._id || account.id) ? null : (account._id || account.id))}
                                    className="hover:bg-surface-container-highest/50 transition-colors group cursor-pointer lg:cursor-default"
                                >
                                    <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary font-headline-sm font-bold overflow-hidden text-xs">
                                                {account.avatarUrl ? (
                                                    <img src={account.avatarUrl} alt={account.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (account.name || 'U').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center">
                                                    {account.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                                        {getRoleBadge(account.role)}
                                    </td>
                                    <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-on-surface-variant max-w-[120px] sm:max-w-none truncate">{account.email}</td>
                                    <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-on-surface-variant">{account.phone || 'N/A'}</td>
                                    <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                                        {getStatusIndicator(account.status)}
                                    </td>
                                    <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {account.role === 'customer' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(account._id || account.id, account.status); }}
                                                    className={`p-1.5 transition-colors rounded ${account.status === 'active' ? 'text-error hover:bg-error/10' : 'text-[#4ADE80] hover:bg-[#4ADE80]/10'}`} 
                                                    title={account.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                >
                                                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                                                        {account.status === 'active' ? 'lock' : 'lock_open'}
                                                    </span>
                                                </button>
                                            )}
                                            {['admin', 'staff', 'barber'].includes(account.role) && (
                                                <span className="text-outline text-[9px] sm:text-[10px] uppercase tracking-wider">Không thể xóa ở đây</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {/* Mobile Expanded Row for Actions */}
                                {expandedRowId === (account._id || account.id) && (
                                    <tr className="lg:hidden bg-surface-container/30 border-b border-outline-variant/50">
                                        <td colSpan="5" className="px-3 py-2 sm:px-4 sm:py-3 border-l-2 border-primary">
                                            <div className="flex items-center justify-end gap-3">
                                               <span className="text-[10px] text-on-surface-variant font-bold uppercase mr-auto tracking-widest">Thao tác tài khoản:</span>
                                               {account.role === 'customer' ? (
                                                    <button 
                                                        onClick={() => handleToggleStatus(account._id || account.id, account.status)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-md text-xs font-bold ${account.status === 'active' ? 'text-error bg-error/10 hover:bg-error/20' : 'text-[#4ADE80] bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20'}`} 
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            {account.status === 'active' ? 'lock' : 'lock_open'}
                                                        </span>
                                                        {account.status === 'active' ? 'Khóa' : 'Mở khóa'}
                                                    </button>
                                                ) : (
                                                    <span className="text-outline text-[10px] uppercase tracking-wider">Không thể xóa ở đây</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Footer */}
            {(isMounted && totalPages > 0) && (
                <div className="border-t border-outline-variant bg-surface-container-low px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="text-label-md font-label-md text-on-surface-variant hidden sm:block">
                        Hiển thị {(page - 1) * itemsPerPage + 1} đến {Math.min(page * itemsPerPage, filteredAccounts.length)} trong số {filteredAccounts.length} tài khoản
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <button 
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button 
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`w-8 h-8 rounded font-label-md text-sm font-semibold transition-colors ${
                                    page === p 
                                        ? 'bg-primary text-on-primary' 
                                        : 'border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
            <GenericConfirmModal 
                isOpen={confirmModalOpen}
                title="Xóa tài khoản"
                message={`Bạn có chắc chắn muốn xóa tài khoản ${accountToDelete?.name}? Tài khoản sẽ bị khóa và không thể đăng nhập.`}
                onConfirm={handleConfirmDeleteClick}
                onCancel={() => setConfirmModalOpen(false)}
            />
            {accountToDelete && accountToDelete.role === 'barber' && (
                <BarberUpcomingBookingsModal 
                    isOpen={bookingsModalOpen}
                    onClose={() => setBookingsModalOpen(false)}
                    barber={{ id: accountToDelete._id || accountToDelete.id, name: accountToDelete.name }}
                    onAllResolved={() => executeDelete(accountToDelete._id || accountToDelete.id)}
                />
            )}
        </div>
    );
}
