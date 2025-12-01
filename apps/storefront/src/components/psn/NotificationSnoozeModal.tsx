'use client'

import React, { useState } from 'react';
import { X, Clock, MessageSquare } from 'lucide-react';
import { useNotificationSnooze } from '@/hooks/useNotificationSnooze';

interface NotificationSnoozeModalProps {
  notificationId: string;
  notificationTitle: string;
  onClose: () => void;
}

export default function NotificationSnoozeModal({
  notificationId,
  notificationTitle,
  onClose
}: NotificationSnoozeModalProps) {
  const { snoozeNotification, snoozeDurations } = useNotificationSnooze();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSnooze = async (minutes: number) => {
    setIsSubmitting(true);
    try {
      await snoozeNotification(notificationId, minutes, reason || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to snooze:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="dark:bg-gray-800 light:bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 light:border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#F4A024]" />
            <h2 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900">
              Snooze Notification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="dark:text-gray-400 light:text-gray-500 hover:text-[#F4A024] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-3 dark:bg-gray-700/50 light:bg-gray-50 rounded-lg">
            <p className="text-sm dark:text-gray-300 light:text-gray-700 line-clamp-2">
              {notificationTitle}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
              Snooze for:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {snoozeDurations.map((duration) => (
                <button
                  key={duration.minutes}
                  onClick={() => handleSnooze(duration.minutes)}
                  disabled={isSubmitting}
                  className="px-4 py-3 text-sm dark:bg-gray-700 light:bg-gray-100 dark:text-gray-200 light:text-gray-700 rounded-lg hover:bg-[#F4A024] hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
              Reason (optional):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you snoozing this notification?"
              rows={2}
              className="w-full px-3 py-2 dark:bg-gray-700 light:bg-gray-50 dark:border-gray-600 light:border-gray-200 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024] resize-none text-sm"
            />
          </div>

          <div className="flex items-start gap-2 p-3 dark:bg-blue-900/20 light:bg-blue-50 rounded-lg">
            <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs dark:text-blue-300 light:text-blue-700">
              The notification will be hidden and reappear after the selected time period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
