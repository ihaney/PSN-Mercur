'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lightbulb, TrendingUp, Tag, AlertCircle } from 'lucide-react';
import { checkSpelling, getSearchSuggestions } from '@/lib/searchSpellCheck';

interface SearchSuggestionsBarProps {
  query: string;
  onSuggestionClick?: (suggestion: string) => void;
  resultsCount?: number;
}

export default function SearchSuggestionsBar({
  query,
  onSuggestionClick,
  resultsCount = 0
}: SearchSuggestionsBarProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [spellCheck, setSpellCheck] = useState<{
    correctedQuery: string | null;
    confidence: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{
    text: string;
    category?: string;
    type: 'synonym' | 'related' | 'popular';
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      if (!query || query.length < 2) {
        setSpellCheck(null);
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const [spellCheckResult, searchSuggestions] = await Promise.all([
          checkSpelling(query),
          getSearchSuggestions(query, 5)
        ]);

        if (spellCheckResult.hasCorrectionSuggestion && resultsCount < 10) {
          setSpellCheck({
            correctedQuery: spellCheckResult.correctedQuery,
            confidence: spellCheckResult.confidence
          });
        } else {
          setSpellCheck(null);
        }

        setSuggestions(searchSuggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, resultsCount]);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    router.push(`/${locale}/search?q=${encodeURIComponent(suggestion)}`);
  };

  if (isLoading || (!spellCheck && suggestions.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {spellCheck && spellCheck.correctedQuery && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Did you mean{' '}
                <button
                  onClick={() => handleSuggestionClick(spellCheck.correctedQuery!)}
                  className="font-semibold underline hover:no-underline"
                >
                  {spellCheck.correctedQuery}
                </button>
                ?
              </p>
              {spellCheck.confidence < 0.9 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  We found similar results with this spelling
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Related searches
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-full text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  >
                    {suggestion.type === 'synonym' && (
                      <Tag className="w-3.5 h-3.5" />
                    )}
                    {suggestion.type === 'popular' && (
                      <TrendingUp className="w-3.5 h-3.5" />
                    )}
                    <span>{suggestion.text}</span>
                    {suggestion.category && (
                      <span className="text-xs opacity-70">
                        · {suggestion.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
