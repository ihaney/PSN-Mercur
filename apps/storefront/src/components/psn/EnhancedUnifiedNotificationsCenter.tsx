'use client'

import React, { useState, useEffect } from 'react';
import { Bell, Search, Layers, Clock, Settings, X, Filter } from 'lucide-react';
import { notificationSoundManager, showDesktopNotification } from '@/lib/notificationSound';
import AdvancedNotificationSearch from './AdvancedNotificationSearch';
import NotificationGroupsPanel from './NotificationGroupsPanel';
import SnoozedNotificationsView from './SnoozedNotificationsView';
import NotificationSnoozeModal from './NotificationSnoozeModal';
import toast from 'react-hot-toast';

interface EnhancedUnifiedNotificationsCenterProps {
  onClose?: () => void;
}

type ViewMode = 'all' | 'search' | 'groups' | 'snoozed';

export default function EnhancedUnifiedNotificationsCenter({
  onClose
}: EnhancedUnifiedNotificationsCenterProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    initializeNotifications();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const initializeNotifications = async () => {
    await notificationSoundManager.initialize();
    await loadNotifications();
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) return;

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          async (payload) => {
            const newNotification = payload.new;

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            await notificationSoundManager.playNotificationSound(
              newNotification.notification_type
            );

            await showDesktopNotification(
              newNotification.title,
              newNotification.message,
              newNotification.notification_type,
              undefined,
              () => {
                handleNotificationClick(newNotification.id);
              }
            );

            await trackNotificationDelivery(newNotification.id, 'in_app');
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            setNotifications(prev =>
              prev.map(n => (n.id === payload.new.id ? payload.new : n))
            );
            if (payload.new.is_read !== payload.old?.is_read) {
              setUnreadCount(prev => payload.new.is_read ? prev - 1 : prev + 1);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeConnected(true);
            console.log('Real-time notifications connected');
          } else if (status === 'CHANNEL_ERROR') {
            setRealtimeConnected(false);
            console.error('Real-time subscription error');
          }
        });
    } catch (error) {
      console.error('Failed to setup real-time subscription:', error);
    }
  };

  const trackNotificationDelivery = async (
    notificationId: string,
    channel: string
  ) => {
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) return;

      await supabase.rpc('track_notification_delivery', {
        p_notification_id: notificationId,
        p_user_id: session.user.id,
        p_delivery_channel: channel,
        p_delivery_status: 'delivered'
      });
    } catch (error) {
      console.error('Failed to track delivery:', error);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      await supabase.rpc('track_notification_interaction', {
        p_notification_id: notificationId,
        p_user_id: session.user.id,
        p_interaction_type: 'clicked'
      });

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleSnooze = (notificationId: string) => {
    setSelectedNotificationId(notificationId);
    setSnoozeModalOpen(true);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
      <div className="dark:bg-gray-900 light:bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="sticky top-0 dark:bg-gray-900 light:bg-white p-6 border-b dark:border-gray-700 light:border-gray-200 rounded-t-xl z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-[#F4A024]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900">
                  Notifications
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      realtimeConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-xs dark:text-gray-400 light:text-gray-600">
                    {realtimeConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="dark:text-gray-400 light:text-gray-600 hover:text-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'all'
                  ? 'bg-[#F4A024] text-gray-900'
                  : 'dark:bg-gray-800 light:bg-gray-100 dark:text-gray-300 light:text-gray-700'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              All ({notifications.length})
            </button>
            <button
              onClick={() => setViewMode('search')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'search'
                  ? 'bg-[#F4A024] text-gray-900'
                  : 'dark:bg-gray-800 light:bg-gray-100 dark:text-gray-300 light:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'groups'
                  ? 'bg-[#F4A024] text-gray-900'
                  : 'dark:bg-gray-800 light:bg-gray-100 dark:text-gray-300 light:text-gray-700'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-2" />
              Groups
            </button>
            <button
              onClick={() => setViewMode('snoozed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'snoozed'
                  ? 'bg-[#F4A024] text-gray-900'
                  : 'dark:bg-gray-800 light:bg-gray-100 dark:text-gray-300 light:text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Snoozed
            </button>
          </div>

          {viewMode === 'all' && unreadCount > 0 && (
            <div className="mt-3">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#F4A024] hover:text-[#F4A024]/80 transition-colors font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {viewMode === 'all' && (
            <div className="space-y-2">
              {loading ? (
                <p className="text-center dark:text-gray-400 light:text-gray-600 py-8">
                  Loading notifications...
                </p>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
                  <p className="dark:text-gray-400 light:text-gray-600">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      notification.is_read
                        ? 'dark:bg-gray-800/30 light:bg-gray-50'
                        : 'dark:bg-[#F4A024]/10 light:bg-[#F4A024]/10 dark:border-[#F4A024]/40 light:border-[#F4A024]/40 border'
                    } hover:opacity-80`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={`text-sm font-medium ${
                          notification.is_read
                            ? 'dark:text-gray-300 light:text-gray-700'
                            : 'dark:text-white light:text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-[#F4A024] rounded-full flex-shrink-0 ml-2 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm dark:text-gray-400 light:text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs dark:text-gray-500 light:text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnooze(notification.id);
                        }}
                        className="text-xs text-[#F4A024] hover:text-[#F4A024]/80 transition-colors"
                      >
                        Snooze
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {viewMode === 'search' && (
            <AdvancedNotificationSearch onResultClick={handleNotificationClick} compact />
          )}

          {viewMode === 'groups' && <NotificationGroupsPanel onNotificationClick={handleNotificationClick} />}

          {viewMode === 'snoozed' && <SnoozedNotificationsView onNotificationClick={handleNotificationClick} />}
        </div>
      </div>

      {snoozeModalOpen && selectedNotificationId && (
        <NotificationSnoozeModal
          notificationId={selectedNotificationId}
          onClose={() => {
            setSnoozeModalOpen(false);
            setSelectedNotificationId(null);
          }}
        />
      )}
    </div>
  );
}
