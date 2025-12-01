'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TrendingUp, Search, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface PopularSearch {
  query_text: string;
  search_count: number;
  unique_users: number;
  last_searched_at: string;
  popularity_tier: string;
}

interface PopularSearchesWidgetProps {
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export default function PopularSearchesWidget({
  limit = 10,
  showTitle = true,
  compact = false
}: PopularSearchesWidgetProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: popularSearches, isLoading } = useQuery<PopularSearch[]>({
    queryKey: ['popularSearches', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_searches_cache')
        .select('*')
        .order('search_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!popularSearches || popularSearches.length === 0) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'very_high':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'very_high':
        return <Sparkles className="w-3 h-3" />;
      case 'high':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <Search className="w-3 h-3" />;
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {popularSearches.slice(0, 6).map((search) => (
          <Link
            key={search.query_text}
            href={`/${locale}/search?q=${encodeURIComponent(search.query_text)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-themed-secondary hover:bg-[#F4A024]/10 rounded-full text-sm transition-colors border-themed"
          >
            <Search className="w-3 h-3 text-themed-secondary" />
            <span className="text-themed">{search.query_text}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-themed-secondary rounded-xl p-6 border-themed">
      {showTitle && (
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#F4A024]/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#F4A024]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-themed">Popular Searches</h3>
            <p className="text-sm text-themed-secondary">
              What others are searching for
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {popularSearches.map((search, index) => (
          <Link
            key={search.query_text}
            href={`/${locale}/search?q=${encodeURIComponent(search.query_text)}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-themed-card transition-colors group border-themed-hover"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-themed-card flex items-center justify-center text-xs font-bold text-themed-secondary">
                {index + 1}
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Search className="w-4 h-4 text-themed-secondary flex-shrink-0" />
                <span className="text-themed font-medium truncate group-hover:text-[#F4A024] transition-colors">
                  {search.query_text}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
              <div className={`flex items-center gap-1 ${getTierColor(search.popularity_tier)}`}>
                {getTierIcon(search.popularity_tier)}
                <span className="text-xs font-semibold">
                  {search.search_count}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {popularSearches.length >= limit && (
        <div className="mt-4 text-center">
          <Link
            href={`/${locale}/search`}
            className="text-sm text-[#F4A024] hover:text-[#F4A024]/80 font-medium inline-flex items-center gap-1"
          >
            Explore more searches
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
