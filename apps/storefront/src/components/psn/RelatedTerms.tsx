'use client'

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Tag } from 'lucide-react';

interface RelatedTermsProps {
  terms: string[];
  onTermClick?: (term: string) => void;
}

export default function RelatedTerms({ terms, onTermClick }: RelatedTermsProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const handleTermClick = (term: string) => {
    if (onTermClick) {
      onTermClick(term);
    } else {
      router.push(`/${locale}/search?q=${encodeURIComponent(term)}&mode=products`);
    }
  };

  if (!terms || terms.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 dark:text-gray-400 light:text-gray-600" />
        <span className="text-sm font-medium dark:text-gray-400 light:text-gray-600">
          Related Topics
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {terms.map((term, index) => (
          <button
            key={index}
            onClick={() => handleTermClick(term)}
            className="px-3 py-1.5 text-sm font-medium dark:bg-gray-800/50 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 dark:hover:bg-gray-700/50 light:hover:bg-gray-200 rounded-lg transition-colors border dark:border-gray-700 light:border-gray-300"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
