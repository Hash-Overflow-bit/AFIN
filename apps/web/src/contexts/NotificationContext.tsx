'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi, Notification } from '@/lib/api/notifications';
import toast, { Toaster } from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (showToast = true) => {
    if (!user) return;
    try {
      const data = await notificationsApi.getNotifications();
      const currentUnread = data.filter((n: Notification) => !n.isRead);
      
      // If we already had notifications, and the new unread count is higher,
      // it means we got new notifications! Let's pop a toast for the newest ones.
      setNotifications((prev) => {
        if (showToast && prev.length > 0) {
          const newItems = currentUnread.filter(
            (newN: Notification) => !prev.some((oldN) => oldN.id === newN.id)
          );
          newItems.forEach((item: Notification) => {
            toast(item.message, {
              icon: '🔔',
              duration: 5000,
              style: {
                borderRadius: '8px',
                background: '#1F2937',
                color: '#F9FAFB',
              },
            });
          });
        }
        return data;
      });
      
      setUnreadCount(currentUnread.length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    // Initial fetch without popping toasts for existing unread
    fetchNotifications(false);

    if (user) {
      // Poll every 15 seconds
      const interval = setInterval(() => fetchNotifications(true), 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refresh: () => fetchNotifications(false)
    }}>
      {children}
      <Toaster position="top-right" />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
