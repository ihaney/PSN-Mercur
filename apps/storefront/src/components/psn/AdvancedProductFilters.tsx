'use client'

import React, { useState, useMemo } from 'react';
import { ChevronDown, Info, DollarSign, Package, Clock, FileText, Award, MapPin, Building2, Check } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

interface MOQRange {
  range_label: string;
  min_moq: number;
  max_moq: number;
  product_count: number;
}

interface PriceBand {
  price_band: string;
  product_count: number;
  min_price: number;
  max_price: number;
}

interface LeadTimeRange {
  range_label: string;
  min_days: number;
  max_days: number;
  product_count: number;
}

interface AdvancedProductFiltersProps {
  activeFilters: { [key: string]: string[] };
  onFilterChange: (filterKey: string, value: string) => void;
  moqRanges?: MOQRange[];
  priceBands?: PriceBand[];
  leadTimeRanges?: LeadTimeRange[];
  hsCodeOptions?: FilterOption[];
  incotermsOptions?: FilterOption[];
  certificationOptions?: FilterOption[];
  cityOptions?: FilterOption[];
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (checked: boolean) => void;
}

const AdvancedProductFilters: React.FC<AdvancedProductFiltersProps> = ({
  activeFilters,
  onFilterChange,
  moqRanges = [],
  priceBands = [],
  leadTimeRanges = [],
  hsCodeOptions = [],
  incotermsOptions = [],
  certificationOptions = [],
  cityOptions = [],
  verifiedOnly,
  onVerifiedOnlyChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  // Price band display labels and colors
  const priceBandInfo: Record<string, { label: string; color: string; icon: string }> = {
    budget: { label: 'Budget', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: '💵' },
    mid_range: { label: 'Mid-Range', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: '💳' },
    premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: '💎' },
    luxury: { label: 'Luxury', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: '👑' },
  };

  // Incoterms with descriptions
  const incotermsInfo: Record<string, string> = {
    EXW: 'Ex Works - Buyer picks up at seller facility',
    FCA: 'Free Carrier - Seller delivers to carrier',
    FAS: 'Free Alongside Ship - Delivered alongside ship',
    FOB: 'Free On Board - Loaded on ship, risk transfers',
    CFR: 'Cost and Freight - Seller pays freight to port',
    CIF: 'Cost, Insurance & Freight - Includes insurance',
    CPT: 'Carriage Paid To - Freight paid to destination',
    CIP: 'Carriage & Insurance Paid - With insurance',
    DAP: 'Delivered At Place - To named destination',
    DPU: 'Delivered at Place Unloaded - Unloaded at destination',
    DDP: 'Delivered Duty Paid - All costs included',
  };

  return (
    <div className="space-y-4">
      {/* Verified Only Toggle */}
      <div className="pb-4 border-b dark:border-gray-700 light:border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg dark:hover:bg-gray-700/30 light:hover:bg-gray-100 transition-colors">
          <div className="relative">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
              className="w-5 h-5 text-[#F4A024] dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
            />
            {verifiedOnly && (
              <Check className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F4A024]" />
              <span className="font-medium dark:text-gray-100 light:text-gray-900">Verified Suppliers Only</span>
            </div>
            <span className="text-xs dark:text-gray-400 light:text-gray-600">Show products from verified suppliers</span>
          </div>
        </label>
      </div>

      {/* MOQ Range Filter */}
      {moqRanges.length > 0 && (
        <div className="border-b dark:border-gray-700 light:border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('moq')}
            className="w-full flex items-center justify-between dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 py-2 text-base font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Minimum Order Quantity
              {activeFilters['moq_range']?.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilters['moq_range'].length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded('moq') ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded('moq') && (
            <div className="mt-3 space-y-2">
              {moqRanges.map((range) => (
                <label
                  key={range.range_label}
                  className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-700/30 light:hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={(activeFilters['moq_range'] || []).includes(range.range_label)}
                    onChange={() => onFilterChange('moq_range', range.range_label)}
                    className="w-4 h-4 text-[#F4A024] dark:bg-gray-700 light:bg-gray-200 dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
                  />
                  <span className="dark:text-gray-300 light:text-gray-700 text-sm flex-1">{range.range_label}</span>
                  <span className="dark:text-gray-500 light:text-gray-600 text-xs">({range.product_count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Band Filter */}
      {priceBands.length > 0 && (
        <div className="border-b dark:border-gray-700 light:border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('price_band')}
            className="w-full flex items-center justify-between dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 py-2 text-base font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price Range
              {activeFilters['price_band']?.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilters['price_band'].length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded('price_band') ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded('price_band') && (
            <div className="mt-3 space-y-2">
              {priceBands.map((band) => {
                const info = priceBandInfo[band.price_band];
                return (
                  <label
                    key={band.price_band}
                    className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-700/30 light:hover:bg-gray-100 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={(activeFilters['price_band'] || []).includes(band.price_band)}
                      onChange={() => onFilterChange('price_band', band.price_band)}
                      className="w-4 h-4 text-[#F4A024] dark:bg-gray-700 light:bg-gray-200 dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
                    />
                    <div className="flex-1 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${info?.color || ''}`}>
                        {info?.icon} {info?.label || band.price_band}
                      </span>
                      <span className="text-xs dark:text-gray-400 light:text-gray-600">
                        ${band.min_price?.toFixed(2)} - ${band.max_price?.toFixed(2)}
                      </span>
                    </div>
                    <span className="dark:text-gray-500 light:text-gray-600 text-xs">({band.product_count})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lead Time Filter */}
      {leadTimeRanges.length > 0 && (
        <div className="border-b dark:border-gray-700 light:border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('lead_time')}
            className="w-full flex items-center justify-between dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 py-2 text-base font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Lead Time
              {activeFilters['lead_time']?.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilters['lead_time'].length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded('lead_time') ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded('lead_time') && (
            <div className="mt-3 space-y-2">
              {leadTimeRanges.map((range) => (
                <label
                  key={range.range_label}
                  className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-700/30 light:hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={(activeFilters['lead_time'] || []).includes(range.range_label)}
                    onChange={() => onFilterChange('lead_time', range.range_label)}
                    className="w-4 h-4 text-[#F4A024] dark:bg-gray-700 light:bg-gray-200 dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
                  />
                  <span className="dark:text-gray-300 light:text-gray-700 text-sm flex-1">{range.range_label}</span>
                  <span className="dark:text-gray-500 light:text-gray-600 text-xs">({range.product_count})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HS Code Filter */}
      {hsCodeOptions.length > 0 && (
        <div className="border-b dark:border-gray-700 light:border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('hs_code')}
            className="w-full flex items-center justify-between dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 py-2 text-base font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              HS Code
              {activeFilters['hs_code']?.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilters['hs_code'].length}
                </span>
              )}
              <button className="p-1 hover:bg-gray-700/50 rounded" title="Harmonized System tariff classification code">
                <Info className="w-3 h-3" />
              </button>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded('hs_code') ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded('hs_code') && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {hsCodeOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-700/30 light:hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={(activeFilters['hs_code'] || []).includes(option.id)}
                    onChange={() => onFilterChange('hs_code', option.id)}
                    className="w-4 h-4 text-[#F4A024] dark:bg-gray-700 light:bg-gray-200 dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
                  />
                  <span className="dark:text-gray-300 light:text-gray-700 text-sm flex-1 font-mono">{option.name}</span>
                  {option.count !== undefined && (
                    <span className="dark:text-gray-500 light:text-gray-600 text-xs">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incoterms Filter */}
      {incotermsOptions.length > 0 && (
        <div className="border-b dark:border-gray-700 light:border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('incoterms')}
            className="w-full flex items-center justify-between dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 py-2 text-base font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Incoterms
              {activeFilters['incoterms']?.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilters['incoterms'].length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded('incoterms') ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded('incoterms') && (
            <div className="mt-3 space-y-2">
              {incotermsOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex flex-col gap-1 cursor-pointer dark:hover:bg-gray-700/30 light:hover:bg-gray-100 p-2 rounded"
                  title={incotermsInfo[option.id] || ''}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(activeFilters['incoterms'] || []).includes(option.id)}
                      onChange={() => onFilterChange('incoterms', option.id)}
                      className="w-4 h-4 text-[#F4A024] dark:bg-gray-700 light:bg-gray-200 dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
                    />
                    <span className="dark:text-gray-300 light:text-gray-700 text-sm font-medium flex-1">{option.name}</span>
                    {option.count !== undefined && (
                      <span className="dark:text-gray-500 light:text-gray-600 text-xs">({option.count})</span>
                    )}
                  </div>
                  {incotermsInfo[option.id] && (
                    <span className="text-xs dark:text-gray-500 light:text-gray-600 ml-6">{incotermsInfo[option.id]}</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certifications Filter */}
      {certificationOptions.length > 0 && (
        <div className="border-b dark:border-gray-700 light:border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('certifications')}
            className="w-full flex items-center justify-between dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 py-2 text-base font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications
              {activeFilters['certifications']?.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilters['certifications'].length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded('certifications') ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded('certifications') && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {certificationOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-700/30 light:hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={(activeFilters['certifications'] || []).includes(option.id)}
                    onChange={() => onFilterChange('certifications', option.id)}
                    className="w-4 h-4 text-[#F4A024] dark:bg-gray-700 light:bg-gray-200 dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
                  />
                  <span className="dark:text-gray-300 light:text-gray-700 text-sm flex-1">{option.name}</span>
                  {option.count !== undefined && (
                    <span className="dark:text-gray-500 light:text-gray-600 text-xs">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* City Filter */}
      {cityOptions.length > 0 && (
        <div className="pb-4">
          <button
            onClick={() => toggleSection('city')}
            className="w-full flex items-center justify-between dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 py-2 text-base font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              City
              {activeFilters['city']?.length > 0 && (
                <span className="bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  {activeFilters['city'].length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded('city') ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded('city') && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {cityOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-700/30 light:hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={(activeFilters['city'] || []).includes(option.id)}
                    onChange={() => onFilterChange('city', option.id)}
                    className="w-4 h-4 text-[#F4A024] dark:bg-gray-700 light:bg-gray-200 dark:border-gray-600 light:border-gray-400 rounded focus:ring-[#F4A024] focus:ring-2"
                  />
                  <span className="dark:text-gray-300 light:text-gray-700 text-sm flex-1">{option.name}</span>
                  {option.count !== undefined && (
                    <span className="dark:text-gray-500 light:text-gray-600 text-xs">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedProductFilters;
