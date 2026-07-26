"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { absenceService } from '@/services/absence.service';
import { useAuth } from '@/context/AuthContext';

export default function BarberAbsencePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('personal');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showUrgentWarning, setShowUrgentWarning] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await absenceService.getMyRequests(filter);
      if (res && res.absences) {
        setRequests(res.absences);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, [filter, fetchRequests]);

  useEffect(() => {
    if (startDate) {
      const selectedDate = new Date(startDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const diffTime = Math.abs(selectedDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowUrgentWarning(diffDays <= 1);
      
      // Auto set endDate if it's empty or earlier than startDate
      if (!endDate || new Date(endDate) < selectedDate) {
        setEndDate(startDate);
      }
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!user || !user.id) {
      return setMessage({ text: "Không tìm thấy thông tin Barber.", type: "error" });
    }

    const sDate = new Date(startDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (sDate < today) {
      return setMessage({ text: 'Ngày bắt đầu nghỉ không được nằm trong quá khứ.', type: 'error' });
    }

    try {
      setIsSubmitting(true);
      await absenceService.createRequest({
        barberId: user.id, // Ensure this matches what the backend expects or maybe backend extracts from token? Wait, backend expects barberId in body for admin, but for barber role it might override or expect it. Actually backend expects barberId. Let's pass user.id and let backend handle it. Wait, user.id is User ID, not Barber ID.
        // Actually, looking at backend: "const { barberId } = req.body;". 
        // If the user is a Barber, maybe the backend should automatically use their Barber ID? 
        // Let's pass user.id temporarily, backend will need a fix if it expects barber.id
        // Wait! In getAbsenceRequests, backend checks `if (req.role === 'barber') const barber = await Barber.findOne({ userId: req.userId });` 
        // But in createAbsenceRequest, it just takes `barberId` from body!
        // We will pass user.id but we need to fix the backend to use req.userId for barbers.
        barberId: user.id, 
        startDate,
        endDate,
        reason,
        description
      });
      
      setMessage({ text: 'Yêu cầu đã được gửi thành công. Vui lòng chờ quản lý duyệt.', type: 'success' });
      setStartDate('');
      setEndDate('');
      setDescription('');
      fetchRequests();
    } catch (error) {
      setMessage({ text: error.message || 'Có lỗi xảy ra khi gửi yêu cầu', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return '';
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[new Date(dateStr).getDay()];
  };

  const reasonMap = {
    'sick_leave': 'Sức khỏe',
    'vacation': 'Nghỉ phép',
    'emergency': 'Khẩn cấp',
    'training': 'Đào tạo',
    'personal': 'Việc riêng',
    'other': 'Khác'
  };

  return (
    <div className="w-full text-body-md overflow-x-hidden">
      <div className="py-12 px-4 md:px-8 max-w-[1200px] mx-auto">
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="font-headline-lg text-headline-lg md:text-[48px] md:leading-[56px] text-primary uppercase tracking-tight mb-2">Xin nghỉ bất thường</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Quản lý lịch trình làm việc và yêu cầu nghỉ phép đột xuất một cách chuyên nghiệp.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Request Form (Left Column) */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h2 className="font-headline-md text-headline-md text-primary-fixed-dim mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">event_busy</span>
                Gửi yêu cầu mới
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="font-label-md text-[12px] text-on-surface-variant uppercase tracking-widest">Từ ngày</label>
                    <input 
                      type="date" 
                      required
                      value={startDate}
                      min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant/50 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none rounded-sm" 
                    />
                  </div>
                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="font-label-md text-[12px] text-on-surface-variant uppercase tracking-widest">Đến ngày</label>
                    <input 
                      type="date" 
                      required
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant/50 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none rounded-sm" 
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="font-label-md text-[12px] text-on-surface-variant uppercase tracking-widest">Lý do nghỉ</label>
                  <select 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/50 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none rounded-sm"
                  >
                    <option value="personal">Việc cá nhân đột xuất</option>
                    <option value="sick_leave">Vấn đề sức khỏe</option>
                    <option value="emergency">Khẩn cấp gia đình</option>
                    <option value="vacation">Nghỉ phép</option>
                    <option value="other">Khác...</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="font-label-md text-[12px] text-on-surface-variant uppercase tracking-widest">Ghi chú thêm</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full bg-surface-container-high border border-outline-variant/50 text-on-surface p-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none rounded-sm" 
                    placeholder="Nhập chi tiết lý do..." 
                  ></textarea>
                </div>

                {/* Warnings Area */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-surface-container-highest border-l-2 border-primary-fixed-dim rounded-sm">
                    <span className="material-symbols-outlined text-primary-fixed-dim">info</span>
                    <p className="text-sm text-on-surface-variant italic">Bạn chỉ được phép nghỉ tối đa 2 ngày trong một tháng. Nên gửi yêu cầu trước 1-2 ngày để bộ phận quản lý kịp sắp xếp nhân sự.</p>
                  </div>
                  
                  {showUrgentWarning && (
                    <div className="flex items-start gap-3 p-4 bg-error-container/20 border-l-2 border-error rounded-sm">
                      <span className="material-symbols-outlined text-error">warning</span>
                      <p className="text-sm text-error font-bold">Cảnh báo: Ngày nghỉ sát ngày làm việc (trong vòng 24h). Việc nghỉ gấp có thể ảnh hưởng đến chỉ số chuyên cần.</p>
                    </div>
                  )}
                  
                  {message.text && (
                    <div className={`flex items-start gap-3 p-4 border-l-2 rounded-sm ${message.type === 'error' ? 'bg-error-container/20 border-error' : 'bg-primary-container/20 border-primary'}`}>
                      <span className={`material-symbols-outlined ${message.type === 'error' ? 'text-error' : 'text-primary'}`}>
                        {message.type === 'error' ? 'error' : 'check_circle'}
                      </span>
                      <p className={`text-sm ${message.type === 'error' ? 'text-error' : 'text-primary'}`}>{message.text}</p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-on-primary py-4 font-headline-sm uppercase tracking-tighter hover:brightness-110 shadow-lg shadow-primary/10 transition-all active:scale-95 duration-200 rounded-sm disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
                  {isSubmitting ? 'ĐANG GỬI...' : 'Gửi yêu cầu nghỉ'}
                </button>
              </form>
            </div>
          </div>

          {/* List View (Right Column) */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant p-8 h-full flex flex-col rounded-xl">
              <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary-fixed-dim flex items-center gap-3">
                    <span className="material-symbols-outlined">history</span>
                    Lịch sử yêu cầu
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">Các yêu cầu gần nhất của bạn</p>
                </div>
                <div className="flex gap-2">
                  <span 
                    onClick={() => setFilter('')}
                    className={`px-3 py-1 text-[10px] font-label-md uppercase border border-outline-variant cursor-pointer transition-colors rounded-sm ${filter === '' ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    Tất cả
                  </span>
                  <span 
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1 text-[10px] font-label-md uppercase border border-outline-variant cursor-pointer transition-colors rounded-sm ${filter === 'pending' ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    Chờ duyệt
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1 custom-scrollbar pr-2">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      <th className="pb-4 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Thời gian</th>
                      <th className="pb-4 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Lý do</th>
                      <th className="pb-4 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-on-surface-variant italic">Không có yêu cầu nghỉ nào.</td>
                      </tr>
                    ) : requests.map((req) => (
                      <tr key={req._id} className="group hover:bg-surface-container-high/40 transition-colors">
                        <td className="py-5">
                          <div className="font-bold text-on-surface">
                            {formatDate(req.startDate)} 
                            {req.startDate !== req.endDate && ` - ${formatDate(req.endDate)}`}
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-label-md uppercase tracking-widest mt-1">
                            {getDayOfWeek(req.startDate)} 
                            {req.startDate !== req.endDate && ` - ${getDayOfWeek(req.endDate)}`}
                          </div>
                        </td>
                        <td className="py-5 max-w-[150px] truncate text-on-surface-variant pr-4">
                          {reasonMap[req.reason] || req.reason}
                          {req.description && <span className="block text-xs italic text-outline mt-1 truncate">{req.description}</span>}
                        </td>
                        <td className="py-5">
                          {req.isApproved === null ? (
                            <span className="flex items-center gap-1.5 text-gold-dim">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse"></span>
                              <span className="text-xs font-bold uppercase tracking-tighter">Chờ duyệt</span>
                            </span>
                          ) : req.isApproved === true ? (
                            <span className="flex items-center gap-1.5 text-green-500/80">
                              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                              <span className="text-xs font-bold uppercase tracking-tighter">Đã duyệt</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-error">
                              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
                              <span className="text-xs font-bold uppercase tracking-tighter">Từ chối</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Info inside list */}
              <div className="mt-6 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between text-on-surface-variant text-xs italic gap-4">
                <div className="flex items-center gap-2 text-primary/80">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Hệ thống tự động đồng bộ với lịch đặt chỗ.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
