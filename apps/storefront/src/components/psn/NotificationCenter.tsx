'use client'

import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Archive, Filter, X, Mail, MessageSquare, AlertCircle, Info, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSnooze } from '@/hooks/useNotificationSnooze';
import { useNotificationGroups } from '@/hooks/useNotificationGroups';
import { useNotificationDelivery } from '@/hooks/useNotificationDelivery';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, archive, delete: deleteNotification } = useNotifications({
    read: filter === 'unread' ? false : filter === 'archived' ? undefined : undefined,
    archived: filter === 'archived' ? true : false,
  });

  const { isSnoozed, getTimeUntilUnsnooze, unsnoozeNotification } = useNotificationSnooze();
  const { groups } = useNotificationGroups();
  const { trackDelivery, trackInteraction } = useNotificationDelivery(selectedNotificationId || undefined);

  const filteredNotifications = notifications.filter(n => {
    if (typeFilter !== 'all' && n.notification_type !== typeFilter) return false;
    return true;
  });

  const handleNotificationClick = (notification: any) => {
    setSelectedNotificationId(notification.id);
    trackDelivery(notification.id);
    trackInteraction('click', notification.id);
    
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleArchive = (id: string) => {
    archive(id);
    toast.success('Notification archived');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      deleteNotification(id);
      toast.success('Notification deleted');
    }
  };

  const handleUnsnooze = (id: string) => {
    unsnoozeNotification(id);
    toast.success('Notification unsnoozed');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'order':
        return <Mail className="w-4 h-4" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#F4A024] text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#F4A024] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-[#F4A024] text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-[#F4A024] text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filter === 'archived'
                    ? 'bg-[#F4A024] text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Archived
              </button>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#F4A024]"
            >
              <option value="all">All Types</option>
              <option value="message">Messages</option>
              <option value="order">Orders</option>
              <option value="alert">Alerts</option>
            </select>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredNotifications.map((notification) => {
                  const isSnoozedNotification = isSnoozed(notification.id);
                  const snoozeInfo = getTimeUntilUnsnooze(notification.id);

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-700 transition-colors ${
                        !notification.read_at ? 'bg-gray-700/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#F4A024]">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-white">
                              {notification.title}
                            </h4>
                            {!notification.read_at && (
                              <span className="flex-shrink-0 w-2 h-2 bg-[#F4A024] rounded-full mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                            {isSnoozedNotification && snoozeInfo && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Snoozed until {snoozeInfo.toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
                        {!notification.read_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-gray-400 hover:text-[#F4A024] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                        {isSnoozedNotification && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsnooze(notification.id);
                            }}
                            className="text-xs text-gray-400 hover:text-[#F4A024] flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            Unsnooze
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(notification.id);
                          }}
                          className="text-xs text-gray-400 hover:text-[#F4A024] flex items-center gap-1 ml-auto"
                        >
                          <Archive className="w-3 h-3" />
                          Archive
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
