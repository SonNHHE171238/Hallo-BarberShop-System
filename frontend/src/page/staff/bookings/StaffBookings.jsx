"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { staffDashboardService } from '@/services/staffDashboard.service';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function StaffBookings() {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, serving: 0, emptyChairs: 0 });
  const [hasFutureBookings, setHasFutureBookings] = useState(true);
  const [hasPastBookings, setHasPastBookings] = useState(true);
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Filters State
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const [dateFilter, setDateFilter] = useState(todayStr); // Default: Hôm nay
  const [barberFilter, setBarberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'waiting', 'serving'
  
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, booking: null, isPayment: false });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [statusConfirmModal, setStatusConfirmModal] = useState({ isOpen: false, status: null, title: '', message: '', icon: '', color: '' });

  const handleChangeDay = (offset) => {
    const current = dateFilter ? new Date(dateFilter) : new Date();
    current.setDate(current.getDate() + offset);
    setDateFilter(current.toLocaleDateString('en-CA'));
  };

  // Polling riêng cho QR Code (mỗi 3s)
  useEffect(() => {
    if (!qrCodeData || !checkInModal.booking) return;
    
    const qrInterval = setInterval(async () => {
      await fetchData(false);
    }, 3000);

    return () => clearInterval(qrInterval);
  }, [qrCodeData, checkInModal.booking]);

  // Lắng nghe khi appointments được cập nhật để biết khách đã quét mã thành công
  useEffect(() => {
    if (qrCodeData && checkInModal.isOpen && checkInModal.booking) {
      const updatedBooking = appointments.find(b => b._id === checkInModal.booking._id);
      if (updatedBooking && updatedBooking.paymentStatus === 'paid') {
        toast.success('Nhận tiền thành công! Khách đã thanh toán.');
        setQrCodeData(null);
        setCheckInModal({ isOpen: false, booking: null, isPayment: false });
      }
    }
  }, [appointments, qrCodeData, checkInModal.isOpen]);

  const handleStatusUpdate = async (status) => {
    if (!checkInModal.booking) return;

    if (status === 'completed' && !checkInModal.isPayment) {
      setCheckInModal(prev => ({ ...prev, isPayment: true }));
      setPaymentMethod('cash');
      return;
    }

    try {
      let payload = { status };
      
      if (status === 'completed' && checkInModal.isPayment) {
        const total = checkInModal.booking.totalPrice || 0;
        const paid = checkInModal.booking.amountPaid || 0;
        const remainingAmount = Math.max(0, total - paid);
        
        if (paymentMethod === 'bank_transfer') {
          const linkRes = await staffDashboardService.createPaymentLink({
            bookingId: checkInModal.booking._id,
            amount: remainingAmount
          });
          if (linkRes && linkRes.qrCode) {
            setQrCodeData(linkRes.qrCode);
          }
          return;
        }

        payload.amountPaid = remainingAmount;
        payload.paymentMethod = paymentMethod;
      }

      const res = await staffDashboardService.updateStatus(checkInModal.booking._id, payload);
      if (res) {
        toast.success(status === 'completed' ? 'Đã thu tiền & hoàn thành' : 'Đã cập nhật trạng thái');
        fetchData(false);
      }
      setQrCodeData(null);
      setCheckInModal({ isOpen: false, booking: null, isPayment: false });
    } catch (error) {
      toast.error(error.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [appRes, barbersRes] = await Promise.all([
        staffDashboardService.getAppointmentsList({
          date: dateFilter || 'all',
          barberId: barberFilter,
          status: statusFilter
        }),
        staffDashboardService.getBarbersStatus()
      ]);

      if (appRes) {
        const appData = appRes.data || appRes;
        setAppointments(appData.appointments || []);
        setStats(appData.stats || { total: 0, serving: 0, emptyChairs: 0 });
        setHasFutureBookings(appData.hasFutureBookings !== false);
        setHasPastBookings(appData.hasPastBookings !== false);
      }

      if (barbersRes) {
        const barbersData = barbersRes.data || barbersRes;
        setBarbers(Array.isArray(barbersData) ? barbersData : []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu lịch hẹn');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [dateFilter, barberFilter, statusFilter]);

  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(intervalId);
  }, [dateFilter, barberFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex-1 overflow-y-auto p-12 space-y-8 pb-24 max-w-[1400px] mx-auto animate-fade-in">
        {/* Header (Text only, based on user request) */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-primary">QUẢN LÝ LỊCH HẸN</h2>
          <span className="px-3 py-1 rounded-full bg-outline-variant/20 border border-outline-variant text-[10px] font-bold text-gold-dim tracking-widest uppercase">LIVE DASHBOARD</span>
        </div>

        {/* Filters & Actions */}
        <section className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-6 items-center">

            <div className="flex items-center gap-3">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider whitespace-nowrap">Ngày làm việc:</label>
              <div className="relative flex items-center gap-2 bg-surface-container border border-outline-variant px-4 h-11 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined text-gold-dim text-lg z-10">event</span>
                <span className="absolute left-11 top-1/2 -translate-y-1/2 font-body-md text-sm text-on-surface pointer-events-none">
                  {dateFilter ? new Date(dateFilter).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'}) : ''}
                </span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent outline-none font-body-md text-sm text-transparent [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert w-[140px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider whitespace-nowrap">Thợ Barber:</label>
              <select
                value={barberFilter}
                onChange={(e) => setBarberFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant px-4 h-11 rounded-lg text-sm focus:ring-primary outline-none min-w-[180px] text-on-surface"
              >
                <option value="all">Tất cả thợ</option>
                {barbers.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-label-md text-xs text-outline uppercase tracking-wider whitespace-nowrap">Trạng thái:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant px-4 h-11 rounded-lg text-sm focus:ring-primary outline-none min-w-[180px] text-on-surface"
              >
                <option value="all">Tất cả</option>
                <option value="waiting">Đang chờ</option>
                <option value="serving">Đang làm</option>
                <option value="confirmed">Khách đã đến</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="no_show">Không đến</option>
                <option value="rejected">Bị từ chối</option>
              </select>
            </div>
          </div>
        </section>

        {/* Appointment Bento Grid / List */}
        <section className="space-y-4">
          <div className="grid grid-cols-12 gap-0 border-b border-outline-variant pb-4 px-6 text-xs font-label-md text-outline tracking-widest uppercase">
            <div className="col-span-3">Khách hàng</div>
            <div className="col-span-2">Thời gian</div>
            <div className="col-span-3">Dịch vụ</div>
            <div className="col-span-2">Barber phụ trách</div>
            <div className="col-span-2 text-right">Trạng thái / Thao tác</div>
          </div>

          <div className="min-h-[480px] flex flex-col justify-between">
            {appointments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-outline">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">event_busy</span>
                Không có lịch hẹn nào khớp với bộ lọc.
              </div>
            ) : (
                  <div className="flex flex-col h-full justify-between flex-1">
                    <div className="space-y-3 max-h-[850px] overflow-y-auto custom-scrollbar pr-2">
                    {appointments.map((booking) => {
                      // Styling logic depending on rawStatus or uiStatus
                      let rowClass = "bg-surface-container/20 border border-outline-variant/20 px-6 py-5 rounded-lg hover:border-primary group transition-all cursor-pointer";
                let initialsClass = "bg-surface-container-highest text-primary";
                let badgeClass = "bg-primary/10 text-primary";

                if (booking.uiStatus === 'Chưa tới') {
                  rowClass = "bg-surface-container/40 border border-outline-variant/50 px-6 py-5 rounded-lg hover:border-gold-dim transition-all cursor-pointer";
                  initialsClass = "bg-outline-variant/20 text-outline";
                  badgeClass = "bg-outline-variant/20 text-outline";
                } else if (booking.uiStatus === 'Hoàn thành') {
                  rowClass = "bg-surface-container/20 border border-outline-variant/20 px-6 py-5 rounded-lg opacity-80 hover:opacity-100 transition-all cursor-pointer grayscale hover:grayscale-0";
                } else if (booking.uiStatus === 'Đã hủy' || booking.uiStatus === 'Không đến') {
                  rowClass = "bg-error-container/5 border border-error/10 px-6 py-5 rounded-lg opacity-60";
                  initialsClass = "bg-error/10 text-error";
                } else if (booking.uiStatus === 'Khách đã đến') {
                  rowClass = "glass-card px-6 py-5 rounded-lg hover:border-green-600 border border-green-600/30 transition-all cursor-pointer shadow-lg";
                }

                const isFuture = new Date(booking.rawDate).setHours(0,0,0,0) > new Date().setHours(0,0,0,0);

                // Extract initials
                const initials = booking.customerName
                  ? booking.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  : 'KH';

                return (
                  <div
                    key={booking._id}
                    className={`grid grid-cols-12 gap-0 items-center cursor-pointer hover:bg-surface-variant/30 ${rowClass}`}
                    onClick={() => router.push(`/staff/bookings/detail?id=${booking._id}`)}
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${initialsClass}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-headline-sm text-sm font-bold text-on-surface truncate">{booking.customerName}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${badgeClass}`}>
                          {booking.customerType}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="font-headline-sm text-sm font-bold text-on-surface">{booking.time}</span>
                      <span className="font-label-md text-xs text-on-surface-variant">{booking.date}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="bg-outline-variant/30 px-2.5 py-1 rounded text-xs text-on-surface">
                        {booking.serviceName}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {booking.barberName === 'Auto' && booking.uiStatus === 'Đã hủy' ? (
                        <p className="text-sm text-outline">--</p>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-gold-dim/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px] text-gold-dim">person</span>
                          </div>
                          <p className="text-sm">{booking.barberName}</p>
                        </>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end items-center">
                      {(() => {
                        const displayStatus = isFuture ? 'pending' : booking.rawStatus;
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isFuture) {
                                toast('Lịch chưa tới, không thể thay đổi trạng thái');
                                return;
                              }
                              if (booking.rawStatus === 'completed' || booking.rawStatus === 'no_show' || booking.rawStatus === 'cancelled' || booking.rawStatus === 'rejected') {
                                toast('Lịch đã đóng, không thể thay đổi trạng thái');
                                return;
                              }
                              setCheckInModal({ isOpen: true, booking: booking, isPayment: false });
                            }}
                            className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 ${
                              isFuture ? 'bg-surface-variant text-on-surface-variant border border-outline-variant opacity-60 cursor-not-allowed' :
                              displayStatus === 'completed'
                                ? 'bg-green-500/20 text-green-500 hover:bg-surface-variant hover:text-on-surface-variant'
                                : displayStatus === 'confirmed'
                                ? 'bg-green-800/20 text-green-700 border border-green-700/50 hover:bg-green-800/30'
                                : displayStatus === 'in_progress'
                                ? 'bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30'
                                : displayStatus === 'no_show' || displayStatus === 'cancelled' || displayStatus === 'rejected'
                                ? 'bg-error/20 text-error border border-error/50 hover:bg-error/30'
                                : 'bg-surface-variant text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
                            }`}
                            title="Đổi trạng thái"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {displayStatus === 'completed' ? 'check_circle' : displayStatus === 'in_progress' ? 'content_cut' : displayStatus === 'confirmed' ? 'how_to_reg' : displayStatus === 'no_show' ? 'block' : displayStatus === 'cancelled' || displayStatus === 'rejected' ? 'cancel' : 'pending_actions'}
                            </span>
                            {displayStatus === 'completed' ? 'Đã xong' : displayStatus === 'confirmed' ? 'Khách đã đến' : displayStatus === 'in_progress' ? 'Đang làm' : displayStatus === 'no_show' ? 'Không đến' : displayStatus === 'cancelled' || displayStatus === 'rejected' ? 'Đã Hủy' : 'Chưa tới'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
              </div>
              </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-outline-variant/30">
              {hasPastBookings ? (
                <button
                  onClick={() => handleChangeDay(-1)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface transition-all shadow-sm border border-outline-variant/30"
                  title="Ngày hôm trước"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
              ) : (
                <div className="w-8 h-8"></div>
              )}
              
              <span className="text-xs font-bold text-outline uppercase tracking-wider">
                Ngày <span className="text-primary">{dateFilter ? new Date(dateFilter).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Tất cả'}</span>
              </span>
              
              {hasFutureBookings ? (
                <button
                  onClick={() => handleChangeDay(1)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface transition-all shadow-sm border border-outline-variant/30"
                  title="Ngày hôm sau"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom Stats / Quick Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl flex items-center justify-between border-b-2 border-b-outline-variant">
            <div>
              <p className="text-[10px] font-label-md text-outline uppercase">Tổng lịch hẹn</p>
              <h3 className="text-xl font-bold text-primary mt-1">{stats.total < 10 ? `0${stats.total}` : stats.total}</h3>
            </div>
            <span className="material-symbols-outlined text-3xl text-outline/20">calendar_month</span>
          </div>

          <div className="glass-card p-4 rounded-xl flex items-center justify-between border-b-2 border-b-secondary">
            <div>
              <p className="text-[10px] font-label-md text-outline uppercase">Đang phục vụ</p>
              <h3 className="text-xl font-bold text-secondary mt-1">{stats.serving < 10 ? `0${stats.serving}` : stats.serving}</h3>
            </div>
            <span className="material-symbols-outlined text-3xl text-secondary/20">content_cut</span>
          </div>

          <div className="glass-card p-4 rounded-xl flex items-center justify-between border-b-2 border-b-gold-dim">
            <div>
              <p className="text-[10px] font-label-md text-outline uppercase">Ghế còn trống</p>
              <h3 className="text-xl font-bold text-on-surface mt-1">{stats.emptyChairs < 10 ? `0${stats.emptyChairs}` : stats.emptyChairs}</h3>
            </div>
            <span className="material-symbols-outlined text-3xl text-outline/20">chair</span>
          </div>
        </section>
      </div>

      {/* Check-in Modal */}
      {checkInModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-obsidian/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-high rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
            {qrCodeData ? (
              <div className="p-6 text-center space-y-4">
                <h3 className="font-headline-sm text-xl text-primary font-bold">Mã QR Thanh Toán</h3>
                <p className="text-sm text-on-surface-variant">Khách hàng quét mã này bằng ứng dụng ngân hàng</p>
                <div className="bg-white p-4 rounded-xl flex justify-center mx-auto w-fit shadow-md">
                  <QRCodeSVG value={qrCodeData} size={200} />
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-secondary animate-pulse font-bold text-sm">
                  <span className="material-symbols-outlined text-lg">sync</span>
                  Đang chờ thanh toán...
                </div>

                <button 
                  onClick={() => setQrCodeData(null)}
                  className="w-full py-3 bg-surface-variant text-on-surface font-bold rounded-xl hover:bg-outline-variant active:scale-95 transition-all mt-4"
                >
                  Quay lại
                </button>
              </div>
            ) : checkInModal.isPayment ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                </div>
                <h3 className="font-headline-sm text-xl text-on-surface font-bold">Xác nhận thanh toán</h3>
                <p className="text-sm text-on-surface-variant">Vui lòng thu tiền trước khi hoàn thành lịch hẹn.</p>
                
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-left space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Tổng tiền dịch vụ:</span>
                    <span className="font-bold text-on-surface">{(checkInModal.booking?.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Đã thanh toán (Cọc):</span>
                    <span className="font-bold text-primary">{(checkInModal.booking?.amountPaid || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/30 flex justify-between">
                    <span className="font-bold text-on-surface">Cần thu thêm:</span>
                    <span className="font-bold text-error text-lg">{Math.max(0, (checkInModal.booking?.totalPrice || 0) - (checkInModal.booking?.amountPaid || 0)).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${paymentMethod === 'cash' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant text-on-surface-variant'}`}
                  >
                    Tiền mặt
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${paymentMethod === 'bank_transfer' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant text-on-surface-variant'}`}
                  >
                    Chuyển khoản
                  </button>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={() => handleStatusUpdate('completed')}
                    className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Xác nhận Thu tiền & Hoàn thành
                  </button>
                  <button 
                    onClick={() => setCheckInModal(prev => ({ ...prev, isPayment: false }))}
                    className="w-full py-3 bg-surface-variant text-on-surface font-bold rounded-xl hover:bg-outline-variant active:scale-95 transition-all"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-primary text-3xl">how_to_reg</span>
                </div>
                <h3 className="font-headline-sm text-xl text-on-surface font-bold">Xác nhận trạng thái</h3>
                <p className="text-sm text-on-surface-variant">Chọn trạng thái tiếp theo của lịch hẹn</p>
                
                <div className="flex flex-col gap-3 pt-4">
                  {checkInModal.booking?.rawStatus === 'completed' || checkInModal.booking?.rawStatus === 'no_show' || checkInModal.booking?.rawStatus === 'cancelled' || checkInModal.booking?.rawStatus === 'rejected' ? (
                    <div className="p-4 bg-surface-container-low rounded-xl">
                      <p className="font-bold text-on-surface">Lịch hẹn đã đóng, không thể thay đổi.</p>
                      <button
                        onClick={() => { setCheckInModal({ isOpen: false, booking: null, isPayment: false }); setQrCodeData(null); }}
                        className="w-full mt-3 py-2 bg-surface-variant text-on-surface font-bold rounded-xl"
                      >Đóng</button>
                    </div>
                  ) : checkInModal.booking?.rawStatus === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate('confirmed')}
                        className="w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 active:scale-95 transition-all shadow-md shadow-green-700/20"
                      >
                        Khách Đã Đến
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate('in_progress')}
                        className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md"
                      >
                        Đang Phục Vụ (Lên ghế)
                      </button>
                      <button 
                        onClick={() => {
                          setStatusConfirmModal({
                            isOpen: true,
                            status: 'no_show',
                            title: 'Khách Không Đến',
                            message: 'Xác nhận khách KHÔNG ĐẾN (No Show)? Lịch sẽ bị đóng.',
                            icon: 'person_off',
                            color: 'text-error',
                            bg: 'bg-error/10'
                          });
                        }}
                        className="w-full py-3 bg-error text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
                      >
                        Khách Không Đến (No Show)
                      </button>
                      <button 
                        onClick={() => {
                          setStatusConfirmModal({
                            isOpen: true,
                            status: 'cancelled',
                            title: 'Hủy Lịch Hẹn',
                            message: 'Bạn có chắc chắn muốn HỦY lịch hẹn này?',
                            icon: 'cancel',
                            color: 'text-error',
                            bg: 'bg-error/10'
                          });
                        }}
                        className="w-full py-3 bg-surface-danger text-error font-bold border border-error/50 rounded-xl hover:bg-error/10 active:scale-95 transition-all"
                      >
                        Hủy Lịch Hẹn
                      </button>
                    </>
                  ) : checkInModal.booking?.rawStatus === 'confirmed' ? (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate('in_progress')}
                        className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md"
                      >
                        Đang Phục Vụ (Lên ghế)
                      </button>
                      <button 
                        onClick={() => {
                          setStatusConfirmModal({
                            isOpen: true,
                            status: 'cancelled',
                            title: 'Hủy Lịch Hẹn',
                            message: 'Bạn có chắc chắn muốn HỦY lịch hẹn này?',
                            icon: 'cancel',
                            color: 'text-error',
                            bg: 'bg-error/10'
                          });
                        }}
                        className="w-full py-3 bg-surface-danger text-error font-bold border border-error/50 rounded-xl hover:bg-error/10 active:scale-95 transition-all"
                      >
                        Hủy Lịch Hẹn
                      </button>
                    </>
                  ) : checkInModal.booking?.rawStatus === 'in_progress' ? (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate('completed')}
                        className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
                      >
                        Xác nhận Thu tiền & Hoàn thành
                      </button>
                    </>
                  ) : null}
                  
                  {checkInModal.booking?.rawStatus !== 'completed' && checkInModal.booking?.rawStatus !== 'no_show' && checkInModal.booking?.rawStatus !== 'cancelled' && checkInModal.booking?.rawStatus !== 'rejected' && (
                    <button 
                      onClick={() => { setCheckInModal({ isOpen: false, booking: null, isPayment: false }); setQrCodeData(null); }}
                      className="w-full py-3 bg-surface-variant text-on-surface font-bold rounded-xl hover:bg-outline-variant active:scale-95 transition-all"
                    >
                      Đóng cửa sổ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {statusConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface-obsidian/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
            <div className="p-6 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${statusConfirmModal.bg}`}>
                <span className={`material-symbols-outlined text-3xl ${statusConfirmModal.color}`}>
                  {statusConfirmModal.icon}
                </span>
              </div>
              <h3 className={`font-headline-sm text-xl font-bold ${statusConfirmModal.color}`}>{statusConfirmModal.title}</h3>
              <p className="text-sm text-on-surface-variant">{statusConfirmModal.message}</p>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStatusConfirmModal({ isOpen: false, status: null, title: '', message: '', icon: '', color: '' })}
                  className="flex-1 py-3 bg-surface-variant text-on-surface font-bold rounded-xl hover:bg-outline-variant transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    handleStatusUpdate(statusConfirmModal.status);
                    setStatusConfirmModal({ isOpen: false, status: null, title: '', message: '', icon: '', color: '' });
                  }}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all shadow-md text-white ${
                    statusConfirmModal.status === 'cancelled' || statusConfirmModal.status === 'no_show' ? 'bg-error hover:brightness-110' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
