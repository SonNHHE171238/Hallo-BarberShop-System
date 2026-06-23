"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { adminBarberService } from "@/services/adminBarber.service";

// MOCK DATA
const mockStaff = [
  {
    id: "S001",
    name: "Lê Minh Tuân",
    role: "Master Barber",
    type: "barber",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBx8T9PXuhBaJjSBYlm4mHv-IsMPQq7hmmXViHt3FKlNHo7oM3XyIsx42wCWMlJmgRjxJecaLdixJDWGZ3UHpnuKRXWtl2XmQH9c3vPLrVZvYX55cZzqD8W8LN-fBwBvGhgE5WBfgVOtlMonOBjY_RQ5QmpzW37Ufj3f9qZIQXij5dc3ZlEIIfxTfc9XuVXvN5_HrUVMpOPTR-5M4ScmcYh17ygYvFYeGu4ZI96yMaDjsRMVIUexXj_JObJrFT-HcBmn5xv0n4DxYhX",
    rating: 5.0,
    reviews: 142,
    revenue: "42.5M",
    status: "active",
    shift: "08:00 - 17:00",
    email: "tuan.lm@hallo.vn",
    phone: "0901234567"
  },
  {
    id: "S002",
    name: "Trần Quốc Bảo",
    role: "Senior Barber",
    type: "barber",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-gZc0b5Oac5qxMyCxwJKB3cJzIFINrkBbg-o_MSxIeoFhGDWpbVThuWwNinEe21KVOUHRMS2DVe8uvrh3zJ7sc7mlt13aepdO66oeKh1m0J-22HtPFBb2ZhNyFOoDhnJTwfqlglDb_e0TuxTwc9B323QTwH7foIpPi7sFw6eG9bIZDYMPbkesWyW81wcPpJyyBYYkRewlLwlnFAo3hSuhfsl7gE93YLKUFVvj8GWMp-u5Q5cYB2B7VC465VuiDfCN1E1fjn-inMW-",
    rating: 4.8,
    reviews: 89,
    revenue: "31.2M",
    status: "inactive",
    shift: "13:00 - 22:00",
    email: "bao.tq@hallo.vn",
    phone: "0912345678"
  },
  {
    id: "S003",
    name: "Nguyễn Thùy Linh",
    role: "Senior Barber",
    type: "barber",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuATrnQ0OmZNZXa9byI0921DRlhTp3nFF13W0Urb2YD5IBimdMThwvqvRa9gxfY1EW4GXfhUqRFC5D4N3hUFtQ8QEsNG8vNZING6lCywB0G6Y4k0H9bs5twbDkziO4xz-cciiEe6d-00pEI7G_Kn99F23CtZBUxKlHAqKo0GafPJau012y9gCz7T2bTpnvJLpZhDjI10ePLSTZbQVeYF2fkxeO8Qw0cQe8dXyNWiXDS674CYvv5BsErR7y_kXVt_f0oJexiFps018L6X",
    rating: 4.9,
    reviews: 112,
    revenue: "38.9M",
    status: "active",
    shift: "09:00 - 18:00",
    email: "linh.nt@hallo.vn",
    phone: "0923456789"
  },
  {
    id: "S004",
    name: "Phạm Hoàng Nam",
    role: "Junior Barber",
    type: "barber",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoAOMuBW7k4lsbjioNkOpx-INiGuUrp6PZGn8qGgiprAUmPRmgwln8pIKkvWoc9fURN_3UfyaImtumOY0LkM91-3pdAUfnCI3LN-Mz7hHAVfEN9oMsJKQZJvEiqQ0mK0pVpiB3iYM57uCCqyDX46zBpzwVgqS-P-aT6TaAtzb53361F8MCWPFqTvuOb0AO5P2dot7-A4l2VsgOrVCz5Ao1RPUt_xrr774CuQCxytT5qLwpXKFlfYuQmlgB0W55nhqeJ-nX7p3xmuDy",
    rating: 4.6,
    reviews: 45,
    revenue: "18.2M",
    status: "active",
    shift: "08:00 - 17:00",
    email: "nam.ph@hallo.vn",
    phone: "0934567890"
  },
  {
    id: "S005",
    name: "Vũ Ngọc Ánh",
    role: "Receptionist",
    type: "staff",
    avatar: "",
    rating: null,
    reviews: null,
    revenue: null,
    status: "active",
    shift: "08:00 - 17:00",
    email: "anh.vn@hallo.vn",
    phone: "0945678901"
  },
  {
    id: "S006",
    name: "Đặng Thái Sơn",
    role: "Apprentice",
    type: "staff",
    avatar: "",
    rating: null,
    reviews: null,
    revenue: null,
    status: "inactive",
    shift: "13:00 - 22:00",
    email: "son.dt@hallo.vn",
    phone: "0956789012"
  }
];

