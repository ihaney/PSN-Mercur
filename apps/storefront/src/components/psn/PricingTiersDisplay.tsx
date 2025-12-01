'use client'

import React from 'react';
import { TrendingDown, Package } from 'lucide-react';
import { usePricingTiers } from '@/hooks/usePricingTiers';
import { formatPrice } from '@/lib/helpers/priceFormatter';

interface PricingTiersDisplayProps {
  productId: string;
  basePrice: number;
  currentQuantity?: number;
}

export default function PricingTiersDisplay({
  productId,
  basePrice,
  currentQuantity = 1
}: PricingTiersDisplayProps) {
  const { tiers, getPriceForQuantity, calculateSavings, isLoading } = usePricingTiers(productId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!tiers || tiers.length === 0) {
    return null;
  }

  const currentTier = getPriceForQuantity(currentQuantity);
  const savings = calculateSavings(currentQuantity, basePrice);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-5 h-5 text-[#F4A024]" />
        <h3 className="text-lg font-semibold text-white">Volume Pricing</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-400">Buy more, save more!</p>
      </div>

      <div className="space-y-3">
        {tiers.map((tier, index) => {
          const isCurrentTier = currentTier?.id === tier.id;
          const savingsAmount = ((basePrice - tier.unit_price) / basePrice) * 100;

          return (
            <div
              key={tier.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrentTier
                  ? 'border-[#F4A024] bg-[#F4A024]/10'
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">
                    {tier.tier_name || `Tier ${index + 1}`}
                  </span>
                  {isCurrentTier && (
                    <span className="text-xs px-2 py-1 bg-[#F4A024] text-gray-900 rounded-full font-medium">
                      Current
                    </span>
                  )}
                </div>
                {savingsAmount > 0 && (
                  <span className="text-sm text-green-400 font-medium">
                    Save {savingsAmount.toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {tier.min_quantity}
                    {tier.max_quantity ? ` - ${tier.max_quantity}` : '+'} units
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#F4A024]">
                    {formatPrice(tier.unit_price.toString())}
                  </p>
                  <p className="text-xs text-gray-400">per unit</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {savings && savings.totalSavings > 0 && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-green-400 font-medium">Your savings at {currentQuantity} units:</span>
            <span className="text-xl font-bold text-green-400">
              {formatPrice(savings.totalSavings.toFixed(2))}
            </span>
          </div>
        </div>
      )}

      {currentTier && tiers[tiers.length - 1].id !== currentTier.id && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            Add{' '}
            {tiers.find(t => t.min_quantity > currentQuantity)?.min_quantity! - currentQuantity} more
            units to unlock the next tier
          </p>
        </div>
      )}
    </div>
  );
}
