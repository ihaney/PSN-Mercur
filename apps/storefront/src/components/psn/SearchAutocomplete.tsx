'use client'

import React, { useRef, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Package, Building2, Clock, TrendingUp, X } from 'lucide-react';
import { useSearchAutocomplete, addRecentSearch, clearRecentSearches } from '@/hooks/useSearchAutocomplete';
import LoadingSpinner from './LoadingSpinner';
import LazyImage from './LazyImage';

interface SearchAutocompleteProps {
  query: string;
  onSelect: (query: string, url: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function SearchAutocomplete({
  query,
  onSelect,
  onClose,
  isOpen
}: SearchAutocompleteProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: results, isLoading } = useSearchAutocomplete(query, {
    enabled: isOpen && query.length >= 2
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!results || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSelect = (result: typeof results[0]) => {
    addRecentSearch(result.title);
    onSelect(result.title, result.url);
    router.push(`/${locale}${result.url}`);
    onClose();
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    onClose();
  };

  if (!isOpen || (!isLoading && (!results || results.length === 0))) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-gray-400" />;
      case 'supplier':
        return <Building2 className="w-4 h-4 text-gray-400" />;
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'suggestion':
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const hasRecentSearches = results?.some(r => r.type === 'recent');

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-[500px] overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <>
          {hasRecentSearches && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Recent Searches
              </span>
              <button
                onClick={handleClearRecent}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>
          )}

          <div className="py-1">
            {results?.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  selectedIndex === index
                    ? 'bg-gray-50 dark:bg-gray-700/50'
                    : ''
                }`}
              >
                {result.image ? (
                  <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <LazyImage
                      src={result.image || '/placeholder.png'}
                      alt={result.title}
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {getIcon(result.type)}
                  </div>
                )}

                <div className="flex-1 text-left overflow-hidden">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {result.subtitle}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {result.type === 'product' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Product
                    </span>
                  )}
                  {result.type === 'supplier' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      Supplier
                    </span>
                  )}
                  {result.type === 'suggestion' && (
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">Enter</kbd>
                Select
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