export default function AdminStaffPage() {
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'barber', 'staff'
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await adminBarberService.getAllAdminBarbers();
        
        // Chuyển đổi dữ liệu từ API sang format của bảng
        const apiBarbers = response.barbers.map(item => {
          const b = item.barber;
          const u = item.user;
          return {
            id: b._id.substring(b._id.length - 6).toUpperCase(), // Lấy 6 ký tự cuối làm ID cho gọn
            name: u.name,
            role: b.experienceYears >= 5 ? "Master Barber" : "Junior Barber",
            type: "barber",
            avatar: u.avatarUrl,
            rating: b.rating || b.averageRating || 5.0, 
            reviews: b.reviewCount || 0,
            revenue: "-",
            status: u.status,
            shift: `${b.preferredWorkingHours?.start || '08:00'} - ${b.preferredWorkingHours?.end || '20:00'}`,
            email: u.email,
            phone: u.phone || "Chưa cập nhật"
          };
        });

        // Xử lý dữ liệu Staff Khác (nếu có)
        const apiStaffs = (response.staffs || []).map(u => ({
            id: u._id.substring(u._id.length - 6).toUpperCase(),
            name: u.name,
            role: "Lễ tân / Thợ phụ",
            type: "staff",
            avatar: u.avatarUrl,
            rating: null,
            reviews: null,
            revenue: "-",
            status: u.status,
            shift: "Ca Hành Chính",
            email: u.email,
            phone: u.phone || "Chưa cập nhật"
        }));

        // Gộp cả 2 danh sách lại để hiển thị
        setStaffList([...apiBarbers, ...apiStaffs]);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
        setStaffList([]); 
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter(staff => {
    if (activeTab === "all") return true;
    return staff.type === activeTab;
  });

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(s => s.status === 'active').length;
  const avgRating = totalStaff > 0 
    ? (staffList.reduce((acc, curr) => acc + curr.rating, 0) / totalStaff).toFixed(1) 
    : '0.0';

  return (
    <div className="flex-1 flex flex-col relative w-full h-full min-h-screen">
      {/* Page Content */}
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        {/* Summary Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
            <span className="text-outline text-xs uppercase tracking-widest font-medium">Tổng nhân sự</span>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-bold text-primary">{totalStaff}</span>
              <span className="text-green-400 text-xs flex items-center">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>+Mới
              </span>
            </div>
          </div>
          <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant p-6 rounded-lg flex flex-col justify-between border-l-4 border-l-primary">
            <span className="text-outline text-xs uppercase tracking-widest font-medium">Đang hoạt động</span>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-bold text-on-surface">{activeStaff}</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">LIVE NOW</span>
            </div>
          </div>
          <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
            <span className="text-outline text-xs uppercase tracking-widest font-medium">Doanh thu TB/Barber</span>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-2xl font-bold text-on-surface">-</span>
              <span className="text-outline text-xs">VNĐ / tháng</span>
            </div>
          </div>
          <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
            <span className="text-outline text-xs uppercase tracking-widest font-medium">Đánh giá trung bình</span>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-bold text-on-surface">{avgRating}</span>
              <div className="flex text-primary">
                <span className="material-symbols-outlined icon-fill">star</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
        <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant overflow-hidden rounded-xl mb-12">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-high/50">
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Nhân viên</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Liên hệ</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Chức vụ</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Ca làm</th>
                  {activeTab !== 'staff' && (
                    <>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold text-right">Doanh thu</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold text-right">Đánh giá</th>
                    </>
                  )}
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-outline">Đang tải dữ liệu nhân sự...</td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-outline">Không có nhân sự nào.</td>
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
                        staff.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-outline-variant bg-outline-variant/10'
                      }`}>
                        {staff.status === 'active' ? 'Đang làm' : 'Nghỉ ca'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-on-surface-variant font-label-md">{staff.shift}</span>
                    </td>
                    {activeTab !== 'staff' && (
                      <>
                        <td className="px-6 py-4 text-right">
                          {staff.revenue ? (
                            <p className="font-bold text-on-surface">{staff.revenue}</p>
                          ) : (
                            <span className="text-outline">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {staff.rating ? (
                            <div className="flex flex-col items-end">
                              <div className="flex items-center text-primary">
                                <span className="font-bold mr-1">{staff.rating.toFixed(1)}</span>
                                <span className="material-symbols-outlined text-[14px] icon-fill">star</span>
                              </div>
                              <span className="text-[10px] text-outline">{staff.reviews} đánh giá</span>
                            </div>
                          ) : (
                            <span className="text-outline">-</span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <button className="text-outline hover:text-primary p-2 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shift Management Table Overview (Re-used from HTML) */}
        <div className="mt-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">LỊCH TRÌNH TRỰC CA</h2>
              <p className="text-outline text-sm mt-1">Tuần từ 22/05 - 28/05, 2024</p>
            </div>
            <button className="text-outline hover:text-primary transition-colors flex items-center text-sm font-bold">
              Xem chi tiết lịch <span className="material-symbols-outlined ml-1">arrow_right_alt</span>
            </button>
          </div>
          <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant overflow-hidden rounded-xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-high/50">
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Nhân viên</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Thứ 2</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Thứ 3</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Thứ 4</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Thứ 5</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Thứ 6</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-outline font-bold">Thứ 7</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  <tr className="border-b border-outline-variant/30 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center">
                      <div className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mr-3 uppercase">LT</div>
                      <span className="font-bold">Lê Minh Tuân</span>
                    </td>
                    <td className="px-6 py-4"><span className="bg-primary/10 text-primary-fixed-dim px-2 py-1 rounded text-[10px] font-bold">CA SÁNG</span></td>
                    <td className="px-6 py-4"><span className="bg-primary/10 text-primary-fixed-dim px-2 py-1 rounded text-[10px] font-bold">CA SÁNG</span></td>
                    <td className="px-6 py-4 text-outline-variant italic text-[10px]">NGHỈ</td>
                    <td className="px-6 py-4"><span className="bg-primary/10 text-primary-fixed-dim px-2 py-1 rounded text-[10px] font-bold">CA SÁNG</span></td>
                    <td className="px-6 py-4"><span className="bg-primary/10 text-primary-fixed-dim px-2 py-1 rounded text-[10px] font-bold">CA SÁNG</span></td>
                    <td className="px-6 py-4"><span className="bg-secondary-container/30 text-secondary px-2 py-1 rounded text-[10px] font-bold">CA FULL</span></td>
                  </tr>
                  <tr className="border-b border-outline-variant/30 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center">
                      <div className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mr-3 uppercase">QB</div>
                      <span className="font-bold">Trần Quốc Bảo</span>
                    </td>
                    <td className="px-6 py-4"><span className="bg-secondary-container/30 text-secondary px-2 py-1 rounded text-[10px] font-bold">CA CHIỀU</span></td>
                    <td className="px-6 py-4"><span className="bg-secondary-container/30 text-secondary px-2 py-1 rounded text-[10px] font-bold">CA CHIỀU</span></td>
                    <td className="px-6 py-4"><span className="bg-secondary-container/30 text-secondary px-2 py-1 rounded text-[10px] font-bold">CA CHIỀU</span></td>
                    <td className="px-6 py-4 text-outline-variant italic text-[10px]">NGHỈ</td>
                    <td className="px-6 py-4"><span className="bg-secondary-container/30 text-secondary px-2 py-1 rounded text-[10px] font-bold">CA CHIỀU</span></td>
                    <td className="px-6 py-4"><span className="bg-secondary-container/30 text-secondary px-2 py-1 rounded text-[10px] font-bold">CA CHIỀU</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
