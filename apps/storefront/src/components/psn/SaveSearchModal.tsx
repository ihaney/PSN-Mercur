'use client'

import React, { useState } from 'react';
import { X, Save, Bell, BellOff } from 'lucide-react';
import { useSavedSearches } from '@/hooks/useSavedSearches';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  searchMode: 'products' | 'suppliers';
  filters?: Record<string, any>;
}

export default function SaveSearchModal({
  isOpen,
  onClose,
  searchQuery,
  searchMode,
  filters = {}
}: SaveSearchModalProps) {
  const { createSavedSearch } = useSavedSearches();
  const [name, setName] = useState('');
  const [notifyOnNewResults, setNotifyOnNewResults] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState<'real_time' | 'daily' | 'weekly'>('daily');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      await createSavedSearch.mutateAsync({
        name: name.trim(),
        search_query: searchQuery,
        search_mode: searchMode,
        filters,
        notify_on_new_results: notifyOnNewResults,
        notification_frequency: notificationFrequency
      });

      setName('');
      setNotifyOnNewResults(false);
      setNotificationFrequency('daily');
      onClose();
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Save Search
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Query
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              {searchQuery || 'All results'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electronics from Brazil"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F4A024] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Type
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 capitalize">
              {searchMode}
            </div>
          </div>

          {Object.keys(filters).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active Filters
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, values]) => (
                    Array.isArray(values) && values.map((value, index) => (
                      <span
                        key={`${key}-${index}`}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                      >
                        {value}
                      </span>
                    ))
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="notify"
                checked={notifyOnNewResults}
                onChange={(e) => setNotifyOnNewResults(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#F4A024] border-gray-300 dark:border-gray-600 rounded focus:ring-[#F4A024]"
              />
              <div className="flex-1">
                <label
                  htmlFor="notify"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2"
                >
                  {notifyOnNewResults ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                  Notify me of new results
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get alerts when new products or suppliers match this search
                </p>
              </div>
            </div>

            {notifyOnNewResults && (
              <div className="mt-3 ml-7">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Frequency
                </label>
                <select
                  value={notificationFrequency}
                  onChange={(e) => setNotificationFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F4A024] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="real_time">Real-time (as they happen)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createSavedSearch.isPending}
              className="flex-1 px-4 py-2 bg-[#F4A024] hover:bg-[#F4A024]/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {createSavedSearch.isPending ? 'Saving...' : 'Save Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
