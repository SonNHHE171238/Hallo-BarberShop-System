import React from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function BookingHistoryCard({ 
  booking, 
  onCancel, 
  onRebook, 
  onReview,
  hideActions = false,
  disableHover = false,
  isGuest = false,
  guestPhone = ""
}) {
  const isPending = booking.status === "pending" || booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled" || booking.status === "no_show" || booking.status === "rejected";

  // Services
  const serviceName = booking.serviceId?.name || (booking.services && booking.services.length > 0 ? booking.services.map(s => s.name).join(", ") : "N/A");
  const price = booking.serviceId?.price || booking.totalPrice || 0;
  const barberName = booking.barberId?.userId?.name || "Khách Vãng Lai";

  // Format Date & Time
  const dateObj = new Date(booking.bookingDate);
  const dateStr = dateObj.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = booking.timeSlot || `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

  return (
    <div
      className={`bg-surface-container border ${isCancelled ? 'border-outline-variant opacity-80' : 'border-outline-gold hover:border-primary'} p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all duration-300 ease-out ${disableHover ? '' : 'hover:-translate-y-1'}`}
    >
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full">
        <div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Dịch vụ</p>
          <h3 className="font-headline-sm text-headline-sm text-primary">{serviceName}</h3>
        </div>
        <div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Barber</p>
          <p className="font-body-lg text-body-lg text-on-surface">{barberName}</p>
        </div>
        <div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Thời gian</p>
          <p className="font-body-lg text-body-lg text-on-surface">{timeStr}<br />{dateStr}</p>
        </div>
        <div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Giá tiền</p>
          <p className="font-headline-sm text-headline-sm text-on-surface">{price.toLocaleString()}đ</p>
        </div>
        <div>
          <p className="font-label-md text-label-md text-outline uppercase mb-1">Trạng thái</p>
          <div className="flex items-start">
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      {(!hideActions || isGuest) && (
        <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
          {!hideActions && (
            <Link
              href={`/lookup/detail?id=${booking._id}&phone=${booking.customerPhone || booking.customerId?.phone || ''}&source=customer`}
              className="w-full md:w-32 py-3 text-center flex items-center justify-center rounded-lg border border-primary text-primary font-bold text-label-md hover:bg-primary/10 transition-colors uppercase tracking-widest"
            >
              Chi Tiết
            </Link>
          )}
          {!hideActions && isPending && (
            <>
              {onCancel && (
                <button
                  onClick={() => onCancel(booking._id)}
                  className="w-full md:w-32 py-3 rounded-lg border border-error/50 text-error font-bold text-label-md hover:bg-error/10 transition-colors uppercase tracking-widest"
                >
                  Huỷ Lịch
                </button>
              )}
            </>
          )}
          {!hideActions && isCompleted && (
            <>
              {onRebook && (
                <button
                  onClick={onRebook}
                  className="w-full md:w-32 py-3 rounded-lg bg-primary text-on-primary font-bold text-label-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Đặt Lại
                </button>
              )}
              {onReview && (
                booking.isReviewed ? (
                  <div className="w-full md:w-32 py-3 text-center flex items-center justify-center rounded-lg border border-outline text-on-surface-variant font-bold text-label-md cursor-not-allowed uppercase tracking-widest opacity-70 bg-surface-container">
                    Đã Đánh Giá
                  </div>
                ) : (
                  <button
                    onClick={onReview}
                    className="w-full md:w-32 py-3 rounded-lg border border-outline-gold text-on-surface-variant font-bold text-label-md hover:bg-surface-container-high transition-colors uppercase tracking-widest"
                  >
                    Review
                  </button>
                )
              )}
            </>
          )}
          {!hideActions && isCancelled && onRebook && (
            <button
              onClick={onRebook}
              className="w-full md:w-32 py-3 rounded-lg bg-primary text-on-primary font-bold text-label-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest"
            >
              Đặt Lại
            </button>
          )}
          
          {hideActions && isGuest && (
            <>
              {!isCompleted && (
                <Link
                  href={`/lookup/detail?id=${booking._id}&phone=${guestPhone}`}
                  className="w-full md:w-32 py-3 text-center flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-label-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest shadow-md"
                >
                  Chi Tiết
                </Link>
              )}
              {isCompleted && (
                booking.isReviewed ? (
                  <div className="w-full md:w-32 py-3 text-center flex items-center justify-center rounded-lg border border-outline text-on-surface-variant font-bold text-label-md cursor-not-allowed uppercase tracking-widest opacity-70 bg-surface-container">
                    Đã Đánh Giá
                  </div>
                ) : (
                  <Link
                    href={guestPhone ? `/review?phone=${guestPhone}` : "/review"}
                    className="w-full md:w-32 py-3 text-center flex items-center justify-center rounded-lg border border-primary text-primary font-bold text-label-md hover:bg-primary/10 transition-colors uppercase tracking-widest"
                  >
                    Đánh giá
                  </Link>
                )
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
