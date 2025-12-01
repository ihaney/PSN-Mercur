'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Layers, CheckCheck, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNotificationGroups } from '@/hooks/useNotificationGroups';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface NotificationGroupsPanelProps {
  onNotificationClick?: (notificationId: string) => void;
}

export default function NotificationGroupsPanel({ onNotificationClick }: NotificationGroupsPanelProps) {
  const { groups, isLoading, toggleExpanded, markGroupAsRead, deleteGroup, getGroupedNotifications } = useNotificationGroups();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupNotifications, setGroupNotifications] = useState<Map<string, any[]>>(new Map());
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null);

  const handleToggleGroup = async (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
      setExpandedGroups(newExpanded);
    } else {
      newExpanded.add(groupId);
      setExpandedGroups(newExpanded);

      if (!groupNotifications.has(groupId)) {
        setLoadingGroup(groupId);
        try {
          const notifications = await getGroupedNotifications(groupId);
          setGroupNotifications(new Map(groupNotifications.set(groupId, notifications)));
        } catch (error) {
          console.error('Failed to load group notifications:', error);
          toast.error('Failed to load notifications');
        } finally {
          setLoadingGroup(null);
        }
      }
    }

    try {
      await toggleExpanded(groupId);
    } catch (error) {
      console.error('Failed to toggle group:', error);
    }
  };

  const handleMarkGroupAsRead = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markGroupAsRead(groupId);
      toast.success('Group marked as read');
    } catch (error) {
      console.error('Failed to mark group as read:', error);
      toast.error('Failed to mark group as read');
    }
  };

  const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this notification group? Individual notifications will not be deleted.')) return;

    try {
      await deleteGroup(groupId);
      toast.success('Group deleted');
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast.error('Failed to delete group');
    }
  };

  const getGroupIcon = (groupType: string) => {
    switch (groupType) {
      case 'sender':
        return '👤';
      case 'type':
        return '🏷️';
      case 'product':
        return '📦';
      case 'order':
        return '🛒';
      case 'time':
        return '⏰';
      default:
        return '📁';
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
        <p className="dark:text-gray-400 light:text-gray-600 text-sm">
          No notification groups yet
        </p>
        <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-2">
          Related notifications will automatically group together
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.id);
        const notifications = groupNotifications.get(group.id) || [];

        return (
          <div
            key={group.id}
            className={`rounded-lg border transition-all ${
              group.is_read
                ? 'dark:border-gray-700 light:border-gray-200 dark:bg-gray-800/30 light:bg-gray-50'
                : 'dark:border-[#F4A024]/40 light:border-[#F4A024]/40 dark:bg-[#F4A024]/5 light:bg-[#F4A024]/5'
            }`}
          >
            <button
              onClick={() => handleToggleGroup(group.id)}
              className="w-full p-4 flex items-start gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex-shrink-0 mt-0.5">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 dark:text-gray-400 light:text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 dark:text-gray-400 light:text-gray-600" />
                )}
              </div>

              <div className="text-2xl flex-shrink-0">
                {getGroupIcon(group.group_type)}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium truncate ${
                    group.is_read ? 'dark:text-gray-300 light:text-gray-700' : 'dark:text-white light:text-gray-900'
                  }`}>
                    {group.title}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ml-2 ${
                    group.is_read
                      ? 'dark:bg-gray-700 light:bg-gray-200 dark:text-gray-400 light:text-gray-600'
                      : 'bg-[#F4A024] text-gray-900'
                  }`}>
                    {group.notification_count}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs dark:text-gray-400 light:text-gray-600">
                  <span className="capitalize">{group.group_type}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(group.updated_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {!group.is_read && (
                  <button
                    onClick={(e) => handleMarkGroupAsRead(group.id, e)}
                    className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4 dark:text-gray-400 light:text-gray-600" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteGroup(group.id, e)}
                  className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                  title="Delete group"
                >
                  <Trash2 className="w-4 h-4 dark:text-gray-400 light:text-gray-600" />
                </button>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t dark:border-gray-700 light:border-gray-200 p-2">
                {loadingGroup === group.id ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm dark:text-gray-400 light:text-gray-600 text-center py-4">
                    No notifications in this group
                  </p>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification: any) => (
                      <button
                        key={notification.id}
                        onClick={() => onNotificationClick?.(notification.id)}
                        className="w-full text-left p-3 rounded-lg dark:bg-gray-900/50 light:bg-white dark:hover:bg-gray-700/50 light:hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium dark:text-gray-200 light:text-gray-800 line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-[#F4A024] rounded-full flex-shrink-0 ml-2 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs dark:text-gray-400 light:text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
