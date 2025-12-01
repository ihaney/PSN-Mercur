'use client'

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showCount?: boolean;
  reviewCount?: number;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
  showCount = false,
  reviewCount = 0
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (index: number) => {
    if (interactive && onRate) {
      onRate(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index < Math.floor(rating);
          const isHalf = index === Math.floor(rating) && rating % 1 !== 0;

          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              {isHalf ? (
                <div className="relative">
                  <Star className={`${sizeClasses[size]} text-gray-600`} fill="currentColor" />
                  <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                    <Star className={`${sizeClasses[size]} text-[#F4A024]`} fill="currentColor" />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeClasses[size]} ${
                    isFilled ? 'text-[#F4A024]' : 'text-gray-600'
                  }`}
                  fill="currentColor"
                />
              )}
            </button>
          );
        })}
      </div>

      {showCount && reviewCount > 0 && (
        <span className="text-sm text-gray-400">
          ({reviewCount.toLocaleString()})
        </span>
      )}

      {!showCount && rating > 0 && (
        <span className="text-sm text-gray-400">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
