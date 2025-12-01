'use client'

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, BellOff, Smartphone, Save, RefreshCw } from 'lucide-react';
import { notificationSoundManager, getDesktopNotificationPermissionStatus, requestDesktopNotificationPermission } from '@/lib/notificationSound';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const NOTIFICATION_TYPES = [
  { value: 'message', label: 'Messages' },
  { value: 'order', label: 'Orders' },
  { value: 'payment', label: 'Payments' },
  { value: 'review', label: 'Reviews' },
  { value: 'system', label: 'System' },
  { value: 'alert', label: 'Alerts' }
];

const SOUND_FILES = [
  { value: 'default.mp3', label: 'Default' },
  { value: 'message.mp3', label: 'Message Tone' },
  { value: 'order.mp3', label: 'Order Chime' },
  { value: 'payment.mp3', label: 'Payment Ding' },
  { value: 'success.mp3', label: 'Success' },
  { value: 'alert.mp3', label: 'Alert' }
];

export default function NotificationSoundPreferences() {
  const [preferences, setPreferences] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [desktopPermission, setDesktopPermission] = useState<string>('default');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
    setDesktopPermission(getDesktopNotificationPermissionStatus());
  }, []);

  const loadPreferences = async () => {
    try {
      await notificationSoundManager.initialize();
      const allPrefs = notificationSoundManager.getAllPreferences();
      setPreferences(new Map(allPrefs));
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load sound preferences');
    } finally {
      setLoading(false);
    }
  };

  const getPreference = (type: string, key: string, defaultValue: any) => {
    const pref = preferences.get(type);
    return pref ? pref[key] : defaultValue;
  };

  const updatePreference = (type: string, key: string, value: any) => {
    const current = preferences.get(type) || {
      sound_enabled: true,
      sound_file: 'default.mp3',
      volume: 0.7,
      desktop_notification_enabled: true,
      vibration_enabled: true
    };

    setPreferences(new Map(preferences).set(type, { ...current, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = Array.from(preferences.entries()).map(([type, prefs]) =>
        notificationSoundManager.updateSoundPreferences(type, prefs)
      );

      await Promise.all(updates);
      toast.success('Sound preferences saved');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSound = async (type: string) => {
    try {
      await notificationSoundManager.playNotificationSound(type);
      toast.success('Playing test sound');
    } catch (error) {
      console.error('Failed to play test sound:', error);
      toast.error('Failed to play sound');
    }
  };

  const handleRequestDesktopPermission = async () => {
    try {
      const granted = await requestDesktopNotificationPermission();
      setDesktopPermission(granted ? 'granted' : 'denied');
      if (granted) {
        toast.success('Desktop notifications enabled');
      } else {
        toast.error('Desktop notifications denied');
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      toast.error('Failed to request permission');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900">
            Sound Preferences
          </h2>
          <p className="text-sm dark:text-gray-400 light:text-gray-600 mt-1">
            Customize notification sounds for different types of notifications
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#F4A024]" />
            <div>
              <h3 className="font-medium dark:text-gray-100 light:text-gray-900">
                Desktop Notifications
              </h3>
              <p className="text-sm dark:text-gray-400 light:text-gray-600">
                Show notifications even when the browser is minimized
              </p>
            </div>
          </div>
          {desktopPermission === 'default' && (
            <button
              onClick={handleRequestDesktopPermission}
              className="px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors text-sm font-medium"
            >
              Enable
            </button>
          )}
          {desktopPermission === 'granted' && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              Enabled
            </span>
          )}
          {desktopPermission === 'denied' && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
              Denied
            </span>
          )}
          {desktopPermission === 'unsupported' && (
            <span className="px-3 py-1 bg-gray-500/20 dark:text-gray-400 light:text-gray-600 rounded-full text-sm">
              Not Supported
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_TYPES.map((type) => (
          <div
            key={type.value}
            className="p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium dark:text-gray-100 light:text-gray-900">
                {type.label}
              </h3>
              <button
                onClick={() => handleTestSound(type.value)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm dark:bg-gray-700 light:bg-gray-200 dark:text-gray-200 light:text-gray-700 rounded-lg hover:bg-[#F4A024] hover:text-gray-900 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Test
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm dark:text-gray-300 light:text-gray-700">
                  <Volume2 className="w-4 h-4" />
                  Sound Enabled
                </label>
                <button
                  onClick={() =>
                    updatePreference(
                      type.value,
                      'sound_enabled',
                      !getPreference(type.value, 'sound_enabled', true)
                    )
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    getPreference(type.value, 'sound_enabled', true)
                      ? 'bg-[#F4A024]'
                      : 'dark:bg-gray-600 light:bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      getPreference(type.value, 'sound_enabled', true)
                        ? 'transform translate-x-6'
                        : ''
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm dark:text-gray-300 light:text-gray-700 mb-2">
                  Sound File
                </label>
                <select
                  value={getPreference(type.value, 'sound_file', 'default.mp3')}
                  onChange={(e) => updatePreference(type.value, 'sound_file', e.target.value)}
                  disabled={!getPreference(type.value, 'sound_enabled', true)}
                  className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {SOUND_FILES.map((sound) => (
                    <option key={sound.value} value={sound.value}>
                      {sound.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm dark:text-gray-300 light:text-gray-700 mb-2">
                  <span>Volume</span>
                  <span className="text-[#F4A024] font-medium">
                    {Math.round(getPreference(type.value, 'volume', 0.7) * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={getPreference(type.value, 'volume', 0.7)}
                  onChange={(e) =>
                    updatePreference(type.value, 'volume', parseFloat(e.target.value))
                  }
                  disabled={!getPreference(type.value, 'sound_enabled', true)}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700 light:border-gray-200">
                <label className="flex items-center gap-2 text-sm dark:text-gray-300 light:text-gray-700">
                  <Smartphone className="w-4 h-4" />
                  Vibration
                </label>
                <button
                  onClick={() =>
                    updatePreference(
                      type.value,
                      'vibration_enabled',
                      !getPreference(type.value, 'vibration_enabled', true)
                    )
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    getPreference(type.value, 'vibration_enabled', true)
                      ? 'bg-[#F4A024]'
                      : 'dark:bg-gray-600 light:bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      getPreference(type.value, 'vibration_enabled', true)
                        ? 'transform translate-x-6'
                        : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
