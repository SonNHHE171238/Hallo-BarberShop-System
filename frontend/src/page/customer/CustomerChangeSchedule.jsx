'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingService } from '@/services/booking.service';

/* ─────────────────────────────────────────────
   RescheduleModal
   ───────────────────────────────────────────── */
const RescheduleModal = ({ booking, onClose, onSuccess }) => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [note, setNote] = useState(booking?.note || '');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const barberId = booking?.barberId?._id || booking?.barberId;
  const durationMinutes = booking?.durationMinutes || 30;

  const fetchSlots = useCallback(async (date) => {
    if (!barberId || !date) return;
    setLoadingSlots(true);
    setSelectedTimeSlot('');
    setError('');
    try {
      const data = await bookingService.getAvailableSlotsForReschedule(barberId, date, durationMinutes);
      const slots = Array.isArray(data) ? data : (data?.slots || []);
      setAvailableSlots(slots);
    } catch {
      setAvailableSlots([]);
      setError('Không thể tải khung giờ. Vui lòng thử lại.');
    } finally {
      setLoadingSlots(false);
    }
  }, [barberId, durationMinutes]);

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Vui lòng chọn ngày và giờ mới trước khi cập nhật.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await bookingService.rescheduleBooking(booking._id, {
        newDate: selectedDate,
        newTimeSlot: selectedTimeSlot,
        note: note.trim(),
      });
      setSuccessMsg('Đổi lịch thành công!');
      setTimeout(() => {
        onSuccess && onSuccess(result.booking || result);
        onClose && onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const serviceName = booking?.services?.map(s => s.name || s).join(', ') || 'Dịch vụ';
  const barberName = booking?.barberId?.userId?.name || booking?.barberId?.name || 'Thợ cắt';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-surface-container rounded-2xl w-full max-w-md border border-outline-variant shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out]">

        {/* Header */}
        <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h2 className="font-headline-md text-headline-md text-primary">Đổi Lịch Hẹn</h2>
          <button onClick={onClose} aria-label="Đóng" className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Summary */}
          <div className="bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/50 space-y-1">
            <p className="font-label-md text-label-md text-primary">{serviceName}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">person</span> {barberName}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">calendar_today</span>
              Lịch hiện tại:{' '}
              {booking?.bookingDate
                ? new Date(booking.bookingDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                : '—'}
            </p>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface block">Chọn ngày mới</label>
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(e) => { setSelectedDate(e.target.value); setError(''); }}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md [color-scheme:dark]"
            />
          </div>

          {/* Time Slot Chips */}
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface block">Chọn giờ</label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm py-2">
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                Đang tải khung giờ...
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-on-surface-variant font-body-sm text-body-sm italic py-2">
                Không có khung giờ trống cho ngày này.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  const isUnavailable = !slot.available;
                  return (
                    <button
                      key={slot.time}
                      disabled={isUnavailable}
                      onClick={() => { if (!isUnavailable) { setSelectedTimeSlot(slot.time); setError(''); } }}
                      title={isUnavailable ? (slot.reason || 'Không khả dụng') : slot.time}
                      className={`py-2 px-3 rounded-lg text-center font-label-md text-label-md transition-all duration-200
                        ${isUnavailable
                          ? 'border border-outline-variant text-on-surface-variant opacity-35 cursor-not-allowed'
                          : isSelected
                            ? 'bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(233,193,118,0.35)] scale-105'
                            : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary active:scale-95 cursor-pointer'
                        }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface block" htmlFor="reschedule-note">
              Ghi chú (Tùy chọn)
            </label>
            <textarea
              id="reschedule-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do đổi lịch..."
              rows={2}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md resize-none"
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 text-error font-body-sm text-body-sm bg-error/10 rounded-xl px-4 py-2 border border-error/30">
              <span className="material-symbols-outlined text-sm">error</span> {error}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 text-green-400 font-body-sm text-body-sm bg-green-500/10 rounded-xl px-4 py-2 border border-green-500/30">
              <span className="material-symbols-outlined text-sm">check_circle</span> {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-container-high px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl border-2 border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-bright hover:border-surface-bright transition-all active:scale-95 duration-200 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedTimeSlot || loadingSlots}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:opacity-90 transition-all active:scale-95 duration-200 shadow-[0_4px_14px_rgba(233,193,118,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   CustomerChangeSchedule — main page component
   ───────────────────────────────────────────── */
const CustomerChangeSchedule = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!bookingId);
  const [fetchError, setFetchError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch booking data client-side so auth cookies are sent correctly
  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await bookingService.getBookingById(bookingId);
        // Backend có thể wrap trong { booking } hoặc trả thẳng
        const bk = data?.booking || data;
        setBooking(bk);
        setIsModalOpen(true); // auto-open modal once data loads
      } catch (err) {
        setFetchError(err.message || 'Không thể tải thông tin lịch hẹn.');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const handleRescheduleSuccess = (updatedBooking) => {
    setBooking(updatedBooking);
    setIsModalOpen(false);
  };

  const serviceName = booking?.services?.map(s => s.name || s).join(', ') || 'Dịch vụ';
  const barberName = booking?.barberId?.userId?.name || booking?.barberId?.name || 'Thợ cắt';
  const bookingDateDisplay = booking?.bookingDate
    ? new Date(booking.bookingDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : '—';

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary dark">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary tracking-tighter">
            HALLO BARBER
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/">Dịch vụ</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/shop">Cửa hàng</Link>
            <Link className="text-primary border-b-2 border-primary pb-1 font-label-md text-label-md" href="/booking">Đặt lịch</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/gallery">Thư viện</Link>
          </div>
          <Link href="/customer/dashboard" className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">account_circle</span>
            Tài khoản
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className={`flex-grow pt-28 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full transition-all duration-500 ${isModalOpen ? 'filter blur-sm pointer-events-none' : ''}`}>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-8"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại
        </button>

        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-l-4 border-primary pl-4">
            Lịch hẹn sắp tới
          </h2>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 text-on-surface-variant font-body-md text-body-md py-10">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Đang tải thông tin lịch hẹn...
            </div>
          )}

          {/* Error state */}
          {!loading && fetchError && (
            <div className="flex items-center gap-2 text-error font-body-md text-body-md bg-error/10 rounded-xl px-4 py-3 border border-error/30">
              <span className="material-symbols-outlined text-sm">error</span> {fetchError}
            </div>
          )}

          {/* No booking ID provided */}
          {!loading && !fetchError && !bookingId && (
            <p className="text-on-surface-variant font-body-md text-body-md">
              Không tìm thấy thông tin lịch hẹn. Vui lòng quay lại trang hồ sơ.
            </p>
          )}

          {/* Booking card */}
          {!loading && !fetchError && booking && (
            <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-outline-variant shrink-0 bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">content_cut</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-1">{serviceName}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {bookingDateDisplay}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Barber: {barberName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-md text-label-md hover:border-primary hover:text-primary transition-all duration-200"
              >
                Đổi lịch
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {isModalOpen && booking && (
        <RescheduleModal
          booking={booking}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
          background: rgba(32, 31, 31, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(78, 70, 57, 0.5);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default CustomerChangeSchedule;