'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Package, Building2, Tag, ArrowRight, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface SearchSuggestion {
  id: string;
  suggestion_text: string;
  category: string | null;
  search_type: 'product' | 'supplier' | 'both' | null;
  popularity_score: number;
  is_featured: boolean;
}

interface SearchSuggestionsPanelProps {
  query: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export default function SearchSuggestionsPanel({
  query,
  onSuggestionClick
}: SearchSuggestionsPanelProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: suggestions, isLoading } = useQuery<SearchSuggestion[]>({
    queryKey: ['searchSuggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .or(`suggestion_text.ilike.%${query}%,category.ilike.%${query}%`)
        .order('popularity_score', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const { data: categorySuggestions } = useQuery({
    queryKey: ['categorySuggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('Categories')
        .select('Category_Name')
        .ilike('Category_Name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2
  });

  const { data: countrySuggestions } = useQuery({
    queryKey: ['countrySuggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('Countries')
        .select('Country_Name')
        .ilike('Country_Name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  const hasSuggestions =
    (suggestions && suggestions.length > 0) ||
    (categorySuggestions && categorySuggestions.length > 0) ||
    (countrySuggestions && countrySuggestions.length > 0);

  if (!hasSuggestions) {
    return null;
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <div className="space-y-4">
      {suggestions && suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#F4A024]" />
            <h4 className="text-sm font-semibold text-themed">Suggested Searches</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.id}
                href={`/${locale}/search?q=${encodeURIComponent(suggestion.suggestion_text)}`}
                onClick={() => handleSuggestionClick(suggestion.suggestion_text)}
                className="flex items-center justify-between p-3 rounded-lg bg-themed-card hover:bg-[#F4A024]/10 transition-colors border-themed group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {suggestion.search_type === 'product' ? (
                    <Package className="w-4 h-4 text-themed-secondary flex-shrink-0" />
                  ) : suggestion.search_type === 'supplier' ? (
                    <Building2 className="w-4 h-4 text-themed-secondary flex-shrink-0" />
                  ) : (
                    <Tag className="w-4 h-4 text-themed-secondary flex-shrink-0" />
                  )}
                  <span className="text-sm text-themed font-medium truncate group-hover:text-[#F4A024] transition-colors">
                    {suggestion.suggestion_text}
                  </span>
                  {suggestion.is_featured && (
                    <Sparkles className="w-3 h-3 text-[#F4A024] flex-shrink-0" />
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-themed-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {categorySuggestions && categorySuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-[#F4A024]" />
            <h4 className="text-sm font-semibold text-themed">Browse by Category</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {categorySuggestions.map((cat) => (
              <Link
                key={cat.Category_Name}
                href={`/${locale}/products?category=${encodeURIComponent(cat.Category_Name)}`}
                onClick={() => handleSuggestionClick(cat.Category_Name)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-themed-secondary hover:bg-[#F4A024]/10 rounded-lg text-sm transition-colors border-themed group"
              >
                <Tag className="w-3 h-3 text-themed-secondary group-hover:text-[#F4A024] transition-colors" />
                <span className="text-themed group-hover:text-[#F4A024] transition-colors">
                  {cat.Category_Name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {countrySuggestions && countrySuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#F4A024]" />
            <h4 className="text-sm font-semibold text-themed">Filter by Country</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {countrySuggestions.map((country) => (
              <Link
                key={country.Country_Name}
                href={`/${locale}/products?country=${encodeURIComponent(country.Country_Name)}`}
                onClick={() => handleSuggestionClick(country.Country_Name)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-themed-secondary hover:bg-[#F4A024]/10 rounded-lg text-sm transition-colors border-themed group"
              >
                <MapPin className="w-3 h-3 text-themed-secondary group-hover:text-[#F4A024] transition-colors" />
                <span className="text-themed group-hover:text-[#F4A024] transition-colors">
                  {country.Country_Name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
