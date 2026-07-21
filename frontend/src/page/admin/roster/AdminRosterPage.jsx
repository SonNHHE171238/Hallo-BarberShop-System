"use client";

import React, { useState, useEffect } from "react";
import { rosterService } from "@/services/roster.service";
import { adminAccountService } from "@/services/adminAccount.service";
import { useAuth } from "@/context/AuthContext";

export default function AdminRosterPage() {
  const [mounted, setMounted] = useState(false);
  const [rosters, setRosters] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Modals
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Creation form state
  const [newRoster, setNewRoster] = useState({
    weekStartDate: "",
    registrationDeadline: "",
    closedDays: []
  });
  const [closedDayInput, setClosedDayInput] = useState({ date: "", reason: "" });

  // Dropdowns for adding staff to cells
  const [activeCellSelector, setActiveCellSelector] = useState(null); // { dateStr, shiftType }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      initPage();
    }
  }, [mounted]);

  const initPage = async () => {
    setLoading(true);
    try {
      // 1. Fetch all rosters
      const rostersData = await rosterService.getAllRosters();
      const allRosters = rostersData.rosters || rostersData || [];
      setRosters(allRosters);

      // 2. Fetch all staff accounts
      const accountsData = await adminAccountService.getAllAccounts();
      const allUsers = accountsData.users || accountsData || [];
      const staffOnly = allUsers.filter(u => u.role === "staff");
      setStaffUsers(staffOnly);

      // 3. Select default roster
      if (allRosters.length > 0) {
        const today = new Date();
        const currentRoster = allRosters.find(r => {
           const start = new Date(r.weekStartDate);
           const end = new Date(r.weekEndDate);
           start.setHours(0,0,0,0);
           end.setHours(23,59,59,999);
           return today >= start && today <= end;
        });
        
        if (currentRoster) {
           await loadRosterDetails(currentRoster._id);
        } else {
           await loadRosterDetails(allRosters[0]._id);
        }
      } else {
        // Tự động tạo Roster ảo cho tuần hiện tại nếu DB trống
        const now = new Date();
        const day = now.getDay();
        // Cộng thêm 7 ngày để mặc định là tuần kế tiếp
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) + 7;
        
        const monday = new Date(now);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const virtualRoster = {
          _id: null,
          weekStartDate: monday.toISOString(),
          weekEndDate: sunday.toISOString(),
          status: "draft",
          closedDays: [],
          shiftRequirements: []
        };
        setSelectedRoster(virtualRoster);
        setRegistrations([]);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Lỗi đồng bộ dữ liệu với máy chủ backend." });
    } finally {
      setLoading(false);
    }
  };

  const loadRosterDetails = async (rosterId) => {
    try {
      const data = await rosterService.getRosterDetails(rosterId);
      if (data && data.roster) {
        setSelectedRoster(data.roster);
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Không thể lấy thông tin chi tiết của lịch tuần." });
    }
  };

  const handleSelectRoster = async (e) => {
    const rosterId = e.target.value;
    if (!rosterId) return;
    setLoading(true);
    await loadRosterDetails(rosterId);
    setLoading(false);
  };

  const handleDateFilter = async (e) => {
    const val = e.target.value;
    if (!val) return;
    const filterDate = new Date(val);
    filterDate.setHours(12, 0, 0, 0); // Tránh lệch múi giờ

    // Tìm roster bao gồm ngày đã chọn
    const found = rosters.find(r => {
      const start = new Date(r.weekStartDate);
      const end = new Date(r.weekEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return filterDate >= start && filterDate <= end;
    });

    if (found) {
      setLoading(true);
      await loadRosterDetails(found._id);
      setLoading(false);
      setMessage(null);
    } else {
      // Nếu không tìm thấy, tự tạo Roster ảo trong bộ nhớ để tiếp tục hiển thị filter
      const day = filterDate.getDay();
      const diff = filterDate.getDate() - day + (day === 0 ? -6 : 1);
      
      const monday = new Date(filterDate);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const virtualRoster = {
        _id: null, // Chưa lưu vào DB
        weekStartDate: monday.toISOString(),
        weekEndDate: sunday.toISOString(),
        status: "draft",
        closedDays: [],
        shiftRequirements: []
      };

      setSelectedRoster(virtualRoster);
      setRegistrations([]);
      setMessage(null); // Không hiển thị thêm thông báo nào khi filter
    }
  };

  // Helper to format date strings
  const formatDate = (dateStr, options = { day: "2-digit", month: "2-digit" }) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", options);
  };

  const getWeekDays = () => {
    if (!selectedRoster) return [];
    const days = [];
    const start = new Date(selectedRoster.weekStartDate);
    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().split("T")[0];
      const isClosed = selectedRoster.closedDays?.some(
        cd => new Date(cd.date).toISOString().split("T")[0] === dateStr
      );
      const closedReason = selectedRoster.closedDays?.find(
        cd => new Date(cd.date).toISOString().split("T")[0] === dateStr
      )?.reason;

      days.push({
        dateStr,
        label: dayNames[i],
        dateNum: current.getDate().toString().padStart(2, "0"),
        isClosed,
        closedReason
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Helper to get staff assigned to a shift cell
  const getAssignedStaff = (dateStr, shiftType) => {
    return registrations.filter(reg => {
      // Ensure only users with 'staff' role are mapped in this grid
      const role = reg.userId?.role || reg.role;
      if (role !== "staff") return false;

      const dayShift = reg.registeredShifts?.find(s => {
        const dStr = new Date(s.date).toISOString().split('T')[0];
        return dStr === dateStr;
      });
      return dayShift && dayShift.shifts?.includes(shiftType);
    });
  };

  // Adjust staff shift from grid
  const handleToggleStaffShift = async (userId, dateStr, shiftType, shouldAdd) => {
    if (selectedRoster.status === "published") {
      alert("Lịch đã công bố không thể chỉnh sửa thêm.");
      return;
    }

    setActionLoading(true);
    try {
      let currentRosterId = selectedRoster._id;

      // Khởi tạo Roster thật trong database nếu đây đang là Roster ảo
      if (!currentRosterId) {
        const payload = {
          weekStartDate: selectedRoster.weekStartDate,
          weekEndDate: selectedRoster.weekEndDate,
          closedDays: selectedRoster.closedDays || []
        };
        const createdData = await rosterService.createRoster(payload);
        const createdRoster = createdData.roster || createdData;
        currentRosterId = createdRoster._id;

        setSelectedRoster(createdRoster);
        setRosters(prev => [createdRoster, ...prev]);
        setMessage({ type: "success", text: "Đã tự động khởi tạo Roster bản nháp cho tuần này." });
      }

      // Find current registration
      let userReg = registrations.find(r => (r.userId?._id || r.userId) === userId);
      let updatedShifts = [];

      if (userReg) {
        // Deep copy registeredShifts
        updatedShifts = JSON.parse(JSON.stringify(userReg.registeredShifts || []));
      }

      let dayEntry = updatedShifts.find(s => new Date(s.date).toISOString().split("T")[0] === dateStr);

      if (!dayEntry) {
        dayEntry = { date: dateStr, shifts: [] };
        updatedShifts.push(dayEntry);
      }

      if (shouldAdd) {
        if (!dayEntry.shifts.includes(shiftType)) {
          dayEntry.shifts.push(shiftType);
        }
      } else {
        dayEntry.shifts = dayEntry.shifts.filter(s => s !== shiftType);
      }

      // Call API
      await rosterService.adminAdjustShift(
        currentRosterId,
        userId,
        updatedShifts,
        `Admin điều chỉnh ca ${shiftType === "morning" ? "Sáng" : "Chiều"} ngày ${formatDate(dateStr, { day: "2-digit", month: "2-digit", year: "numeric" })}`
      );

      // Reload
      await loadRosterDetails(currentRosterId);
      setActiveCellSelector(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể thay đổi ca trực của nhân viên.");
    } finally {
      setActionLoading(false);
    }
  };

  // Roster Creation Handlers
  const handleAddClosedDay = () => {
    if (!closedDayInput.date) {
      alert("Vui lòng chọn ngày đóng cửa.");
      return;
    }
    setNewRoster(prev => ({
      ...prev,
      closedDays: [...prev.closedDays, closedDayInput]
    }));
    setClosedDayInput({ date: "", reason: "" });
  };

  const handleRemoveClosedDay = (idx) => {
    setNewRoster(prev => ({
      ...prev,
      closedDays: prev.closedDays.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateRosterSubmit = async (e) => {
    e.preventDefault();
    if (!newRoster.weekStartDate) {
      alert("Vui lòng nhập ngày bắt đầu tuần.");
      return;
    }

    const dateStart = new Date(newRoster.weekStartDate);
    
    // Chỉ cho phép tạo mới Roster cho tương lai (tuần này hoặc các tuần tiếp theo)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const currentMonday = new Date(today.setDate(diff));
    currentMonday.setHours(0, 0, 0, 0);

    if (dateStart < currentMonday) {
      alert("Chỉ được tạo lịch Roster cho tuần hiện tại hoặc các tuần trong tương lai.");
      return;
    }

    setActionLoading(true);
    try {
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateStart.getDate() + 6);

      const payload = {
        weekStartDate: dateStart.toISOString(),
        weekEndDate: dateEnd.toISOString(),
        registrationDeadline: newRoster.registrationDeadline ? new Date(newRoster.registrationDeadline).toISOString() : undefined,
        closedDays: newRoster.closedDays.map(d => ({
          date: new Date(d.date).toISOString(),
          reason: d.reason || "Đóng cửa"
        }))
      };

      await rosterService.createRoster(payload);
      setMessage({ type: "success", text: "Khởi tạo lịch tuần mới thành công!" });
      
      // Reset forms and reload
      setNewRoster({ weekStartDate: "", registrationDeadline: "", closedDays: [] });
      setShowCreateModal(false);
      initPage();
    } catch (err) {
      console.error(err);
      alert(err.message || "Lỗi tạo lịch tuần mới.");
    } finally {
      setActionLoading(false);
    }
  };

  // Publish Roster Handlers
  const getPublishWarnings = () => {
    const warnings = [];
    if (!selectedRoster) return warnings;

    weekDays.forEach(day => {
      if (day.isClosed) return;

      const morningCount = getAssignedStaff(day.dateStr, "morning").length;
      const afternoonCount = getAssignedStaff(day.dateStr, "afternoon").length;

      if (morningCount === 0) {
        warnings.push(`Thiếu nhân sự ca Sáng ${day.label} (${formatDate(day.dateStr)})`);
      }
      if (afternoonCount === 0) {
        warnings.push(`Thiếu nhân sự ca Chiều ${day.label} (${formatDate(day.dateStr)})`);
      }
    });

    // Check overlaps
    staffUsers.forEach(staff => {
      weekDays.forEach(day => {
        const assignedShifts = registrations.find(r => (r.userId?._id || r.userId) === staff._id)
          ?.registeredShifts?.find(s => new Date(s.date).toISOString().split("T")[0] === day.dateStr)
          ?.shifts || [];
        
        if (assignedShifts.includes("morning") && assignedShifts.includes("afternoon")) {
          // Double shift is allowed but can be shown as info warning
        }
      });
    });

    return warnings;
  };

  const handlePublishSubmit = async () => {
    setActionLoading(true);
    try {
      let currentRosterId = selectedRoster._id;

      // Khởi tạo Roster thật trong database nếu đây đang là Roster ảo trước khi công bố
      if (!currentRosterId) {
        const payload = {
          weekStartDate: selectedRoster.weekStartDate,
          weekEndDate: selectedRoster.weekEndDate,
          closedDays: selectedRoster.closedDays || []
        };
        const createdData = await rosterService.createRoster(payload);
        const createdRoster = createdData.roster || createdData;
        currentRosterId = createdRoster._id;

        setSelectedRoster(createdRoster);
        setRosters(prev => [createdRoster, ...prev]);
      }

      await rosterService.publishRoster(currentRosterId);
      setMessage({ type: "success", text: "Đã công bố lịch làm việc tuần này chính thức cho Staff!" });
      setShowPublishModal(false);
      // Reload details
      await loadRosterDetails(currentRosterId);
      // Reload roster list to update status badges
      const rostersData = await rosterService.getAllRosters();
      setRosters(rostersData.rosters || rostersData || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Lỗi khi công bố lịch làm.");
    } finally {
      setActionLoading(false);
    }
  };

  // Count total shifts assigned to a staff in selected roster
  const getStaffShiftsCount = (staffId) => {
    const reg = registrations.find(r => (r.userId?._id || r.userId) === staffId);
    if (!reg) return 0;
    let count = 0;
    reg.registeredShifts?.forEach(day => {
      count += day.shifts?.length || 0;
    });
    return count;
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-gold pb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-[36px]">calendar_view_week</span>
            Xếp Lịch Tuần
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            Quản lý, điều chỉnh ca làm việc và công bố lịch tuần chính thức cho đội ngũ nhân viên.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 border border-outline-gold rounded-sm">
            <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
            <input
              type="date"
              className="bg-transparent text-sm focus:outline-none border-none text-on-surface cursor-pointer [color-scheme:dark]"
              onChange={handleDateFilter}
              title="Chọn một ngày bất kỳ để tìm lịch tuần tương ứng"
            />
          </div>

          <button
            onClick={() => {
              const now = new Date();
              const day = now.getDay();
              const diff = now.getDate() - day + (day === 0 ? -6 : 1) + 7;
              const monday = new Date(now);
              monday.setDate(diff);
              
              const saturday = new Date(monday);
              saturday.setDate(monday.getDate() - 2);

              setNewRoster({
                weekStartDate: monday.toISOString().split("T")[0],
                registrationDeadline: saturday.toISOString().split("T")[0],
                closedDays: []
              });
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-transparent text-primary border border-primary hover:bg-primary/10 transition-all font-bold uppercase text-xs tracking-widest flex items-center gap-2 rounded-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Tạo Roster Mới
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded flex items-center gap-3 ${message.type === "error" ? "bg-error-container text-error" : "bg-primary-container text-primary"}`}>
          <span className="material-symbols-outlined">{message.type === "error" ? "error" : "check_circle"}</span>
          <span className="font-bold">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto material-symbols-outlined">close</button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="font-label-md">Đang xử lý dữ liệu Roster...</p>
        </div>
      ) : !selectedRoster ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-surface-container-low border border-outline-gold rounded-xl text-center shadow-lg">
          <span className="material-symbols-outlined text-primary text-6xl mb-4">event_busy</span>
          <h3 className="font-headline-md text-headline-md mb-2">Chưa Có Lịch Roster Nào Được Tạo</h3>
          <p className="text-on-surface-variant max-w-md mb-6">
            Bấm nút Tạo Roster Mới ở trên để lập lịch đăng ký ca làm việc cho nhân viên.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-on-primary font-bold uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all rounded-sm"
          >
            Tạo Roster Ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Calendar Grid */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-bold uppercase rounded-sm ${selectedRoster.status === "published" ? "bg-green-500/20 text-green-400" : "bg-gold-dim/20 text-gold-dim"}`}>
                  Status: {selectedRoster.status === "published" ? "Đã công bố" : "Nháp / Đang đăng ký"}
                </span>
                {selectedRoster.status === "published" && (
                  <span className="text-xs text-on-surface-variant italic">
                    Công bố lúc: {formatDate(selectedRoster.publishedAt, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span> Ca làm đã chốt
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border-2 border-dashed border-outline-gold rounded-sm"></span> Ô trống ca trực
                </span>
              </div>
            </div>

            <div className="border border-outline-gold rounded-lg overflow-hidden bg-surface-container-lowest shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-gold">
                      <th className="w-28 p-4 text-xs font-label-md text-on-surface-variant text-center bg-surface-container-low border-r border-outline-gold">CA TRỰC</th>
                      {weekDays.map(day => (
                        <th key={day.dateStr} className={`p-4 text-center border-r border-outline-gold last:border-none ${day.isClosed ? 'bg-error/5 text-error' : 'text-on-surface'}`}>
                          <div className="text-xs uppercase font-label-md tracking-wider opacity-60">{day.label}</div>
                          <div className="text-lg font-bold mt-1">{day.dateNum}</div>
                          {day.isClosed && <div className="text-[9px] uppercase font-bold text-error mt-0.5">CLOSED</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-gold">
                    {/* Shift: Morning */}
                    <tr>
                      <td className="p-4 text-center text-xs font-label-md bg-surface-container-low border-r border-outline-gold text-on-surface-variant">
                        <strong>CA SÁNG</strong>
                        <div className="opacity-50 mt-0.5">08:00-14:00</div>
                      </td>
                      {weekDays.map(day => {
                        const assigned = getAssignedStaff(day.dateStr, "morning");
                        const availableToAdd = staffUsers.filter(u => !assigned.some(a => (a.userId?._id || a.userId) === u._id));

                        return (
                          <td key={day.dateStr} className={`p-2 align-top border-r border-outline-gold last:border-none relative min-h-[120px] ${day.isClosed ? 'bg-surface-container-high/20' : 'hover:bg-surface-bright/5 transition-colors'}`}>
                            {day.isClosed ? (
                              <div className="text-center py-6 text-xs text-error font-bold italic">{day.closedReason || "Nghỉ lễ"}</div>
                            ) : (
                              <div className="space-y-1.5 min-h-[80px]">
                                {assigned.map((reg, idx) => (
                                  <div key={reg._id || reg.userId?._id || reg.userId || idx} className="flex items-center justify-between p-2 bg-surface-container border-l-4 border-green-500 rounded-sm text-xs group">
                                    <span className="font-semibold text-on-surface">{reg.userId?.name || "Staff"}</span>
                                    {selectedRoster.status !== "published" && (
                                      <button
                                        onClick={() => handleToggleStaffShift(reg.userId?._id || reg.userId, day.dateStr, "morning", false)}
                                        className="opacity-0 group-hover:opacity-100 text-error hover:scale-110 transition-all shrink-0 ml-1"
                                        title="Xóa khỏi ca"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">do_not_disturb_on</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Shift: Afternoon */}
                    <tr>
                      <td className="p-4 text-center text-xs font-label-md bg-surface-container-low border-r border-outline-gold text-on-surface-variant">
                        <strong>CA CHIỀU</strong>
                        <div className="opacity-50 mt-0.5">14:00-20:00</div>
                      </td>
                      {weekDays.map(day => {
                        const assigned = getAssignedStaff(day.dateStr, "afternoon");
                        const availableToAdd = staffUsers.filter(u => !assigned.some(a => (a.userId?._id || a.userId) === u._id));

                        return (
                          <td key={day.dateStr} className={`p-2 align-top border-r border-outline-gold last:border-none relative min-h-[120px] ${day.isClosed ? 'bg-surface-container-high/20' : 'hover:bg-surface-bright/5 transition-colors'}`}>
                            {day.isClosed ? (
                              <div className="text-center py-6 text-xs text-error font-bold italic">{day.closedReason || "Nghỉ lễ"}</div>
                            ) : (
                              <div className="space-y-1.5 min-h-[80px]">
                                {assigned.map((reg, idx) => (
                                  <div key={reg._id || reg.userId?._id || reg.userId || idx} className="flex items-center justify-between p-2 bg-surface-container border-l-4 border-green-500 rounded-sm text-xs group">
                                    <span className="font-semibold text-on-surface">{reg.userId?.name || "Staff"}</span>
                                    {selectedRoster.status !== "published" && (
                                      <button
                                        onClick={() => handleToggleStaffShift(reg.userId?._id || reg.userId, day.dateStr, "afternoon", false)}
                                        className="opacity-0 group-hover:opacity-100 text-error hover:scale-110 transition-all shrink-0 ml-1"
                                        title="Xóa khỏi ca"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">do_not_disturb_on</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Action Pane */}
            <div className="flex justify-end pt-4">
              {selectedRoster.status === "published" ? (
                <div className="px-6 py-4 bg-green-500/10 text-green-400 font-bold border border-green-500/30 rounded flex items-center gap-3 uppercase tracking-wider text-xs">
                  <span className="material-symbols-outlined">verified</span>
                  Đã công bố lịch làm việc chính thức cho tuần này
                </div>
              ) : (
                <button
                  onClick={() => setShowPublishModal(true)}
                  disabled={actionLoading}
                  className="px-8 py-4 bg-primary text-on-primary font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 rounded-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">send_and_archive</span>
                  Công bố lịch tuần
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar: Staff summary */}
          <div className="col-span-12 xl:col-span-4 bg-surface-container-low border border-outline-gold rounded-lg p-6 flex flex-col gap-6 shadow-md">
            <div>
              <h3 className="font-headline-sm text-primary mb-1">Nhân Sự & Đăng Ký</h3>
              <p className="text-xs text-on-surface-variant font-label-md">
                Tổng số Staff: {staffUsers.length} | Chỉ số ca làm tuần này
              </p>
            </div>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {staffUsers.map((staff, idx) => {
                                const shiftCount = getStaffShiftsCount(staff._id);
                                const reg = registrations.find(r => (r.userId?._id || r.userId) === staff._id);
                                
                                // Determine registration status colors
                                let statusBadge = "Chưa đăng ký";
                                let statusColor = "text-on-surface-variant bg-surface-container-high";
                                if (reg) {
                                  if (reg.status === "adjusted") {
                                    statusBadge = "Admin chỉnh sửa";
                                    statusColor = "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
                                  } else if (reg.status === "approved" || selectedRoster.status === "published") {
                                    statusBadge = "Đã duyệt";
                                    statusColor = "text-green-400 bg-green-500/10 border border-green-500/20";
                                  } else {
                                    statusBadge = "Đã đăng ký nháp";
                                    statusColor = "text-primary bg-primary/10 border border-primary/20";
                                  }
                                }
                
                                return (
                                  <div key={staff._id || staff.id || idx} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-gold rounded hover:border-primary/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 text-primary flex items-center justify-center rounded-full font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{staff.name}</p>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 ${statusColor}`}>
                          {statusBadge}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{shiftCount} Ca</p>
                      <p className="text-[9px] text-on-surface-variant font-label-md">Tuần này</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Publish */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setShowPublishModal(false)}></div>
          <div className="relative bg-surface-container border border-outline-gold w-full max-w-md p-8 rounded shadow-2xl scale-100 transform transition-transform duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 text-primary flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-on-surface mb-2">Công bố lịch tuần này?</h4>
              <p className="text-on-surface-variant text-sm">
                Lịch làm việc chính thức cho tuần từ {formatDate(selectedRoster?.weekStartDate)} đến {formatDate(selectedRoster?.weekEndDate)} sẽ được ban hành. Nhân viên sẽ nhận được thông báo và không thể tự đăng ký/chỉnh sửa thêm.
              </p>
            </div>

            {getPublishWarnings().length > 0 && (
              <div className="p-4 bg-error-container/20 text-error mb-6 border border-error/30 rounded max-h-40 overflow-y-auto custom-scrollbar">
                <p className="font-bold text-xs uppercase mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span> Cảnh báo tồn tại:
                </p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  {getPublishWarnings().map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="py-3 border border-outline-variant hover:bg-surface-bright/10 text-on-surface-variant transition-all rounded font-bold uppercase text-xs tracking-widest"
                onClick={() => setShowPublishModal(false)}
                disabled={actionLoading}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="py-3 bg-primary text-on-primary hover:brightness-110 transition-all rounded font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                onClick={handlePublishSubmit}
                disabled={actionLoading}
              >
                {actionLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                Đồng Ý Công Bố
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal for new Roster */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-surface-container border border-outline-gold w-full max-w-lg p-8 rounded shadow-2xl scale-100 transform transition-transform duration-300">
            <h3 className="font-headline-md text-headline-md text-primary uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Tạo Lịch Roster Mới
            </h3>
            
            <form onSubmit={handleCreateRosterSubmit} className="space-y-4 text-xs font-label-md">
              <div>
                <label className="block text-on-surface-variant font-bold uppercase mb-1">Ngày Bắt Đầu Tuần (Thứ 2):</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-surface-container-lowest border border-outline-gold rounded px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  value={newRoster.weekStartDate}
                  onChange={(e) => {
                    const startVal = e.target.value;
                    let deadlineVal = "";
                    if (startVal) {
                      const d = new Date(startVal);
                      // Default deadline is the Saturday before (2 days before Monday)
                      d.setDate(d.getDate() - 2);
                      deadlineVal = d.toISOString().split("T")[0];
                    }
                    setNewRoster(prev => ({
                      ...prev,
                      weekStartDate: startVal,
                      registrationDeadline: deadlineVal
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold uppercase mb-1">Hạn Chót Nhân Viên Đăng Ký (Không bắt buộc):</label>
                <input
                  type="date"
                  className="w-full bg-surface-container-lowest border border-outline-gold rounded px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  value={newRoster.registrationDeadline}
                  onChange={(e) => setNewRoster(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                />
              </div>

              {/* Add Closed Day */}
              <div className="border border-outline-gold p-4 rounded bg-surface-container-lowest space-y-3">
                <p className="font-bold text-primary uppercase text-[10px]">Cài đặt ngày nghỉ / Đóng cửa tiệm:</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 bg-surface-container border border-outline-gold rounded px-3 py-2 focus:outline-none"
                    value={closedDayInput.date}
                    onChange={(e) => setClosedDayInput(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Lý do nghỉ lễ/sửa chữa..."
                    className="flex-[2] bg-surface-container border border-outline-gold rounded px-3 py-2 focus:outline-none"
                    value={closedDayInput.reason}
                    onChange={(e) => setClosedDayInput(prev => ({ ...prev, reason: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={handleAddClosedDay}
                    className="px-3 py-2 bg-primary text-on-primary font-bold rounded hover:brightness-110"
                  >
                    Thêm
                  </button>
                </div>

                {newRoster.closedDays.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {newRoster.closedDays.map((d, i) => (
                      <div key={`${d.date}-${i}`} className="flex justify-between items-center p-2 bg-surface-container rounded text-[11px]">
                        <span>{formatDate(d.date, { day: "2-digit", month: "2-digit", year: "numeric" })} - {d.reason}</span>
                        <button type="button" onClick={() => handleRemoveClosedDay(i)} className="text-error hover:scale-110">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-gold">
                <button
                  type="button"
                  className="py-3 border border-outline-variant hover:bg-surface-bright/10 text-on-surface-variant transition-all rounded font-bold uppercase tracking-widest"
                  onClick={() => setShowCreateModal(false)}
                  disabled={actionLoading}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-3 bg-primary text-on-primary hover:brightness-110 transition-all rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Khởi Tạo Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
