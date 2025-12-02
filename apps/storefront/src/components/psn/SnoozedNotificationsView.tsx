'use client'

import React from 'react';
import { Clock, Bell, X, Calendar } from 'lucide-react';
import { useNotificationSnooze } from '@/hooks/useNotificationSnooze';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface SnoozedNotificationsViewProps {
  onNotificationClick?: (notificationId: string) => void;
}

export default function SnoozedNotificationsView({ onNotificationClick }: SnoozedNotificationsViewProps) {
  const {
    snoozedNotifications,
    isLoading,
    unsnoozeNotification,
    getTimeUntilUnsnooze,
    snoozedCount
  } = useNotificationSnooze();

  const handleUnsnooze = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unsnoozeNotification(notificationId);
    } catch (error) {
      console.error('Failed to unsnooze:', error);
    }
  };

  const formatSnoozeTime = (snoozeUntil: string) => {
    const date = new Date(snoozeUntil);
    const now = new Date();

    if (date < now) {
      return 'Ready to show';
    }

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupBySnoozeDate = () => {
    const grouped = new Map<string, typeof snoozedNotifications>();

    snoozedNotifications.forEach(snoozed => {
      const date = new Date(snoozed.snooze_until);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let groupKey: string;
      if (date < today) {
        groupKey = 'overdue';
      } else if (date.toDateString() === today.toDateString()) {
        groupKey = 'today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        groupKey = 'tomorrow';
      } else if (date < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'thisWeek';
      } else {
        groupKey = 'later';
      }

      const existing = grouped.get(groupKey) || [];
      grouped.set(groupKey, [...existing, snoozed]);
    });

    return grouped;
  };

  const groupLabels = {
    overdue: 'Ready to Show',
    today: 'Later Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    later: 'Later'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (snoozedNotifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
        <p className="dark:text-gray-400 light:text-gray-600 text-sm">
          No snoozed notifications
        </p>
        <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-2">
          Snoozed notifications will appear here until they&apos;re ready to show again
        </p>
      </div>
    );
  }

  const groupedNotifications = groupBySnoozeDate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#F4A024]" />
          <div>
            <h3 className="text-sm font-medium dark:text-gray-100 light:text-gray-900">
              Snoozed Notifications
            </h3>
            <p className="text-xs dark:text-gray-400 light:text-gray-600">
              {snoozedCount} {snoozedCount === 1 ? 'notification' : 'notifications'} snoozed
            </p>
          </div>
        </div>
      </div>

      {Array.from(groupedNotifications.entries()).map(([groupKey, notifications]) => (
        <div key={groupKey}>
          <h4 className="text-xs font-semibold dark:text-gray-400 light:text-gray-600 uppercase tracking-wide mb-2 px-1">
            {groupLabels[groupKey as keyof typeof groupLabels]}
          </h4>
          <div className="space-y-2">
            {notifications
              .sort((a, b) => new Date(a.snooze_until).getTime() - new Date(b.snooze_until).getTime())
              .map((snoozed) => {
                const timeUntil = getTimeUntilUnsnooze(snoozed.snooze_until);
                const isOverdue = new Date(snoozed.snooze_until) < new Date();

                return (
                  <div
                    key={snoozed.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isOverdue
                        ? 'dark:border-[#F4A024]/40 light:border-[#F4A024]/40 dark:bg-[#F4A024]/5 light:bg-[#F4A024]/5'
                        : 'dark:border-gray-700 light:border-gray-200 dark:bg-gray-800/30 light:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isOverdue ? 'bg-[#F4A024]/20' : 'dark:bg-gray-700 light:bg-gray-200'
                      }`}>
                        {isOverdue ? (
                          <Bell className="w-4 h-4 text-[#F4A024]" />
                        ) : (
                          <Clock className="w-4 h-4 dark:text-gray-400 light:text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium dark:text-gray-100 light:text-gray-900">
                              Notification snoozed
                            </p>
                            {snoozed.reason && (
                              <p className="text-xs dark:text-gray-400 light:text-gray-600 mt-0.5">
                                Reason: {snoozed.reason}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleUnsnooze(snoozed.notification_id, e)}
                            className="p-1.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
                            title="Unsnooze now"
                          >
                            <X className="w-4 h-4 dark:text-gray-400 light:text-gray-600" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 dark:text-gray-400 light:text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>Until {formatSnoozeTime(snoozed.snooze_until)}</span>
                          </div>
                          <div className={`px-2 py-0.5 rounded-full ${
                            isOverdue
                              ? 'bg-[#F4A024] text-gray-900'
                              : 'dark:bg-gray-700 light:bg-gray-200 dark:text-gray-300 light:text-gray-700'
                          }`}>
                            {timeUntil}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t dark:border-gray-700 light:border-gray-200">
                          <button
                            onClick={() => {
                              unsnoozeNotification(snoozed.notification_id);
                              onNotificationClick?.(snoozed.notification_id);
                            }}
                            className="text-xs text-[#F4A024] hover:text-[#F4A024]/80 transition-colors font-medium"
                          >
                            View notification now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
