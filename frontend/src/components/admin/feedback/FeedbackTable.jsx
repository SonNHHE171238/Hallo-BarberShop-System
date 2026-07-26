"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function FeedbackTable({ feedbacks = [], page = 1, totalPages = 1, total = 0, onPageChange, error, onDelete, onView }) {
  const { user } = useAuth();

  return (
    <>
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-surface-container-high border-b border-outline-variant/30">
            <tr>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Khách Hàng</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Mã Booking</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Đánh Giá</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider">Ngày Tạo</th>
              <th className="px-6 py-4 font-label-md text-xs text-primary uppercase tracking-wider text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                  Chưa có đánh giá nào.
                </td>
              </tr>
            ) : (
              feedbacks.map((fb) => {
                const dateObj = new Date(fb.createdAt);
                const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
                
                const customerName = fb.bookingId?.customerName || "Khách Vãng Lai";
                const customerPhone = fb.bookingId?.customerPhone || "N/A";
                const bookingType = fb.bookingId?.bookingType || 'guest';
                const isMember = bookingType === 'user';
                
                const bookingCode = fb.bookingId?._id ? fb.bookingId._id.slice(-6).toUpperCase() : "N/A";
                
                return (
                  <tr key={fb._id} className="table-row-hover group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{customerName}</span>
                        <span className="text-xs text-on-surface-variant mb-1">{customerPhone}</span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${isMember ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'}`}>
                          {isMember ? 'Thành Viên' : 'Khách Vãng Lai'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm tracking-wider font-bold text-on-surface-variant">#{bookingCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gold-dim">{fb.rating}</span>
                        <span className="material-symbols-outlined text-[16px] text-gold-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                      {fb.comment && (
                        <p className="text-xs text-on-surface-variant italic mt-1 line-clamp-2 max-w-[250px]" title={fb.comment}>
                          "{fb.comment}"
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-label-md text-on-surface-variant">{formattedDate}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onView && onView(fb)} className="p-1.5 rounded hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-all" title="Xem chi tiết lịch hẹn">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-8 px-2">
          <p className="text-sm text-on-surface-variant">Hiển thị {feedbacks.length} / {total} đánh giá</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded border border-primary bg-primary/10 text-primary font-bold">{page}</button>
            <button 
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
