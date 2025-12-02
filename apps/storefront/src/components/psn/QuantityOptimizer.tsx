'use client'

import React, { useMemo, useState } from 'react';
import { Sparkles, TrendingUp, Calculator, Lightbulb, ChevronRight, Target, DollarSign } from 'lucide-react';
import { usePricingTiers, useVolumeDiscounts } from '@/hooks/usePricingTiers';
import { formatPrice } from '@/lib/helpers/priceFormatter';

interface QuantityOptimizerProps {
  productId: string;
  basePrice: number;
  currentQuantity: number;
  onQuantitySelect: (quantity: number) => void;
  supplierId?: string;
  categoryId?: string;
  maxQuantity?: number;
}

interface OptimalQuantity {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  savings: number;
  savingsPercentage: number;
  reason: string;
  costPerUnit: number;
}

export default function QuantityOptimizer({
  productId,
  basePrice,
  currentQuantity,
  onQuantitySelect,
  supplierId,
  categoryId,
  maxQuantity = 1000
}: QuantityOptimizerProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');

  const { tiers, getPriceForQuantity } = usePricingTiers(productId);
  const { data: volumeDiscounts } = useVolumeDiscounts({
    productId,
    supplierId,
    categoryId
  });

  const optimalQuantities = useMemo(() => {
    const quantities: OptimalQuantity[] = [];
    const tierBreakpoints = tiers.map(t => t.min_quantity);
    const discountBreakpoints = volumeDiscounts?.map(d => d.min_quantity) || [];
    const allBreakpoints = [...new Set([...tierBreakpoints, ...discountBreakpoints])].sort(
      (a, b) => a - b
    );

    allBreakpoints.forEach(breakpoint => {
      if (breakpoint > maxQuantity) return;

      let unitPrice = basePrice;
      const tier = getPriceForQuantity(breakpoint);
      if (tier) {
        unitPrice = tier.unit_price;
      }

      const discount = volumeDiscounts?.find(d => d.min_quantity <= breakpoint);
      if (discount) {
        const discountAmount =
          discount.discount_type === 'percentage'
            ? unitPrice * (discount.discount_value / 100)
            : discount.discount_value;
        unitPrice = Math.max(0, unitPrice - discountAmount);
      }

      const totalPrice = unitPrice * breakpoint;
      const baseTotalPrice = basePrice * breakpoint;
      const savings = baseTotalPrice - totalPrice;
      const savingsPercentage = (savings / baseTotalPrice) * 100;

      let reason = '';
      if (tier && discount) {
        reason = 'Best value: Volume pricing + discount';
      } else if (tier) {
        reason = 'Volume pricing tier unlocked';
      } else if (discount) {
        reason = 'Volume discount available';
      }

      quantities.push({
        quantity: breakpoint,
        unitPrice,
        totalPrice,
        savings,
        savingsPercentage,
        reason,
        costPerUnit: unitPrice
      });
    });

    return quantities.sort((a, b) => a.costPerUnit - b.costPerUnit).slice(0, 5);
  }, [tiers, volumeDiscounts, basePrice, getPriceForQuantity, maxQuantity]);

  const bestValue = optimalQuantities[0];
  const currentPricing = useMemo(() => {
    let unitPrice = basePrice;
    const tier = getPriceForQuantity(currentQuantity);
    if (tier) {
      unitPrice = tier.unit_price;
    }

    const discount = volumeDiscounts?.find(d => d.min_quantity <= currentQuantity);
    if (discount) {
      const discountAmount =
        discount.discount_type === 'percentage'
          ? unitPrice * (discount.discount_value / 100)
          : discount.discount_value;
      unitPrice = Math.max(0, unitPrice - discountAmount);
    }

    return {
      unitPrice,
      totalPrice: unitPrice * currentQuantity
    };
  }, [currentQuantity, basePrice, getPriceForQuantity, volumeDiscounts]);

  const calculateCustomQuantity = () => {
    const qty = parseInt(customQuantity);
    if (isNaN(qty) || qty <= 0 || qty > maxQuantity) return null;

    let unitPrice = basePrice;
    const tier = getPriceForQuantity(qty);
    if (tier) {
      unitPrice = tier.unit_price;
    }

    const discount = volumeDiscounts?.find(d => d.min_quantity <= qty);
    if (discount) {
      const discountAmount =
        discount.discount_type === 'percentage'
          ? unitPrice * (discount.discount_value / 100)
          : discount.discount_value;
      unitPrice = Math.max(0, unitPrice - discountAmount);
    }

    const totalPrice = unitPrice * qty;
    const baseTotalPrice = basePrice * qty;
    const savings = baseTotalPrice - totalPrice;
    const savingsPercentage = (savings / baseTotalPrice) * 100;

    return {
      quantity: qty,
      unitPrice,
      totalPrice,
      savings,
      savingsPercentage
    };
  };

  const customPricing = customQuantity ? calculateCustomQuantity() : null;

  if (optimalQuantities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Smart Quantity Optimizer</h3>
              <p className="text-sm text-gray-400">Find your best value</p>
            </div>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Custom Calculator
          </button>
        </div>

        {bestValue && (
          <div className="mb-6 p-5 bg-gradient-to-r from-[#F4A024]/20 to-yellow-500/20 border-2 border-[#F4A024] rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[#F4A024]" />
                  <span className="text-lg font-bold text-white">Best Value Recommendation</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Optimal Quantity</p>
                    <p className="text-2xl font-bold text-white">{bestValue.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Unit Price</p>
                    <p className="text-2xl font-bold text-[#F4A024]">
                      {formatPrice(bestValue.unitPrice.toFixed(2))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span>{bestValue.reason}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">You Save</p>
                <p className="text-3xl font-bold text-green-400">
                  {formatPrice(bestValue.savings.toFixed(2))}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {bestValue.savingsPercentage.toFixed(1)}% off
                </p>
                <button
                  onClick={() => onQuantitySelect(bestValue.quantity)}
                  className="mt-3 px-4 py-2 bg-[#F4A024] hover:bg-[#F4A024]/90 text-gray-900 rounded-lg font-medium transition-colors w-full"
                >
                  Select This Quantity
                </button>
              </div>
            </div>
          </div>
        )}

        {showCalculator && (
          <div className="mb-6 p-5 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-400" />
              Custom Quantity Calculator
            </h4>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                placeholder="Enter quantity..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => {
                  if (customPricing) {
                    onQuantitySelect(customPricing.quantity);
                  }
                }}
                disabled={!customPricing}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Calculate
              </button>
            </div>
            {customPricing && (
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Unit Price</p>
                    <p className="text-lg font-bold text-white">
                      {formatPrice(customPricing.unitPrice.toFixed(2))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Total Price</p>
                    <p className="text-lg font-bold text-white">
                      {formatPrice(customPricing.totalPrice.toFixed(2))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Savings</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatPrice(customPricing.savings.toFixed(2))}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Other Optimal Quantities
          </h4>
          <div className="space-y-3">
            {optimalQuantities.slice(1).map((option, index) => {
              const isBetterThanCurrent = option.costPerUnit < currentPricing.unitPrice;

              return (
                <button
                  key={index}
                  onClick={() => onQuantitySelect(option.quantity)}
                  className="w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-purple-500/50 rounded-lg transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-white">
                          {option.quantity} units
                        </span>
                        {isBetterThanCurrent && (
                          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs font-medium text-green-400">
                            Better Value
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{option.reason}</p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm text-gray-400 mb-1">Unit Price</p>
                      <p className="text-xl font-bold text-purple-400">
                        {formatPrice(option.unitPrice.toFixed(2))}
                      </p>
                      {option.savings > 0 && (
                        <p className="text-xs text-green-400 mt-1">
                          Save {formatPrice(option.savings.toFixed(2))}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-5 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Current Selection Analysis</h4>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Quantity</p>
                <p className="text-lg font-bold text-white">{currentQuantity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Unit Price</p>
                <p className="text-lg font-bold text-white">
                  {formatPrice(currentPricing.unitPrice.toFixed(2))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-lg font-bold text-white">
                  {formatPrice(currentPricing.totalPrice.toFixed(2))}
                </p>
              </div>
            </div>
            {bestValue && bestValue.quantity !== currentQuantity && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300">
                  {bestValue.costPerUnit < currentPricing.unitPrice ? (
                    <>
                      💡 You could save {formatPrice((currentPricing.unitPrice - bestValue.costPerUnit).toFixed(2))} per unit by
                      ordering {bestValue.quantity} units instead
                    </>
                  ) : (
                    <>
                      ✓ You&apos;re already getting a competitive price at this quantity
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
