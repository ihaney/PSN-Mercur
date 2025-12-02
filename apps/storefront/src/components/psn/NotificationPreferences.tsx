'use client'

import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { getCurrentUser } from '@/lib/data/user-actions';
import { createClientSupabaseClient } from '@/lib/supabase-client';

interface NotificationPrefs {
  email_notifications: boolean;
  push_notifications: boolean;
  message_notifications: boolean;
  supplier_updates: boolean;
}

export default function NotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    email_notifications: true,
    push_notifications: false,
    message_notifications: true,
    supplier_updates: true
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const supabase = createClientSupabaseClient();
      if (!supabase) {
        console.error('Supabase not configured');
        return;
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          message_notifications: data.message_notifications,
          supplier_updates: data.supplier_updates
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: keyof NotificationPrefs) => {
    const newValue = !preferences[field];

    setPreferences(prev => ({
      ...prev,
      [field]: newValue
    }));

    setSaving(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('Please sign in to update preferences');
        return;
      }

      const supabase = createClientSupabaseClient();
      if (!supabase) {
        toast.error('Service unavailable');
        return;
      }

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          [field]: newValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Notification preference updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update preference');

      setPreferences(prev => ({
        ...prev,
        [field]: !newValue
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const notificationOptions = [
    {
      key: 'email_notifications' as keyof NotificationPrefs,
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive notifications via email for important updates'
    },
    {
      key: 'push_notifications' as keyof NotificationPrefs,
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get push notifications in your browser (when available)'
    },
    {
      key: 'message_notifications' as keyof NotificationPrefs,
      icon: MessageSquare,
      title: 'Message Notifications',
      description: 'Be notified when you receive new messages'
    },
    {
      key: 'supplier_updates' as keyof NotificationPrefs,
      icon: Building2,
      title: 'Supplier Updates',
      description: 'Receive updates from suppliers you follow'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold dark:text-gray-100 light:text-gray-900 mb-2">
          Notification Preferences
        </h3>
        <p className="dark:text-gray-400 light:text-gray-600 text-sm">
          Manage how you receive notifications from Paisán
        </p>
      </div>

      <div className="space-y-3">
        {notificationOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = preferences[option.key];

          return (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-lg ${
                  isEnabled
                    ? 'bg-[#F4A024]/10 text-[#F4A024]'
                    : 'dark:bg-gray-700 light:bg-gray-200 dark:text-gray-500 light:text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium dark:text-gray-200 light:text-gray-900">
                    {option.title}
                  </p>
                  <p className="text-sm dark:text-gray-500 light:text-gray-600">
                    {option.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4A024] focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  isEnabled ? 'bg-[#F4A024]' : 'dark:bg-gray-700 light:bg-gray-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {preferences.push_notifications && (
        <div className="mt-4 p-4 dark:bg-blue-900/20 light:bg-blue-50 rounded-lg border dark:border-blue-800 light:border-blue-200">
          <p className="text-sm dark:text-blue-300 light:text-blue-900">
            <span className="font-medium">Note:</span> Push notifications require browser permission.
            You may need to allow notifications in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}
