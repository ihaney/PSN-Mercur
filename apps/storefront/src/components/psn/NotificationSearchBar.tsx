'use client'

import React, { useState } from 'react';
import { Search, X, Filter, Clock, MessageSquare, ShoppingCart, CreditCard, Star, AlertCircle } from 'lucide-react';
import { useNotificationSearch } from '@/hooks/useNotificationSearch';
import LoadingSpinner from './LoadingSpinner';

interface NotificationSearchBarProps {
  onResultClick?: (notificationId: string) => void;
  compact?: boolean;
}

const NOTIFICATION_TYPE_FILTERS = [
  { value: null, label: 'All Types', icon: Filter },
  { value: 'message', label: 'Messages', icon: MessageSquare },
  { value: 'order', label: 'Orders', icon: ShoppingCart },
  { value: 'payment', label: 'Payments', icon: CreditCard },
  { value: 'review', label: 'Reviews', icon: Star },
  { value: 'system', label: 'System', icon: AlertCircle },
  { value: 'alert', label: 'Alerts', icon: AlertCircle }
];

export default function NotificationSearchBar({ onResultClick, compact = false }: NotificationSearchBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    notificationType,
    setNotificationType,
    results,
    isLoading,
    clearSearch,
    hasResults,
    isSearching
  } = useNotificationSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowResults(false);
  };

  const handleResultClick = (notificationId: string) => {
    if (onResultClick) {
      onResultClick(notificationId);
    }
    setShowResults(false);
  };

  const handleFilterChange = (type: string | null) => {
    setNotificationType(type);
    setShowFilters(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    const typeFilter = NOTIFICATION_TYPE_FILTERS.find(f => f.value === type);
    const Icon = typeFilter?.icon || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const typeFilter = NOTIFICATION_TYPE_FILTERS.find(f => f.value === type);
    return typeFilter?.label || 'Notification';
  };

  if (compact) {
    return (
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 dark:text-gray-400 light:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            placeholder="Search notifications..."
            className="w-full pl-10 pr-10 py-2 text-sm dark:bg-gray-800 light:bg-gray-50 dark:border-gray-700 light:border-gray-200 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 light:text-gray-500 hover:text-[#F4A024] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showResults && isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 dark:bg-gray-800 light:bg-white rounded-lg shadow-xl border dark:border-gray-700 light:border-gray-200 max-h-96 overflow-y-auto z-50">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
              </div>
            ) : hasResults ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.notification_id}
                    onClick={() => handleResultClick(result.notification_id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 light:border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 dark:text-gray-400 light:text-gray-500">
                        {getTypeIcon(result.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium dark:text-gray-100 light:text-gray-900 truncate">
                            {result.title}
                          </h4>
                          <span className="text-xs dark:text-gray-500 light:text-gray-400 whitespace-nowrap">
                            {formatTimeAgo(result.created_at)}
                          </span>
                        </div>
                        <p className="text-sm dark:text-gray-400 light:text-gray-600 line-clamp-2">
                          {result.message}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 rounded">
                          {getTypeLabel(result.notification_type)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 dark:text-gray-600 light:text-gray-300 mx-auto mb-3" />
                <p className="text-sm dark:text-gray-400 light:text-gray-600">
                  No notifications found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 light:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            placeholder="Search notifications by title, message, or type..."
            className="w-full pl-10 pr-12 py-3 dark:bg-gray-800 light:bg-gray-50 dark:border-gray-700 light:border-gray-200 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 light:text-gray-500 hover:text-[#F4A024] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
              notificationType
                ? 'bg-[#F4A024] text-gray-900 border-[#F4A024]'
                : 'dark:bg-gray-800 light:bg-gray-50 dark:border-gray-700 light:border-gray-200 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {showFilters && (
            <div className="absolute top-full right-0 mt-2 w-48 dark:bg-gray-800 light:bg-white rounded-lg shadow-xl border dark:border-gray-700 light:border-gray-200 py-2 z-50">
              {NOTIFICATION_TYPE_FILTERS.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.value || 'all'}
                    onClick={() => handleFilterChange(filter.value)}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                      notificationType === filter.value
                        ? 'bg-[#F4A024]/10 dark:text-[#F4A024] light:text-[#F4A024]'
                        : 'dark:text-gray-300 light:text-gray-700 hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showResults && isSearching && (
        <div className="dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : hasResults ? (
            <div className="divide-y dark:divide-gray-700 light:divide-gray-200">
              {results.map((result) => (
                <button
                  key={result.notification_id}
                  onClick={() => handleResultClick(result.notification_id)}
                  className="w-full px-4 py-4 text-left hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 dark:text-gray-400 light:text-gray-500">
                      {getTypeIcon(result.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium dark:text-gray-100 light:text-gray-900">
                          {result.title}
                        </h3>
                        <span className="flex items-center gap-1 text-xs dark:text-gray-500 light:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(result.created_at)}
                        </span>
                      </div>
                      <p className="text-sm dark:text-gray-400 light:text-gray-600 mb-2 line-clamp-2">
                        {result.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs dark:bg-gray-700 light:bg-gray-200 dark:text-gray-300 light:text-gray-700 rounded">
                          {getTypeLabel(result.notification_type)}
                        </span>
                        <span className="text-xs dark:text-gray-500 light:text-gray-400">
                          Relevance: {(result.rank * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 dark:text-gray-600 light:text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium dark:text-gray-300 light:text-gray-700 mb-2">
                No notifications found
              </h3>
              <p className="text-sm dark:text-gray-500 light:text-gray-500">
                Try adjusting your search query or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
