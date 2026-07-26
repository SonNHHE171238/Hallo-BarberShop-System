"use client";
import React, { useMemo, useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { adminAccountService } from "@/services/adminAccount.service";
import toast from "react-hot-toast";
import { formatDateTime } from "@/utils/formatters";
import CustomerHistoryModal from "./CustomerHistoryModal";
import GenericConfirmModal from "@/components/ui/GenericConfirmModal";

export default function CustomerListTab() {
  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/admin/accounts", async () => {
    return adminAccountService.getAllAccounts();
  });

  const [searchTerm, setSearchTerm] = useState("");
  const accounts = response?.users || [];

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredAccounts = useMemo(() => {
    let result = accounts.filter(account => account.role === "customer");

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (account) =>
          (account.name && account.name.toLowerCase().includes(lowerSearch)) ||
          (account.email &&
            account.email.toLowerCase().includes(lowerSearch)) ||
          (account.phone && account.phone.includes(lowerSearch)),
      );
    }
    return result;
  }, [accounts, searchTerm]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const tableContainerRef = useRef(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [customerToToggle, setCustomerToToggle] = useState(null);

  const initiateToggleStatus = (account) => {
    setCustomerToToggle(account);
    setConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!customerToToggle) return;
    setConfirmModalOpen(false);
    
    const isBanning = customerToToggle.status === "active";
    const actionText = isBanning ? "khóa" : "mở khóa";

    try {
      const newStatus = isBanning ? "banned" : "active";
      await adminAccountService.updateAccountStatus(customerToToggle._id || customerToToggle.id, newStatus);
      toast.success(`${isBanning ? "Khóa" : "Mở khóa"} tài khoản thành công`);
      mutate();
    } catch (error) {
      toast.error(error.message || `Có lỗi xảy ra khi ${actionText} tài khoản`);
    }
  };

  const getStatusIndicator = (status) => {
    if (status === "active") {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4ADE80]"></div>
          <span className="text-on-surface font-medium text-sm">Hoạt động</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-error border border-error/50"></div>
        <span className="text-error font-medium text-sm">
          {status === "banned" ? "Bị khóa" : "Tạm khóa"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0 mt-2">
        <div className="relative w-full md:w-80 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] md:text-[24px] text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface rounded pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-[13px] md:text-[16px] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/50 font-body-md transition-all" 
              placeholder="Tìm kiếm khách hàng theo tên, email, sđt..." 
              type="text"
          />
        </div>
        <div className="text-on-surface-variant font-label-md text-[12px] md:text-[14px]">
          Tổng cộng: <span className="text-primary font-bold">{filteredAccounts.length}</span> khách hàng
        </div>
      </div>

      <div className="bg-surface-container/50 border border-outline-variant rounded-xl overflow-hidden backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex-1 flex flex-col min-h-0">
        <div
          ref={tableContainerRef}
          className="overflow-auto custom-scrollbar flex-1 relative"
        >
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="sticky top-0 bg-surface-container-low z-10 shadow-sm">
              <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider text-[10px] sm:text-xs">
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Tên người dùng</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Liên hệ</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Ngày tham gia</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Điểm Loyalty</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">Trạng thái</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody
              className="font-body-md text-[13px] md:text-[14px] text-on-surface divide-y divide-outline-variant/50"
            >
              {!isMounted || isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-on-surface-variant animate-pulse"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-error p-8 text-center">
                    Lỗi tải dữ liệu. Vui lòng thử lại.
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-on-surface-variant">
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account) => (
                  <React.Fragment key={account._id || account.id}>
                    <tr
                      onClick={() =>
                        setExpandedRowId(
                          expandedRowId === (account._id || account.id)
                            ? null
                            : account._id || account.id,
                        )
                      }
                      className="hover:bg-surface-container-highest/50 transition-colors group cursor-pointer lg:cursor-default"
                    >
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary font-headline-sm font-bold overflow-hidden text-xs">
                            {account.avatarUrl ? (
                              <img
                                src={account.avatarUrl}
                                alt={account.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (account.name || "U").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                              {account.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-on-surface truncate">{account.email}</span>
                          <span className="text-on-surface-variant text-xs">{account.phone || "Chưa có SĐT"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-on-surface-variant">
                        {formatDateTime(account.createdAt)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <span className="inline-flex items-center gap-1 font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full text-xs">
                          <span className="material-symbols-outlined text-[14px]">stars</span>
                          {account.loyaltyPoints || 0} điểm
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        {getStatusIndicator(account.status)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomer(account);
                                    setHistoryModalOpen(true);
                                }}
                                className="p-1.5 transition-colors rounded text-primary hover:bg-primary/10"
                                title="Xem lịch sử"
                            >
                                <span className="material-symbols-outlined text-[18px]">history</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                initiateToggleStatus(account);
                              }}
                              className={`p-1.5 transition-colors rounded ${account.status === "active" ? "text-error hover:bg-error/10" : "text-[#4ADE80] hover:bg-[#4ADE80]/10"}`}
                              title={
                                account.status === "active"
                                  ? "Khóa tài khoản"
                                  : "Mở khóa tài khoản"
                              }
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {account.status === "active"
                                  ? "lock"
                                  : "lock_open"}
                              </span>
                            </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRowId === (account._id || account.id) && (
                      <tr className="lg:hidden bg-surface-container/30 border-b border-outline-variant/50">
                        <td
                          colSpan="6"
                          className="px-3 py-2 sm:px-4 sm:py-3 border-l-2 border-primary"
                        >
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase mr-auto tracking-widest">
                              Thao tác:
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedCustomer(account);
                                    setHistoryModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-md text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20"
                            >
                                <span className="material-symbols-outlined text-[16px]">history</span>
                                Xem lịch sử
                            </button>
                            <button
                                onClick={() => initiateToggleStatus(account)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-md text-xs font-bold ${account.status === "active" ? "text-error bg-error/10 hover:bg-error/20" : "text-[#4ADE80] bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20"}`}
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                  {account.status === "active" ? "lock" : "lock_open"}
                                </span>
                                {account.status === "active" ? "Khóa" : "Mở khóa"}
                            </button>
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

        {isMounted && totalPages > 0 && (
          <div className="border-t border-outline-variant bg-surface-container-low px-6 py-4 flex items-center justify-between shrink-0">
            <div className="text-label-md font-label-md text-on-surface-variant hidden sm:block">
              Hiển thị {(page - 1) * itemsPerPage + 1} đến{" "}
              {Math.min(page * itemsPerPage, filteredAccounts.length)} trong số{" "}
              {filteredAccounts.length} khách hàng
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded font-label-md text-sm font-semibold transition-colors ${
                    page === p
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant text-on-surface-variant hover:bg-surface-bright/10"
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
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerHistoryModal 
        isOpen={historyModalOpen} 
        onClose={() => setHistoryModalOpen(false)} 
        customer={selectedCustomer} 
      />

      <GenericConfirmModal 
        isOpen={confirmModalOpen}
        title={customerToToggle?.status === 'active' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
        message={customerToToggle?.status === 'active' 
          ? `Bạn có chắc chắn muốn khóa tài khoản của ${customerToToggle?.name}? Người dùng sẽ không thể đăng nhập.` 
          : `Bạn có chắc chắn muốn mở khóa tài khoản của ${customerToToggle?.name}?`}
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}
