"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { staffDashboardService } from '@/services/staffDashboard.service';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function StaffDashboard() {
  const [metrics, setMetrics] = useState({
    totalBookingsToday: 0,
    waitingCustomers: 0,
    activeBarbers: 0,
    totalBarbers: 0
  });
  const [todayBookings, setTodayBookings] = useState([]);
  const [tomorrowBookings, setTomorrowBookings] = useState([]);
  const [barbersStatus, setBarbersStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, booking: null, isPayment: false });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [qrCodeData, setQrCodeData] = useState(null);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [metricsRes, bookingsRes, barbersRes] = await Promise.all([
        staffDashboardService.getMetrics(),
        staffDashboardService.getUpcomingBookings(),
        staffDashboardService.getBarbersStatus()
      ]);
      
      // api.js tự động bóc vỏ (unwrap) { success, data } thành data
      if (metricsRes) setMetrics(metricsRes);
      if (bookingsRes) {
        setTodayBookings(bookingsRes.today || []);
        setTomorrowBookings(bookingsRes.tomorrow || []);
      }
      if (barbersRes) setBarbersStatus(barbersRes);
    } catch (error) {
      console.error(error);
      toast.error('Không thể kết nối máy chủ');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    
    // Silent polling mỗi 60s
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Polling riêng cho QR Code (mỗi 3s)
  useEffect(() => {
    if (!qrCodeData || !checkInModal.booking) return;
    
    const qrInterval = setInterval(async () => {
      await fetchData(false);
    }, 3000);

    return () => clearInterval(qrInterval);
  }, [qrCodeData, checkInModal.booking]);

  // Lắng nghe khi todayBookings được cập nhật để biết khách đã quét mã thành công
  useEffect(() => {
    if (qrCodeData && checkInModal.isOpen && checkInModal.booking) {
      const updatedBooking = todayBookings.find(b => b._id === checkInModal.booking._id);
      if (updatedBooking && updatedBooking.paymentStatus === 'paid') {
        toast.success('Nhận tiền thành công! Khách đã thanh toán.');
        setQrCodeData(null);
        setCheckInModal({ isOpen: false, booking: null, isPayment: false });
      }
    }
  }, [todayBookings, qrCodeData, checkInModal.isOpen]);

  const handleStatusUpdate = async (status) => {
    if (!checkInModal.booking) return;

    // Nếu chọn Hoàn thành nhưng chưa vào màn hình Thanh toán, thì chuyển sang màn Thanh toán
    if (status === 'completed' && !checkInModal.isPayment) {
      setCheckInModal(prev => ({ ...prev, isPayment: true }));
      setPaymentMethod('cash');
      return;
    }

    try {
      const previousStatus = checkInModal.booking.status;
      let payload = { status };
      
      // Nếu đang ở màn Thanh toán và xác nhận
      if (status === 'completed' && checkInModal.isPayment) {
        const total = checkInModal.booking.totalPrice || 0;
        const paid = checkInModal.booking.amountPaid || 0;
        const remainingAmount = Math.max(0, total - paid);
        
        if (paymentMethod === 'bank_transfer') {
          // Bật mã QR Code
          const linkRes = await staffDashboardService.createPaymentLink({
            bookingId: checkInModal.booking._id,
            amount: remainingAmount
          });
          if (linkRes && linkRes.qrCode) {
            setQrCodeData(linkRes.qrCode);
            // Modal sẽ tự đổi sang hiển thị QR nhờ biến qrCodeData
          }
          return; // Dừng lại ở đây, đợi Webhook polling tự hoàn thành
        }

        // Còn nếu là Cash:
        payload.amountPaid = remainingAmount;
        payload.paymentMethod = paymentMethod;
      }

      const res = await staffDashboardService.updateStatus(checkInModal.booking._id, payload);
      // api.js tự động unwrap, nên nếu code chạy xuống đây tức là thành công
      if (res) {
        if (status === 'confirmed' && previousStatus === 'pending') {
          setMetrics(prev => ({ ...prev, waitingCustomers: prev.waitingCustomers + 1 }));
        }
        if (status === 'completed' && previousStatus === 'confirmed') {
          setMetrics(prev => ({ ...prev, waitingCustomers: Math.max(0, prev.waitingCustomers - 1) }));
        }
        if (status === 'no_show' && previousStatus === 'confirmed') {
          setMetrics(prev => ({ ...prev, waitingCustomers: Math.max(0, prev.waitingCustomers - 1) }));
        }
        toast.success(status === 'completed' ? 'Đã thu tiền & hoàn thành' : 'Đã cập nhật trạng thái');
        fetchData(false);
      }
      setQrCodeData(null);
      setCheckInModal({ isOpen: false, booking: null, isPayment: false });
    } catch (error) {
      toast.error(error.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const todayStr = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-12 space-y-12 max-w-[1400px] mx-auto animate-fade-in">
        {/* Welcome Header & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="font-display-lg text-4xl text-on-surface mb-2">Trang Quản Lý Tại Quầy</h2>
            <p className="text-on-surface-variant font-body-md flex items-center">
              <span className="material-symbols-outlined mr-2 text-sm">calendar_today</span>
              Hôm nay là {todayStr}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/staff/pos" className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-body-md text-sm font-bold hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">point_of_sale</span>
              Mở Hệ Thống POS
            </Link>
          </div>
        </div>

        {/* Metrics Row - Changed to 3 columns, removed Doanh thu dự kiến */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-36 border-b-2 border-b-primary">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-medium text-sm">Lịch hẹn hôm nay</span>
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">event_available</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold font-headline-md text-primary">{metrics.totalBookingsToday}</span>
              <span className="text-xs text-on-surface-variant">Lượt khách</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-36 border-b-2 border-b-secondary">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-medium text-sm">Thợ đang hoạt động</span>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">content_cut</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold font-headline-md text-on-surface">
                {metrics.activeBarbers}
                <span className="text-on-surface-variant font-normal text-xl">/{metrics.totalBarbers}</span>
              </span>
              <span className="text-xs text-on-surface-variant">Sẵn sàng</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-36 border-b-2 border-b-error">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-medium text-sm">Khách chờ (Đã có mặt)</span>
              <div className="p-2 bg-error/10 rounded-lg">
                <span className="material-symbols-outlined text-error">hourglass_empty</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold font-headline-md text-error">{metrics.waitingCustomers}</span>
              <span className="text-xs text-on-surface-variant">Đang chờ phục vụ</span>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Appointments List (Today & Tomorrow) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Lịch hẹn hôm nay */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center">
                  <span className="material-symbols-outlined mr-3 text-primary">today</span>
                  Lịch hẹn hôm nay
                </h3>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-high">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Thời gian</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Khách hàng</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Dịch vụ</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Barber</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {todayBookings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant">Không có lịch hẹn nào hôm nay</td>
                        </tr>
                      ) : (
                        todayBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-primary/5 transition-colors group">
                            <td className="px-6 py-5 font-label-md text-primary font-bold">{booking.time}</td>
                            <td className="px-6 py-5">
                              <p className="font-bold text-sm">{booking.customerName}</p>
                              <p className="text-[10px] text-on-surface-variant">{booking.customerPhone}</p>
                            </td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant italic">{booking.serviceName}</td>
                            <td className="px-6 py-5 text-sm font-medium">{booking.barberName}</td>
                            <td className="px-6 py-5">
                                <button
                                  onClick={() => {
                                    if (booking.status === 'completed' || booking.status === 'no_show') {
                                      toast('Lịch đã hoàn thành hoặc khách không đến, không thể thay đổi');
                                      return;
                                    }
                                    setCheckInModal({ isOpen: true, booking: booking, isPayment: false });
                                  }}
                                  className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 ${
                                    booking.status === 'completed'
                                      ? 'bg-green-500/20 text-green-500 hover:bg-surface-variant hover:text-on-surface-variant'
                                      : booking.status === 'confirmed'
                                      ? 'bg-green-800/20 text-green-700 border border-green-700/50 hover:bg-green-800/30'
                                      : booking.status === 'no_show'
                                      ? 'bg-error/20 text-error border border-error/50 hover:bg-error/30'
                                      : 'bg-surface-variant text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
                                  }`}
                                  title="Đổi trạng thái"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {booking.status === 'completed' ? 'check_circle' : booking.status === 'confirmed' ? 'how_to_reg' : booking.status === 'no_show' ? 'block' : 'pending_actions'}
                                  </span>
                                  {booking.status === 'completed' ? 'Đã xong' : booking.status === 'confirmed' ? 'Khách đã đến' : booking.status === 'no_show' ? 'Không đến' : 'Chưa tới'}
                                </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Lịch hẹn ngày mai */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center">
                  <span className="material-symbols-outlined mr-3 text-secondary">event_upcoming</span>
                  Lịch hẹn ngày mai
                </h3>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-high">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Thời gian</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Khách hàng</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Dịch vụ</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Barber</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {tomorrowBookings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant">Không có lịch hẹn nào ngày mai</td>
                        </tr>
                      ) : (
                        tomorrowBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-primary/5 transition-colors group opacity-80 hover:opacity-100">
                            <td className="px-6 py-5 font-label-md text-primary font-bold">{booking.time}</td>
                            <td className="px-6 py-5">
                              <p className="font-bold text-sm">{booking.customerName}</p>
                              <p className="text-[10px] text-on-surface-variant">{booking.customerPhone}</p>
                            </td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant italic">{booking.serviceName}</td>
                            <td className="px-6 py-5 text-sm font-medium">{booking.barberName}</td>
                            <td className="px-6 py-5">
                              <button
                                onClick={() => {
                                  if (booking.status === 'completed' || booking.status === 'no_show') {
                                    toast('Lịch đã hoàn thành hoặc khách không đến, không thể thay đổi');
                                    return;
                                  }
                                  setCheckInModal({ isOpen: true, booking: booking, isPayment: false });
                                }}
                                className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 ${
                                  booking.status === 'completed'
                                    ? 'bg-green-500/20 text-green-500 hover:bg-surface-variant hover:text-on-surface-variant'
                                    : booking.status === 'confirmed'
                                    ? 'bg-green-800/20 text-green-700 border border-green-700/50 hover:bg-green-800/30'
                                    : booking.status === 'no_show'
                                    ? 'bg-error/20 text-error border border-error/50 hover:bg-error/30'
                                    : 'bg-surface-variant text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
                                }`}
                                title="Đổi trạng thái"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {booking.status === 'completed' ? 'check_circle' : booking.status === 'confirmed' ? 'how_to_reg' : booking.status === 'no_show' ? 'block' : 'pending_actions'}
                                </span>
                                {booking.status === 'completed' ? 'Đã xong' : booking.status === 'confirmed' ? 'Khách đã đến' : booking.status === 'no_show' ? 'Không đến' : 'Chưa tới'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column: Barber Status */}
          <div className="space-y-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center">
              <span className="material-symbols-outlined mr-3 text-primary">person_search</span>
              Trạng thái barber hôm nay
            </h3>
            <div className="space-y-4">
              {barbersStatus.length === 0 ? (
                <div className="glass-card p-6 text-center text-on-surface-variant text-sm rounded-xl">Không có thợ nào hoạt động</div>
              ) : (
                barbersStatus.map(barber => {
                  let statusClass = 'bg-green-500/10 text-green-500 border-green-500/20';
                  let ringClass = 'bg-green-500';
                  let imgClass = 'grayscale-0';
                  
                  if (barber.status === 'Nghỉ phép') {
                    statusClass = 'bg-surface-variant text-on-surface-variant border-outline-variant';
                    ringClass = 'bg-on-surface-variant';
                    imgClass = 'grayscale opacity-70';
                  }

                  return (
                    <div key={barber._id} className="glass-card p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden transition-all ${imgClass}`}>
                            <img className="w-full h-full object-cover" alt={barber.name} src={barber.image} />
                          </div>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-surface rounded-full ${ringClass}`}></span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{barber.name}</p>
                          <p className="text-[10px] text-on-surface-variant italic">{barber.role}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-1 rounded ${statusClass}`}>
                        {barber.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
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
                <h3 className="font-headline-sm text-xl text-on-surface font-bold">Xác nhận trạng thái khách hàng</h3>
                <p className="text-sm text-on-surface-variant">Khách đã tới cửa hàng chưa?</p>
                
                <div className="flex flex-col gap-3 pt-4">
                  {checkInModal.booking?.status === 'completed' || checkInModal.booking?.status === 'no_show' ? (
                    <div className="p-4 bg-surface-container-low rounded-xl">
                      <p className="font-bold text-on-surface">Lịch hẹn đã hoàn thành hoặc khách không đến, không thể thay đổi.</p>
                      <button
                        onClick={() => { setCheckInModal({ isOpen: false, booking: null, isPayment: false }); setQrCodeData(null); }}
                        className="w-full mt-3 py-2 bg-surface-variant text-on-surface font-bold rounded-xl"
                      >Đóng</button>
                    </div>
                  ) : checkInModal.booking?.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate('confirmed')}
                        className="w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 active:scale-95 transition-all shadow-md shadow-green-700/20"
                      >
                        Khách Đã Đến
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate('no_show')}
                        className="w-full py-3 bg-error text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
                      >
                        Khách Không Đến (No Show)
                      </button>
                      <button 
                        onClick={() => { setCheckInModal({ isOpen: false, booking: null, isPayment: false }); setQrCodeData(null); }}
                        className="w-full py-3 bg-surface-variant text-on-surface font-bold rounded-xl hover:bg-outline-variant active:scale-95 transition-all"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate('completed')}
                        className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
                      >
                        Xác nhận Thu tiền & Hoàn thành
                      </button>
                      <button 
                        onClick={() => { setCheckInModal({ isOpen: false, booking: null, isPayment: false }); setQrCodeData(null); }}
                        className="w-full py-3 bg-surface-variant text-on-surface font-bold rounded-xl hover:bg-outline-variant active:scale-95 transition-all"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setCheckInModal({ isOpen: false, booking: null, isPayment: false });
                    setQrCodeData(null);
                  }}
                  className="mt-4 text-xs font-bold text-on-surface-variant hover:underline uppercase tracking-widest"
                >
                  Hủy bỏ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
