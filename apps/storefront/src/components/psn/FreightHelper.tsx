'use client'

import React, { useState } from 'react';
import { Package, Truck, Ship, Plane, DollarSign, Clock, Info, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useQuickFreightEstimate, useProductHTSCode } from '@/hooks/useFreightCalculator';
import { formatShippingMethod, getProductHTSWithTariff, getAvailableDestinationCountries } from '@/lib/freightCalculator';
import LoadingSpinner from './LoadingSpinner';

interface FreightHelperProps {
  productId: string;
  productPrice: string;
  productCategory: string;
  productMOQ: string;
  productCountry?: string;
}

export default function FreightHelper({
  productId,
  productPrice,
  productCategory,
  productMOQ,
  productCountry = 'Mexico'
}: FreightHelperProps) {
  const [expanded, setExpanded] = useState(false);
  const [destinationCountry, setDestinationCountry] = useState('United States');

  const { data: availableCountries = [] } = useQuery({
    queryKey: ['available-destination-countries'],
    queryFn: getAvailableDestinationCountries,
    staleTime: 1000 * 60 * 60,
  });

  const priceValue = parseFloat(productPrice.replace(/[^0-9.-]+/g, ''));
  const isValidPrice = !isNaN(priceValue) && priceValue > 0;

  const { estimate: freightEstimate, loading: freightLoading, error: freightError } = useQuickFreightEstimate(
    isValidPrice ? priceValue : 1000,
    productCategory,
    productMOQ,
    productCountry,
    'United States'
  );

  const { data: htsCode, isLoading: htsLoading } = useQuery<{
    full_code?: string
    description?: string
    destination_rate?: number
    general_rate?: number
  } | null>({
    queryKey: ['product-hts-tariff', productId, destinationCountry],
    queryFn: () => getProductHTSWithTariff(productId, destinationCountry),
    enabled: !!productId && isValidPrice,
    staleTime: 1000 * 60 * 5,
  });

  if (!isValidPrice) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const estimatedDuty = htsCode && isValidPrice
    ? priceValue * ((htsCode.destination_rate ?? htsCode.general_rate) || 0)
    : null;

  const estimatedLandedCost = freightEstimate && isValidPrice && estimatedDuty !== null
    ? priceValue + ((freightEstimate.low + freightEstimate.high) / 2) + estimatedDuty
    : null;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F4A024]/10 rounded-lg">
            <Package className="w-5 h-5 text-[#F4A024]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-[#F4A024] transition-colors">
              Freight & Tariff Helper
            </h3>
            <p className="text-sm text-gray-400">
              Estimated shipping and duties to USA
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Destination Selector */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <label htmlFor="freight-destination" className="block text-sm text-gray-400 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Calculate costs for destination:
            </label>
            <select
              id="freight-destination"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-white focus:outline-none focus:border-[#F4A024]"
            >
              {availableCountries.length > 0 ? (
                availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))
              ) : (
                <option value="United States">United States</option>
              )}
            </select>
          </div>

          {freightLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-400">Calculating freight estimates...</span>
            </div>
          ) : freightError ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-400 mb-2">
                ⚠️ {freightError}
              </p>
              <p className="text-xs text-gray-400">
                Our freight calculator is currently unavailable, but you can still contact the supplier for shipping quotes.
              </p>
            </div>
          ) : freightEstimate ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm">Estimated Freight</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(freightEstimate.low)} - {formatCurrency(freightEstimate.high)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Most customers ship via {formatShippingMethod(freightEstimate.method)}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Transit Time</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {freightEstimate.transitDays}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    From {productCountry} to {destinationCountry}
                  </p>
                </div>
              </div>

              {htsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : htsCode ? (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">Tariff Information for {destinationCountry}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">HTS Code:</span>
                      <span className="text-sm font-mono text-white">{htsCode.full_code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Duty Rate:</span>
                      <span className="text-sm font-semibold text-[#F4A024]">
                        {(((htsCode.destination_rate ?? htsCode.general_rate) || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    {estimatedDuty !== null && estimatedDuty > 0 ? (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                        <span className="text-sm text-gray-400">Est. Duty Amount:</span>
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(estimatedDuty)}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-gray-700/50">
                        <p className="text-xs text-yellow-400">
                          No tariff data available for {destinationCountry}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    {htsCode.description}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-sm">Tariff Information</span>
                  </div>
                  <p className="text-sm text-yellow-400">
                    There is no HTS data yet for this product. Contact supplier for tariff details.
                  </p>
                </div>
              )}

              {estimatedLandedCost !== null && (
                <div className="bg-gradient-to-r from-[#F4A024]/10 to-[#F4A024]/5 rounded-lg p-4 border border-[#F4A024]/20">
                  <div className="flex items-center gap-2 text-[#F4A024] mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-semibold">Estimated Landed Cost</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {formatCurrency(estimatedLandedCost)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Includes product cost, freight, and estimated duties. Actual costs may vary.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  These estimates are based on typical shipping scenarios and current tariff rates.
                  Final costs depend on actual weight, packaging, chosen carrier, and any additional
                  services.                   Use our <Link href="/tools/freight-tariff-helper" className="text-[#F4A024] hover:underline">
                  Freight & Tariff Helper</Link> for a detailed breakdown with multiple products and shipping options.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                Freight estimates are not available for this product at the moment. Please contact the supplier directly for shipping quotes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
