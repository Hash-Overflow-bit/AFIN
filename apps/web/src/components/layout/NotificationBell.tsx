'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-surface-press-light transition-colors text-ink/70 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent-violet"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface-canvas-light animate-pulse-soft">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-surface-canvas-light border border-hairline-cloud shadow-level-2 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline-cloud bg-surface-press-light/50">
            <h3 className="font-bold text-ink">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[12px] font-medium text-accent-violet hover:text-accent-violet-dark transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-ink/50">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-[14px]">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-hairline-cloud">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                    className={`p-4 cursor-pointer transition-colors ${notif.isRead ? 'opacity-70 hover:bg-surface-press-light/30' : 'bg-surface-press-light/20 hover:bg-surface-press-light'}`}
                  >
                    <div className="flex items-start gap-3">
                      {!notif.isRead && (
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-accent-violet flex-shrink-0"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] ${notif.isRead ? 'text-ink/80' : 'text-ink font-semibold'}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[12px] text-ink/50">
                          <Clock size={12} />
                          <span>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
