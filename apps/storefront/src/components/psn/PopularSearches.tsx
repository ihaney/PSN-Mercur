'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { Star, Search, Users } from 'lucide-react';
interface PopularSearchesProps {
  limit?: number;
  variant?: 'badges' | 'list';
  showUserCount?: boolean;
}

export default function PopularSearches({
  limit = 12,
  variant = 'badges',
  showUserCount = false
}: PopularSearchesProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const { data: popularSearches } = useQuery({
    queryKey: ['popular-searches', limit],
    queryFn: async () => {
      // TODO: Fetch popular searches from Medusa backend
      // For now, return empty array
      return [];
    },
    staleTime: 10 * 60 * 1000
  });

  const handleSearchClick = (searchTerm: string) => {
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  if (!popularSearches || popularSearches.length === 0) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'very_high':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'high':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'medium':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  if (variant === 'badges') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Popular Searches
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              What others are searching for
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <button
              key={search.query_text}
              onClick={() => handleSearchClick(search.query_text)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-all hover:scale-105 hover:shadow-md ${getTierColor(
                search.popularity_tier
              )}`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{search.query_text}</span>
              {showUserCount && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1 opacity-70">
                    <Users className="w-3 h-3" />
                    {search.unique_users}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
          <Star className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Popular Searches
        </h3>
      </div>

      <div className="space-y-2">
        {popularSearches.map((search, index) => (
          <button
            key={search.query_text}
            onClick={() => handleSearchClick(search.query_text)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium text-sm flex-shrink-0">
              {index + 1}
            </div>

            <div className="flex-1 text-left overflow-hidden">
              <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#F4A024] dark:group-hover:text-[#F4A024] transition-colors truncate">
                {search.query_text}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Search className="w-3 h-3" />
                <span>{search.search_count.toLocaleString()} searches</span>
                {showUserCount && (
                  <>
                    <span>·</span>
                    <Users className="w-3 h-3" />
                    <span>{search.unique_users} users</span>
                  </>
                )}
              </div>
            </div>

            <div
              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTierColor(
                search.popularity_tier
              ).split(' ')[0]} ${getTierColor(search.popularity_tier).split(' ')[1]}`}
            >
              {search.popularity_tier.replace('_', ' ')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
