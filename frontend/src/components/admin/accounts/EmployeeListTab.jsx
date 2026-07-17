import React, { useState, useEffect } from "react";
import Image from "next/image";
import { adminBarberService } from "@/services/adminBarber.service";
import { adminAccountService } from '@/services/adminAccount.service';
import toast from 'react-hot-toast';
import GenericConfirmModal from '@/components/ui/GenericConfirmModal';
import BarberUpcomingBookingsModal from '@/components/admin/accounts/BarberUpcomingBookingsModal';

export default function EmployeeListTab() {
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'barber', 'staff'
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaff = async () => {
    try {
      const response = await adminBarberService.getAllAdminBarbers();
      
      const apiBarbers = response.barbers.map(item => {
        const b = item.barber || {};
        const u = item.user || {};
        const bId = String(b._id || b.id || "000000");
        const uId = String(u._id || u.id || "000000");
        return {
          id: bId.length > 6 ? bId.substring(bId.length - 6).toUpperCase() : bId.toUpperCase(),
          fullId: uId,
          barberId: bId,
          name: u.name,
          role: b.experienceYears >= 5 ? "Master Barber" : "Junior Barber",
          type: "barber",
          avatar: u.avatarUrl,
          rating: b.rating || b.averageRating || 5.0, 
          reviews: b.reviewCount || 0,
          revenue: "-",
          status: u.status,
          isDeleted: u.isDeleted,
          shift: `${b.preferredWorkingHours?.start || '08:00'} - ${b.preferredWorkingHours?.end || '20:00'}`,
          email: u.email,
          phone: u.phone || "Chưa cập nhật"
        };
      });

      const apiStaffs = (response.staffs || []).map(u => {
        const uId = String(u._id || u.id || "000000");
        return {
          id: uId.length > 6 ? uId.substring(uId.length - 6).toUpperCase() : uId.toUpperCase(),
          fullId: uId,
          name: u.name,
          role: "Lễ tân",
          type: "staff",
          avatar: u.avatarUrl,
          rating: null,
          reviews: null,
          revenue: "-",
          status: u.status,
          isDeleted: u.isDeleted,
          shift: "Ca Hành Chính",
          email: u.email,
          phone: u.phone || "Chưa cập nhật"
        };
      });

      setStaffList([...apiBarbers, ...apiStaffs]);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
      setStaffList([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInitiateDelete = (staff) => {
      setAccountToDelete(staff);
      setConfirmModalOpen(true);
  };

  const handleConfirmDeleteClick = () => {
      if (!accountToDelete) return;
      setConfirmModalOpen(false);
      if (accountToDelete.type === 'barber') {
          setBookingsModalOpen(true);
      } else {
          executeDelete(accountToDelete.fullId);
      }
  };

  const executeDelete = async (accountId) => {
      setIsDeleting(true);
      try {
          await adminAccountService.deleteAccount(accountId);
          toast.success('Xóa nhân viên thành công');
          setBookingsModalOpen(false);
          setAccountToDelete(null);
          fetchStaff();
      } catch (error) {
          toast.error(error.message || 'Có lỗi xảy ra khi xóa');
      } finally {
          setIsDeleting(false);
      }
  };

  const executeRestore = async (accountId) => {
      try {
          await adminAccountService.restoreAccount(accountId);
          toast.success('Khôi phục nhân viên thành công');
          fetchStaff();
      } catch (error) {
          toast.error(error.message || 'Có lỗi xảy ra khi khôi phục');
      }
  };

  const filteredStaff = staffList.filter(staff => {
    if (activeTab === "all") return true;
    return staff.type === activeTab;
  });

  const totalStaff = staffList.length;

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in fade-in">
        {/* Summary Banner */}
        <div className="mb-6 shrink-0 mt-2">
          <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant py-3 px-6 rounded-lg flex items-center justify-between w-full border-l-4 border-l-primary shadow-sm">
            <span className="text-outline text-sm uppercase tracking-widest font-bold">Tổng nhân sự</span>
            <div className="flex items-center gap-4">
              <span className="text-green-400 text-xs flex items-center font-bold bg-green-400/10 px-2 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>+Mới
              </span>
              <span className="text-2xl font-black text-primary">{totalStaff}</span>
            </div>
          </div>
        </div>

        {/* Tabs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'all' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('barber')}
              className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'barber' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
              }`}
            >
              Barbers
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'staff' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
              }`}
            >
              Staff Khác
            </button>
          </div>

          <button className="bg-primary text-on-primary px-6 py-2.5 rounded font-bold flex items-center shadow-lg hover:bg-primary-fixed transition-colors active:scale-95">
            <span className="material-symbols-outlined mr-2">person_add</span>
            Thêm Nhân Viên
          </button>
        </div>

        {/* Staff Table List */}
        <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant overflow-hidden rounded-xl mb-4 flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-surface-container-high/90 backdrop-blur">
                <tr className="border-b border-outline-variant">
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Nhân viên</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Liên hệ</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Chức vụ</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Ca làm</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-outline">Đang tải dữ liệu nhân sự...</td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-outline">Không có nhân sự nào.</td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                  <tr key={staff.id} className="border-b border-outline-variant/30 hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-variant flex items-center justify-center shrink-0">
                          {staff.avatar ? (
                            <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-on-surface-variant font-bold text-xs uppercase">
                              {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          )}
                          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${staff.status === 'active' ? 'bg-green-500' : 'bg-outline-variant'}`}></div>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{staff.name}</p>
                          <p className="text-xs text-outline">{staff.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-on-surface-variant truncate max-w-[150px]">{staff.email}</p>
                      <p className="text-xs text-outline">{staff.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        staff.type === 'barber' ? 'bg-primary/10 text-primary' : 'bg-tertiary-container/20 text-tertiary'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        staff.isDeleted ? 'text-red-400 bg-red-400/10' : staff.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-outline-variant bg-outline-variant/10'
                      }`}>
                        {staff.isDeleted ? 'Đã xóa' : staff.status === 'active' ? 'Đang làm' : 'Nghỉ ca'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-on-surface-variant font-label-md">{staff.shift}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {staff.isDeleted ? (
                          <button 
                              onClick={() => executeRestore(staff.fullId)}
                              className="text-green-500 hover:bg-green-500/10 p-2 rounded transition-colors mr-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Khôi phục nhân viên"
                          >
                              <span className="material-symbols-outlined">restore</span>
                          </button>
                      ) : (
                          <>
                              {staff.status !== 'banned' && staff.status !== 'suspended' && (
                                  <button 
                                      onClick={() => handleInitiateDelete(staff)}
                                      className="text-error hover:bg-error/10 p-2 rounded transition-colors mr-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                      title="Xóa nhân viên"
                                  >
                                      <span className="material-symbols-outlined">delete</span>
                                  </button>
                              )}
                              <button className="text-outline hover:text-primary p-2 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                          </>
                      )}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <GenericConfirmModal 
            isOpen={confirmModalOpen}
            title="Xóa nhân viên"
            message={`Bạn có chắc chắn muốn xóa nhân viên ${accountToDelete?.name}? Tài khoản sẽ bị khóa và không thể đăng nhập.`}
            onConfirm={handleConfirmDeleteClick}
            onCancel={() => setConfirmModalOpen(false)}
        />
        {accountToDelete && accountToDelete.type === 'barber' && (
            <BarberUpcomingBookingsModal 
                isOpen={bookingsModalOpen}
                onClose={() => setBookingsModalOpen(false)}
                barber={{ id: accountToDelete.barberId, name: accountToDelete.name }}
                onAllResolved={() => executeDelete(accountToDelete.fullId)}
            />
        )}
    </div>
  );
}
