'use client'

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Save, AlertCircle } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/usePriceDropAlerts';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DROP_THRESHOLDS = [
  { value: 5, label: '5% or more' },
  { value: 10, label: '10% or more' },
  { value: 15, label: '15% or more' },
  { value: 20, label: '20% or more' },
  { value: 25, label: '25% or more' }
];

export default function WeeklyNotificationPreferences() {
  const { data: preferences, isLoading, updatePreferences } = useNotificationPreferences();
  const [enabled, setEnabled] = useState(true);
  const [minimumDrop, setMinimumDrop] = useState(5);
  const [preferredDay, setPreferredDay] = useState('Monday');
  const [preferredTime, setPreferredTime] = useState('08:00');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setEnabled(preferences.enabled);
      setMinimumDrop(preferences.minimum_drop_percentage);
      setPreferredDay(preferences.preferred_day);
      setPreferredTime(preferences.preferred_time);
    }
  }, [preferences]);

  useEffect(() => {
    if (preferences) {
      const changed =
        enabled !== preferences.enabled ||
        minimumDrop !== preferences.minimum_drop_percentage ||
        preferredDay !== preferences.preferred_day ||
        preferredTime !== preferences.preferred_time;
      setHasChanges(changed);
    }
  }, [enabled, minimumDrop, preferredDay, preferredTime, preferences]);

  const handleSave = async () => {
    try {
      await updatePreferences.mutateAsync({
        enabled,
        minimum_drop_percentage: minimumDrop,
        preferred_day: preferredDay,
        preferred_time: preferredTime
      });

      toast.success('Notification preferences saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="card-glow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-6 h-6 text-[#F4A024]" />
          ) : (
            <BellOff className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900">
              Weekly Price Drop Alerts
            </h2>
            <p className="text-sm dark:text-gray-400 light:text-gray-600">
              Get notified when prices drop on your saved items
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F4A024]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4A024]"></div>
        </label>
      </div>

      {enabled && (
        <div className="space-y-6">
          <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm dark:text-blue-300 light:text-blue-700">
              You&apos;ll receive a consolidated email digest once a week with all price drops on your saved items.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
              Minimum Price Drop
            </label>
            <select
              value={minimumDrop}
              onChange={(e) => setMinimumDrop(Number(e.target.value))}
              className="w-full px-4 py-2 dark:bg-gray-800 light:bg-white border dark:border-gray-700 light:border-gray-300 rounded-lg dark:text-gray-100 light:text-gray-900 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
            >
              {DROP_THRESHOLDS.map(threshold => (
                <option key={threshold.value} value={threshold.value}>
                  {threshold.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs dark:text-gray-400 light:text-gray-600">
              Only notify me when prices drop by at least this percentage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
                Preferred Day
              </label>
              <select
                value={preferredDay}
                onChange={(e) => setPreferredDay(e.target.value)}
                className="w-full px-4 py-2 dark:bg-gray-800 light:bg-white border dark:border-gray-700 light:border-gray-300 rounded-lg dark:text-gray-100 light:text-gray-900 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
                Preferred Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-2 dark:bg-gray-800 light:bg-white border dark:border-gray-700 light:border-gray-300 rounded-lg dark:text-gray-100 light:text-gray-900 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
              />
            </div>
          </div>

          {preferences?.last_sent_at && (
            <div className="p-4 dark:bg-gray-800/50 light:bg-gray-100 rounded-lg">
              <p className="text-sm dark:text-gray-400 light:text-gray-600">
                Last notification sent:{' '}
                <span className="dark:text-gray-300 light:text-gray-700 font-medium">
                  {new Date(preferences.last_sent_at).toLocaleDateString()} at{' '}
                  {new Date(preferences.last_sent_at).toLocaleTimeString()}
                </span>
              </p>
            </div>
          )}

          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={updatePreferences.isPending}
              className="w-full flex items-center justify-center gap-2 bg-[#F4A024] text-gray-900 px-6 py-3 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatePreferences.isPending ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
