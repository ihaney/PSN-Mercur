'use client'

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, Tag, User, SlidersHorizontal, Download } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface AdvancedNotificationSearchProps {
  onResultClick?: (notificationId: string) => void;
  compact?: boolean;
}

interface SearchResult {
  notification_id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
  rank: number;
}

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'new_message', label: 'Messages' },
  { value: 'inquiry_received', label: 'Inquiries' },
  { value: 'response_received', label: 'Responses' },
  { value: 'order_confirmed', label: 'Orders' },
  { value: 'return_requested', label: 'Returns' },
  { value: 'refund_completed', label: 'Refunds' },
  { value: 'system_alert', label: 'System' },
  { value: 'price_drop', label: 'Price Drops' },
  { value: 'stock_alert', label: 'Stock Alerts' }
];

export default function AdvancedNotificationSearch({
  onResultClick,
  compact = false
}: AdvancedNotificationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const history = localStorage.getItem('notification_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) {
        toast.error('Please sign in to search notifications');
        return;
      }

      const { data, error } = await supabase.rpc('search_notifications', {
        p_user_id: session.user.id,
        p_search_query: searchQuery,
        p_notification_type: selectedType === 'all' ? null : selectedType,
        p_limit: 50
      });

      if (error) throw error;

      let filteredResults = data || [];

      if (dateFrom) {
        filteredResults = filteredResults.filter((r: SearchResult) =>
          new Date(r.created_at) >= new Date(dateFrom)
        );
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filteredResults = filteredResults.filter((r: SearchResult) =>
          new Date(r.created_at) <= endDate
        );
      }

      setResults(filteredResults);

      const updatedHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem('notification_search_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setDateFrom('');
    setDateTo('');
    setResults([]);
  };

  const exportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csv = [
      ['Title', 'Message', 'Type', 'Date', 'Relevance Score'].join(','),
      ...results.map(r =>
        [
          `"${r.title.replace(/"/g, '""')}"`,
          `"${r.message.replace(/"/g, '""')}"`,
          r.notification_type,
          new Date(r.created_at).toLocaleString(),
          r.rank.toFixed(2)
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-search-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Search results exported');
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-[#F4A024] text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto'}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-400 light:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search notifications..."
              className="w-full dark:bg-gray-700 light:bg-gray-50 dark:border-gray-600 light:border-gray-300 border rounded-lg pl-10 pr-10 py-2 dark:text-white light:text-gray-900 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F4A024] focus:border-[#F4A024] text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearFilters}
                className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-400 light:text-gray-500 hover:text-[#F4A024] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={performSearch}
            disabled={!searchQuery.trim() || loading}
            className="px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {loading ? <LoadingSpinner /> : <Search className="w-4 h-4" />}
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-[#F4A024] text-gray-900' : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700'
            }`}
            title="Advanced filters"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="dark:bg-gray-800 light:bg-gray-50 rounded-lg p-4 border dark:border-gray-700 light:border-gray-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                  <Tag className="w-3 h-3 inline mr-1" />
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg px-3 py-2 dark:text-white light:text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                >
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg px-3 py-2 dark:text-white light:text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg px-3 py-2 dark:text-white light:text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                />
              </div>
            </div>
          </div>
        )}

        {searchHistory.length > 0 && !searchQuery && (
          <div className="dark:bg-gray-800/50 light:bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium dark:text-gray-400 light:text-gray-600 mb-2">Recent Searches</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 text-xs dark:bg-gray-700 light:bg-white dark:text-gray-300 light:text-gray-700 rounded-full hover:bg-[#F4A024] hover:text-gray-900 transition-colors border dark:border-gray-600 light:border-gray-300"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm dark:text-gray-400 light:text-gray-600">
                Found {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
              <button
                onClick={exportResults}
                className="text-xs flex items-center gap-1 px-3 py-1 dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 rounded-lg hover:bg-[#F4A024] hover:text-gray-900 transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.notification_id}
                  onClick={() => onResultClick?.(result.notification_id)}
                  className="w-full text-left p-3 rounded-lg dark:bg-gray-800 light:bg-white dark:hover:bg-gray-700 light:hover:bg-gray-50 transition-colors border dark:border-gray-700 light:border-gray-200"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium dark:text-gray-100 light:text-gray-900">
                      {highlightText(result.title, searchQuery)}
                    </h4>
                    <span className="text-xs dark:text-gray-500 light:text-gray-500 flex-shrink-0 ml-2">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs dark:text-gray-400 light:text-gray-600 line-clamp-2">
                    {highlightText(result.message, searchQuery)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 rounded-full">
                      {NOTIFICATION_TYPES.find(t => t.value === result.notification_type)?.label || result.notification_type}
                    </span>
                    <span className="text-xs dark:text-gray-500 light:text-gray-500">
                      Relevance: {(result.rank * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
