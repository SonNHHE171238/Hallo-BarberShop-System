"use client";

import React, { useState, useEffect } from "react";
import { absenceService } from "@/services/absence.service";
import { staffDashboardService } from "@/services/staffDashboard.service";
import Link from "next/link";

export default function AdminAbsencesPage() {
  const [absences, setAbsences] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Resolution Modal State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [resolvingBookingId, setResolvingBookingId] = useState(null);
  const [newBarberId, setNewBarberId] = useState("");

  useEffect(() => {
    fetchAbsences();
  }, [filter]);

  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const res = await absenceService.getMyRequests(filter);
      setAbsences(Array.isArray(res.absences) ? res.absences : (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Lỗi tải danh sách yêu cầu nghỉ phép." });
    } finally {
      setLoading(false);
    }
  };

  const fetchBarbers = async () => {
    try {
      const res = await staffDashboardService.getBarbersStatus();
      if (res && res.barbers) {
        setBarbers(res.barbers);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách thợ:", err);
    }
  };

  const handleApprove = async (absence) => {
    // Check if there are unresolved affected bookings
    const hasPending = absence.affectedBookings?.some(b => b.status === "pending_reschedule");
    if (hasPending) {
      setSelectedAbsence(absence);
      if (barbers.length === 0) fetchBarbers();
      setResolveModalOpen(true);
      return;
    }

    try {
      await absenceService.approveAbsence(absence._id);
      setMessage({ type: "success", text: "Đã duyệt đơn xin nghỉ thành công." });
      fetchAbsences();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Lỗi khi duyệt đơn." });
    }
  };

  const handleReject = async (absenceId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối đơn xin nghỉ này?")) return;
    
    try {
      await absenceService.rejectAbsence(absenceId);
      setMessage({ type: "success", text: "Đã từ chối đơn xin nghỉ." });
      fetchAbsences();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Lỗi khi từ chối đơn." });
    }
  };

  const handleResolveBooking = async (bookingId, action) => {
    if (action === "reassigned" && !newBarberId) {
      alert("Vui lòng chọn thợ mới để đổi lịch.");
      return;
    }

    try {
      setResolvingBookingId(bookingId);
      await absenceService.resolveBooking(selectedAbsence._id, bookingId, {
        action,
        newBarberId: action === "reassigned" ? newBarberId : undefined
      });
      
      // Cập nhật lại UI sau khi resolve thành công
      const updatedAbsence = { ...selectedAbsence };
      const bookingIndex = updatedAbsence.affectedBookings.findIndex(b => b._id === bookingId);
      if (bookingIndex !== -1) {
        updatedAbsence.affectedBookings[bookingIndex].status = action;
        if (action === "reassigned") {
          const newBarber = barbers.find(b => b.userId?._id === newBarberId || b.id === newBarberId);
          updatedAbsence.affectedBookings[bookingIndex].newBarberId = { userId: newBarber?.user || { name: "Thợ thay thế" } };
        }
      }
      setSelectedAbsence(updatedAbsence);
      
      // Update in main list too
      setAbsences(prev => prev.map(a => a._id === updatedAbsence._id ? updatedAbsence : a));
      
      setNewBarberId("");
    } catch (err) {
      alert(err.message || "Lỗi khi xử lý lịch hẹn.");
    } finally {
      setResolvingBookingId(null);
    }
  };

  const handleApproveAfterResolve = async () => {
    const hasPending = selectedAbsence.affectedBookings?.some(b => b.status === "pending_reschedule");
    if (hasPending) {
      alert("Vui lòng xử lý tất cả các lịch hẹn bị trùng trước khi duyệt.");
      return;
    }
    
    try {
      await absenceService.approveAbsence(selectedAbsence._id);
      setMessage({ type: "success", text: "Đã duyệt đơn sau khi xử lý lịch hẹn trùng." });
      setResolveModalOpen(false);
      setSelectedAbsence(null);
      fetchAbsences();
    } catch (err) {
      alert(err.message || "Lỗi khi duyệt đơn.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const reasonMap = {
    sick_leave: "Sức khỏe",
    vacation: "Nghỉ phép",
    emergency: "Khẩn cấp",
    training: "Đào tạo",
    personal: "Việc riêng",
    other: "Khác"
  };

  return (
    <div className="py-8 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg md:text-[36px] text-primary uppercase tracking-tight mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-[40px]">event_busy</span>
            Quản Lý Nghỉ Phép
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Phê duyệt và xử lý các đơn xin nghỉ của Barber</p>
        </div>
        <div className="flex gap-2">
          {["", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-xs font-label-md uppercase border border-outline-variant transition-colors rounded-sm ${
                filter === status
                  ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-primary bg-surface-container hover:bg-surface-container-high"
              }`}
            >
              {status === "" ? "Tất cả" : status === "pending" ? "Chờ duyệt" : status === "approved" ? "Đã duyệt" : "Từ chối"}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-sm flex items-center gap-3 ${message.type === "error" ? "bg-error-container text-error" : "bg-primary-container text-primary"}`}>
          <span className="material-symbols-outlined">{message.type === "error" ? "error" : "check_circle"}</span>
          <span className="font-bold">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto material-symbols-outlined">close</button>
        </div>
      )}

      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant uppercase text-xs tracking-widest font-label-md border-b border-outline-variant">
                <th className="p-4">Thời Gian</th>
                <th className="p-4">Thợ (Barber)</th>
                <th className="p-4">Lý do</th>
                <th className="p-4 text-center">Trùng Lịch</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-primary">progress_activity</span>
                    <p>Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : absences.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant italic">Không có đơn xin nghỉ nào phù hợp.</td>
                </tr>
              ) : (
                absences.map((req) => {
                  const hasAffected = req.affectedBookings && req.affectedBookings.length > 0;
                  const unresolvedCount = hasAffected ? req.affectedBookings.filter(b => b.status === "pending_reschedule").length : 0;
                  
                  return (
                    <tr key={req._id} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-on-surface">
                          {formatDate(req.startDate)} 
                          {req.startDate !== req.endDate && ` - ${formatDate(req.endDate)}`}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-primary">{req.barberId?.userId?.name || "Unknown"}</div>
                        <div className="text-xs text-on-surface-variant">{req.barberId?.userId?.phone || ""}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{reasonMap[req.reason] || req.reason}</div>
                        {req.description && <div className="text-xs text-on-surface-variant italic truncate max-w-[200px] mt-1">{req.description}</div>}
                      </td>
                      <td className="p-4 text-center">
                        {hasAffected ? (
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${unresolvedCount > 0 ? "bg-error-container text-error" : "bg-primary-container text-primary"}`}>
                            {req.affectedBookings.length} khách ({unresolvedCount} chờ xử lý)
                          </span>
                        ) : (
                          <span className="text-on-surface-variant text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {req.isApproved === null ? (
                          <span className="text-gold font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span> Chờ duyệt
                          </span>
                        ) : req.isApproved === true ? (
                          <span className="text-green-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Đã duyệt
                          </span>
                        ) : (
                          <span className="text-error font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">cancel</span> Từ chối
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {req.isApproved === null && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleReject(req._id)}
                              className="px-3 py-1.5 bg-surface-container-highest text-error hover:bg-error hover:text-on-error font-bold text-xs uppercase rounded-sm transition-colors"
                            >
                              Từ chối
                            </button>
                            <button 
                              onClick={() => handleApprove(req)}
                              className={`px-3 py-1.5 font-bold text-xs uppercase rounded-sm transition-colors flex items-center gap-1 ${
                                unresolvedCount > 0 
                                  ? "bg-gold text-on-primary hover:bg-gold-dim" 
                                  : "bg-primary text-on-primary hover:brightness-110"
                              }`}
                            >
                              {unresolvedCount > 0 ? (
                                <>
                                  <span className="material-symbols-outlined text-[16px]">warning</span> Xử lý trùng
                                </>
                              ) : "Duyệt"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xử lý lịch hẹn trùng */}
      {resolveModalOpen && selectedAbsence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-outline-variant shadow-2xl rounded-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container">
              <div>
                <h3 className="font-headline-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">warning</span> Xử lý lịch hẹn trùng
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Barber <strong>{selectedAbsence.barberId?.userId?.name}</strong> xin nghỉ từ {formatDate(selectedAbsence.startDate)} đến {formatDate(selectedAbsence.endDate)}.<br/>
                  Bạn phải xử lý các lịch hẹn đã đặt trước khi có thể duyệt đơn.
                </p>
              </div>
              <button onClick={() => setResolveModalOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:text-error">close</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest">
              <div className="space-y-4">
                {selectedAbsence.affectedBookings.map(b => (
                  <div key={b._id} className={`p-4 border rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${b.status === "pending_reschedule" ? "border-error/50 bg-error-container/10" : "border-primary/50 bg-primary-container/10"}`}>
                    <div>
                      <div className="font-bold flex items-center gap-2 text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                        {new Date(b.originalDate).toLocaleString('vi-VN')}
                      </div>
                      <div className="text-sm text-on-surface-variant mt-1">
                        Khách: <strong className="text-on-surface">{b.bookingId?.customerId?.name || "Khách hàng"}</strong> - SĐT: {b.bookingId?.customerId?.phone || "N/A"}
                      </div>
                      
                      <div className="mt-2 text-xs font-bold uppercase tracking-widest">
                        Trạng thái xử lý: 
                        {b.status === "pending_reschedule" && <span className="text-error ml-2">Đang chờ</span>}
                        {b.status === "cancelled" && <span className="text-on-surface-variant ml-2">Đã hủy lịch</span>}
                        {b.status === "reassigned" && <span className="text-primary ml-2">Đã đổi sang thợ: {b.newBarberId?.userId?.name || b.newBarberId?.user?.name || "Thợ khác"}</span>}
                      </div>
                    </div>

                    {b.status === "pending_reschedule" && (
                      <div className="flex flex-col gap-2 min-w-[250px] bg-surface-container p-3 rounded-sm border border-outline-variant/30">
                        <button 
                          onClick={() => handleResolveBooking(b._id, "cancelled")}
                          disabled={resolvingBookingId === b._id}
                          className="w-full py-2 bg-surface-container-highest text-error hover:bg-error hover:text-on-error text-xs font-bold uppercase rounded-sm transition-colors"
                        >
                          Hủy lịch khách
                        </button>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-outline-variant/50"></div>
                          </div>
                          <div className="relative flex justify-center text-[10px] uppercase font-bold text-on-surface-variant">
                            <span className="bg-surface-container px-2">Hoặc đổi thợ</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <select 
                            className="flex-1 bg-surface-container-lowest border border-outline-variant text-on-surface text-sm p-2 outline-none rounded-sm"
                            onChange={(e) => setNewBarberId(e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>-- Chọn thợ rảnh --</option>
                            {barbers.filter(barber => barber.id !== selectedAbsence.barberId?._id && barber.id !== selectedAbsence.barberId).map(barber => (
                              <option key={barber.id} value={barber.id}>{barber.user?.name || "Thợ"} (Đánh giá: {barber.averageRating}★)</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleResolveBooking(b._id, "reassigned")}
                            disabled={resolvingBookingId === b._id}
                            className="px-3 bg-primary text-on-primary text-xs font-bold rounded-sm hover:brightness-110 disabled:opacity-50 flex items-center justify-center"
                          >
                            {resolvingBookingId === b._id ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : "Lưu"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant/30 bg-surface-container flex justify-end gap-3">
              <button 
                onClick={() => setResolveModalOpen(false)}
                className="px-6 py-3 font-bold uppercase text-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Đóng lại
              </button>
              <button 
                onClick={handleApproveAfterResolve}
                disabled={selectedAbsence.affectedBookings?.some(b => b.status === "pending_reschedule")}
                className="px-6 py-3 bg-primary text-on-primary font-bold uppercase text-sm rounded-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
              >
                Duyệt Đơn Nghỉ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
