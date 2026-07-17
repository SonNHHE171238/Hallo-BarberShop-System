"use client";

import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '@/services/notification.service';
import { useAuth } from '@/context/AuthContext';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      // Log as warning/log instead of error to prevent Next.js dev overlay on token expiration
      console.log("Lỗi lấy thông báo (có thể do token hết hạn):", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-on-surface hover:text-primary transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[24px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-error text-on-error text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-high border border-outline-variant rounded-md shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="px-4 py-3 border-b border-outline-variant bg-surface-container flex justify-between items-center shrink-0">
            <h3 className="font-bold text-on-surface">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-[12px] text-primary hover:underline font-bold">
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-on-surface-variant">Không có thông báo nào</div>
            ) : (
              notifications.map(noti => (
                <div key={noti._id} className={`p-4 border-b border-outline-variant/50 hover:bg-surface-variant transition-colors cursor-pointer relative ${!noti.isRead ? 'bg-primary/5' : ''}`}>
                  {!noti.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"></div>}
                  <div className="pl-4">
                    <p className={`text-sm ${!noti.isRead ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{noti.title}</p>
                    <p className="text-[12px] text-on-surface-variant mt-1 line-clamp-2">{noti.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-on-surface-variant opacity-70">{new Date(noti.createdAt).toLocaleString('vi-VN')}</span>
                      {!noti.isRead && (
                        <button onClick={(e) => handleMarkAsRead(noti._id, e)} className="text-[11px] text-primary hover:underline">
                          Đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
