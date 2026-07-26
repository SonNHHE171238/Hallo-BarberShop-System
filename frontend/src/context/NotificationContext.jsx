"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { notificationService } from '@/services/notification.service';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  fetchNotifications: () => {}
});

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('new_notification', (notification) => {
        console.log('🔔 NHẬN ĐƯỢC NOTI TỪ SERVER:', notification);
        // Show toast
        toast(
          (t) => (
            <div className="flex flex-col cursor-pointer" onClick={() => {
              if (notification.link) window.location.href = notification.link;
              toast.dismiss(t.id);
            }}>
              <span className="font-bold text-sm text-primary-400">{notification.title}</span>
              <span className="text-xs mt-1 text-gray-300">{notification.message}</span>
            </div>
          ),
          {
            duration: 5000,
            icon: '🔔',
          }
        );

        // Update state
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
