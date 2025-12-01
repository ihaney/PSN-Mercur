'use client'

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Award, Info, Zap } from 'lucide-react';
import { useQuantityPriceCalculator } from '@/hooks/usePricingTiers';
import { formatPrice } from '@/lib/helpers/priceFormatter';

interface DynamicPriceDisplayProps {
  productId: string;
  basePrice: number;
  quantity: number;
  showBreakdown?: boolean;
  showHistory?: boolean;
  highlightSavings?: boolean;
}

export default function DynamicPriceDisplay({
  productId,
  basePrice,
  quantity,
  showBreakdown = true,
  showHistory = false,
  highlightSavings = true
}: DynamicPriceDisplayProps) {
  const { calculateFinalPrice, isLoading, hasPricingOptions } = useQuantityPriceCalculator(
    productId,
    basePrice
  );

  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'same'>('same');
  const [animate, setAnimate] = useState(false);

  const pricing = calculateFinalPrice(quantity);
  const baseTotal = basePrice * quantity;
  const discountAmount = baseTotal - pricing.totalPrice;
  const hasDiscount = pricing.discount.type !== 'none';

  useEffect(() => {
    if (previousPrice !== null && previousPrice !== pricing.totalPrice) {
      setAnimate(true);
      setPriceChange(pricing.totalPrice < previousPrice ? 'down' : 'up');

      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
    setPreviousPrice(pricing.totalPrice);
  }, [pricing.totalPrice, previousPrice]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-16 bg-gray-700 rounded-lg"></div>
        <div className="h-24 bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-300 ${
          animate
            ? priceChange === 'down'
              ? 'border-green-500/50 shadow-lg shadow-green-500/20'
              : 'border-blue-500/50 shadow-lg shadow-blue-500/20'
            : hasDiscount
            ? 'border-[#F4A024]/50'
            : 'border-gray-700/50'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-400">
                {quantity} {quantity === 1 ? 'unit' : 'units'}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#F4A024]/20 border border-[#F4A024]/30 rounded-full">
                  <Zap className="w-3 h-3 text-[#F4A024]" />
                  <span className="text-xs font-medium text-[#F4A024]">
                    {pricing.discount.type === 'tier' ? 'Volume Pricing' : 'Volume Discount'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-4xl font-bold transition-all duration-300 ${
                    animate && priceChange === 'down'
                      ? 'text-green-400 scale-110'
                      : 'text-white'
                  }`}
                >
                  {formatPrice(pricing.totalPrice.toFixed(2))}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(baseTotal.toFixed(2))}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {formatPrice(pricing.unitPrice.toFixed(2))} per unit
                </span>
                {hasDiscount && basePrice > pricing.unitPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(basePrice.toString())} each
                  </span>
                )}
              </div>
            </div>
          </div>

          {highlightSavings && hasDiscount && (
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-400">You Save</span>
              </div>
              <div
                className={`text-3xl font-bold text-green-400 transition-all duration-300 ${
                  animate && priceChange === 'down' ? 'scale-110' : ''
                }`}
              >
                {formatPrice(discountAmount.toFixed(2))}
              </div>
              <div className="text-sm text-gray-400">
                {pricing.discount.percentage.toFixed(1)}% off
              </div>
            </div>
          )}
        </div>

        {showHistory && previousPrice !== null && previousPrice !== pricing.totalPrice && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-2 text-sm">
              {priceChange === 'down' ? (
                <>
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Price decreased by {formatPrice(Math.abs(pricing.totalPrice - previousPrice).toFixed(2))}
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">
                    Price increased by {formatPrice(Math.abs(pricing.totalPrice - previousPrice).toFixed(2))}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showBreakdown && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 space-y-4">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Price Breakdown
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Base Price ({quantity} units)</span>
              <span className="text-white font-medium">
                {formatPrice(baseTotal.toFixed(2))}
              </span>
            </div>

            {hasDiscount && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {pricing.discount.type === 'tier' ? 'Volume Pricing Discount' : 'Volume Discount'}
                    </span>
                    <div className="px-2 py-0.5 bg-[#F4A024]/20 border border-[#F4A024]/30 rounded text-xs text-[#F4A024]">
                      -{pricing.discount.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <span className="text-green-400 font-medium">
                    -{formatPrice(discountAmount.toFixed(2))}
                  </span>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              </>
            )}

            <div className="flex items-center justify-between text-base pt-2">
              <span className="text-white font-semibold">Final Price</span>
              <span className="text-2xl font-bold text-[#F4A024]">
                {formatPrice(pricing.totalPrice.toFixed(2))}
              </span>
            </div>
          </div>

          {hasDiscount && (
            <div className="pt-4 border-t border-gray-700/50">
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Award className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-400">Great Choice!</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You're saving {formatPrice((discountAmount / quantity).toFixed(2))} per unit with this quantity
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasDiscount && hasPricingOptions && (
            <div className="pt-4 border-t border-gray-700/50">
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400">Volume Discounts Available</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Increase your quantity to unlock special pricing
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Unit Price</p>
          <p className="text-xl font-bold text-white">
            {formatPrice(pricing.unitPrice.toFixed(2))}
          </p>
          {hasDiscount && (
            <p className="text-xs text-green-400 mt-1">
              Save {formatPrice((basePrice - pricing.unitPrice).toFixed(2))} each
            </p>
          )}
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Total Quantity</p>
          <p className="text-xl font-bold text-white">{quantity}</p>
          {hasDiscount && (
            <p className="text-xs text-[#F4A024] mt-1">
              {pricing.discount.type === 'tier' ? 'Tiered pricing' : 'Bulk discount'} applied
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
