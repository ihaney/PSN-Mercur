'use client'

import React, { useState, useEffect } from 'react';
import {
  Bell, Mail, MessageSquare, Building2, AlertCircle, Megaphone,
  Clock, Moon, Sun, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface ExtendedNotificationPrefs {
  email_notifications: boolean;
  push_notifications: boolean;
  message_notifications: boolean;
  supplier_updates: boolean;
  new_message_email: boolean;
  new_message_push: boolean;
  read_receipt_notification: boolean;
  inquiry_received_notification: boolean;
  response_received_notification: boolean;
  system_alert_notification: boolean;
  promotional_notification: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  email_digest_frequency: 'none' | 'daily' | 'weekly';
  email_digest_time: string;
}

export default function EnhancedNotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<ExtendedNotificationPrefs>({
    email_notifications: true,
    push_notifications: false,
    message_notifications: true,
    supplier_updates: true,
    new_message_email: true,
    new_message_push: true,
    read_receipt_notification: false,
    inquiry_received_notification: true,
    response_received_notification: true,
    system_alert_notification: true,
    promotional_notification: false,
    quiet_hours_start: null,
    quiet_hours_end: null,
    email_digest_frequency: 'none',
    email_digest_time: '09:00:00'
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (updates: Partial<ExtendedNotificationPrefs>) => {
    setSaving(true);
    try {
      const { data: { user } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getUser();
      if (!user) {
        toast.error('Please sign in to update preferences');
        return;
      }

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...updates }));
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field: keyof ExtendedNotificationPrefs) => {
    const newValue = !preferences[field];
    updatePreference({ [field]: newValue } as any);
  };

  const handleTimeChange = (field: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    updatePreference({ [field]: value || null } as any);
  };

  const handleDigestChange = (frequency: 'none' | 'daily' | 'weekly') => {
    updatePreference({ email_digest_frequency: frequency });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold dark:text-gray-100 light:text-gray-900 mb-2">
          Notification Settings
        </h2>
        <p className="dark:text-gray-400 light:text-gray-600">
          Customize how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#F4A024]" />
            Message Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: 'new_message_email', label: 'Email for New Messages', icon: Mail },
              { key: 'new_message_push', label: 'Push for New Messages', icon: Bell },
              { key: 'read_receipt_notification', label: 'Notify When Message is Read', icon: MessageSquare },
              { key: 'inquiry_received_notification', label: 'Inquiry Notifications (Suppliers)', icon: Mail },
              { key: 'response_received_notification', label: 'Response Notifications (Members)', icon: MessageSquare }
            ].map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 dark:text-gray-400 light:text-gray-500" />
                  <span className="dark:text-gray-200 light:text-gray-900">{label}</span>
                </div>
                <button
                  onClick={() => handleToggle(key as keyof ExtendedNotificationPrefs)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences[key as keyof ExtendedNotificationPrefs]
                      ? 'bg-[#F4A024]'
                      : 'dark:bg-gray-700 light:bg-gray-300'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[key as keyof ExtendedNotificationPrefs] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#F4A024]" />
            Other Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: 'system_alert_notification', label: 'System Alerts', icon: AlertCircle },
              { key: 'supplier_updates', label: 'Supplier Updates', icon: Building2 },
              { key: 'promotional_notification', label: 'Promotional Content', icon: Megaphone }
            ].map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 dark:text-gray-400 light:text-gray-500" />
                  <span className="dark:text-gray-200 light:text-gray-900">{label}</span>
                </div>
                <button
                  onClick={() => handleToggle(key as keyof ExtendedNotificationPrefs)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences[key as keyof ExtendedNotificationPrefs]
                      ? 'bg-[#F4A024]'
                      : 'dark:bg-gray-700 light:bg-gray-300'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[key as keyof ExtendedNotificationPrefs] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-[#F4A024]" />
            Quiet Hours
          </h3>
          <div className="p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg space-y-3">
            <p className="text-sm dark:text-gray-400 light:text-gray-600">
              Set a time range when you don't want to receive notifications
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                  className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                  className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#F4A024]" />
            Email Digest
          </h3>
          <div className="p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg space-y-3">
            <p className="text-sm dark:text-gray-400 light:text-gray-600">
              Receive a summary of your notifications instead of individual emails
            </p>
            <div className="space-y-2">
              {[
                { value: 'none', label: 'No Digest - Send individual notifications' },
                { value: 'daily', label: 'Daily Digest - Once per day' },
                { value: 'weekly', label: 'Weekly Digest - Once per week' }
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 p-3 dark:bg-gray-700 light:bg-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <input
                    type="radio"
                    name="digest_frequency"
                    value={value}
                    checked={preferences.email_digest_frequency === value}
                    onChange={() => handleDigestChange(value as any)}
                    className="w-4 h-4 text-[#F4A024] focus:ring-[#F4A024]"
                  />
                  <span className="dark:text-gray-200 light:text-gray-900">{label}</span>
                </label>
              ))}
            </div>

            {preferences.email_digest_frequency !== 'none' && (
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
                  Delivery Time
                </label>
                <input
                  type="time"
                  value={preferences.email_digest_time}
                  onChange={(e) => updatePreference({ email_digest_time: e.target.value })}
                  className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {preferences.push_notifications && (
        <div className="p-4 dark:bg-blue-900/20 light:bg-blue-50 rounded-lg border dark:border-blue-800 light:border-blue-200">
          <p className="text-sm dark:text-blue-300 light:text-blue-900">
            <span className="font-medium">Note:</span> Push notifications require browser permission.
            You may need to allow notifications in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}
