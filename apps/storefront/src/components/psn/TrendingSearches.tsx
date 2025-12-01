'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { TrendingUp, ArrowUp, Flame, Search } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface TrendingSearchesProps {
  timeWindow?: '1h' | '24h' | '7d' | '30d';
  limit?: number;
  showGrowthRate?: boolean;
  category?: string;
}

export default function TrendingSearches({
  timeWindow = '24h',
  limit = 10,
  showGrowthRate = true,
  category
}: TrendingSearchesProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const { data: trendingSearches, isLoading } = useQuery({
    queryKey: ['trending-searches', timeWindow, category, limit],
    queryFn: async () => {
      let query = supabase
        .from('trending_searches')
        .select('*')
        .eq('time_window', timeWindow)
        .order('trending_score', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  });

  const handleSearchClick = (searchTerm: string) => {
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!trendingSearches || trendingSearches.length === 0) {
    return null;
  }

  const getTimeLabel = () => {
    switch (timeWindow) {
      case '1h':
        return 'Last Hour';
      case '24h':
        return 'Last 24 Hours';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      default:
        return 'Trending';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Trending Searches
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getTimeLabel()}
            </p>
          </div>
        </div>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-2">
        {trendingSearches.map((search, index) => {
          const isTopThree = index < 3;
          const growthRate = search.growth_rate || 0;
          const isGrowing = growthRate > 0;

          return (
            <button
              key={search.id}
              onClick={() => handleSearchClick(search.search_term)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
                  isTopThree
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {index + 1}
              </div>

              <div className="flex-1 text-left overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#F4A024] dark:group-hover:text-[#F4A024] transition-colors truncate">
                    {search.search_term}
                  </span>
                  {isTopThree && (
                    <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Search className="w-3 h-3" />
                  <span>{search.search_count.toLocaleString()} searches</span>
                  {search.category && (
                    <>
                      <span>·</span>
                      <span>{search.category}</span>
                    </>
                  )}
                </div>
              </div>

              {showGrowthRate && isGrowing && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-full flex-shrink-0">
                  <ArrowUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {Math.abs(growthRate).toFixed(0)}%
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {trendingSearches.length === limit && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push(`/${locale}/search`)}
            className="w-full text-center text-sm text-[#F4A024] hover:text-[#F4A024]/80 font-medium transition-colors"
          >
            View All Trending Searches
          </button>
        </div>
      )}
    </div>
  );
}
