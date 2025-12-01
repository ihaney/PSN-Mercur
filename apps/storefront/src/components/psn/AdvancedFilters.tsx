'use client'

import React, { useState } from 'react';
import { ChevronDown, X, DollarSign, Package, Calendar, Shield } from 'lucide-react';

interface PriceRange {
  min: number;
  max: number;
}

interface AdvancedFiltersProps {
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  moqRange?: { min: number; max: number };
  onMoqRangeChange?: (range: { min: number; max: number }) => void;
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (checked: boolean) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (checked: boolean) => void;
  onClearAll: () => void;
}

export default function AdvancedFilters({
  priceRange,
  onPriceRangeChange,
  moqRange,
  onMoqRangeChange,
  dateRange,
  onDateRangeChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  inStockOnly,
  onInStockOnlyChange,
  onClearAll
}: AdvancedFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [localPriceMin, setLocalPriceMin] = useState(priceRange.min.toString());
  const [localPriceMax, setLocalPriceMax] = useState(priceRange.max.toString());

  const hasActiveFilters =
    priceRange.min > 0 ||
    priceRange.max < 1000000 ||
    (moqRange && (moqRange.min > 0 || moqRange.max < 100000)) ||
    dateRange ||
    verifiedOnly ||
    inStockOnly;

  const handlePriceMinBlur = () => {
    const value = parseFloat(localPriceMin) || 0;
    onPriceRangeChange({ ...priceRange, min: Math.max(0, value) });
  };

  const handlePriceMaxBlur = () => {
    const value = parseFloat(localPriceMax) || 1000000;
    onPriceRangeChange({ ...priceRange, max: Math.max(priceRange.min, value) });
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2 text-base font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          Advanced Filters
          {hasActiveFilters && (
            <span className="bg-[#F4A024] text-white text-xs px-2 py-1 rounded-full font-medium">
              Active
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-4 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <DollarSign className="w-4 h-4" />
              Price Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={localPriceMin}
                  onChange={(e) => setLocalPriceMin(e.target.value)}
                  onBlur={handlePriceMinBlur}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
                />
              </div>
              <span className="text-gray-400">—</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  onBlur={handlePriceMaxBlur}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
                />
              </div>
            </div>
            {(priceRange.min > 0 || priceRange.max < 1000000) && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
              </div>
            )}
          </div>

          {moqRange && onMoqRangeChange && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Package className="w-4 h-4" />
                Minimum Order Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={moqRange.min}
                    onChange={(e) =>
                      onMoqRangeChange({
                        ...moqRange,
                        min: parseInt(e.target.value) || 0
                      })
                    }
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
                  />
                </div>
                <span className="text-gray-400">—</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={moqRange.max}
                    onChange={(e) =>
                      onMoqRangeChange({
                        ...moqRange,
                        max: parseInt(e.target.value) || 100000
                      })
                    }
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {dateRange && onDateRangeChange && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Calendar className="w-4 h-4" />
                Date Listed
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    onDateRangeChange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    onDateRangeChange({ ...dateRange, end: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
                className="w-4 h-4 text-[#F4A024] border-gray-300 dark:border-gray-600 rounded focus:ring-[#F4A024]"
              />
              <div className="flex items-center gap-2 flex-1">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  Verified suppliers only
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockOnlyChange(e.target.checked)}
                className="w-4 h-4 text-[#F4A024] border-gray-300 dark:border-gray-600 rounded focus:ring-[#F4A024]"
              />
              <div className="flex items-center gap-2 flex-1">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  In stock only
                </span>
              </div>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Advanced Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
