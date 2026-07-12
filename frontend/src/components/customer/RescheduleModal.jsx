'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '@/services/booking.service';

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
            ) : availableSlots.filter(s => s.available).length === 0 ? (
              <p className="text-on-surface-variant font-body-sm text-body-sm italic py-2">
                Không có khung giờ trống cho ngày này.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.filter(s => s.available).map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => { setSelectedTimeSlot(slot.time); setError(''); }}
                      title={slot.time}
                      className={`py-2 px-3 rounded-lg text-center font-label-md text-label-md transition-all duration-200
                        ${isSelected
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default RescheduleModal;
