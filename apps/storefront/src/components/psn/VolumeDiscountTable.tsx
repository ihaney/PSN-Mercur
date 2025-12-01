'use client'

import React from 'react';
import { Tag, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useVolumeDiscounts } from '@/hooks/usePricingTiers';
import { formatPrice } from '@/lib/helpers/priceFormatter';

interface VolumeDiscountTableProps {
  supplierId?: string;
  productId?: string;
  categoryId?: string;
  currentQuantity: number;
  basePrice: number;
  onQuantityChange?: (quantity: number) => void;
}

export default function VolumeDiscountTable({
  supplierId,
  productId,
  categoryId,
  currentQuantity,
  basePrice,
  onQuantityChange
}: VolumeDiscountTableProps) {
  const { data: discounts, isLoading } = useVolumeDiscounts({
    supplierId,
    productId,
    categoryId
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded w-48"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!discounts || discounts.length === 0) {
    return null;
  }

  const activeDiscounts = discounts.filter(d => {
    const today = new Date().toISOString().split('T')[0];
    return (!d.end_date || d.end_date >= today) && d.start_date <= today;
  });

  if (activeDiscounts.length === 0) {
    return null;
  }

  const calculateDiscountedPrice = (discount: typeof activeDiscounts[0]) => {
    if (discount.discount_type === 'percentage') {
      return basePrice - (basePrice * discount.discount_value / 100);
    }
    return basePrice - discount.discount_value;
  };

  const calculateSavings = (discount: typeof activeDiscounts[0]) => {
    const discountedPrice = calculateDiscountedPrice(discount);
    const savings = basePrice - discountedPrice;
    const savingsPercentage = (savings / basePrice) * 100;
    return { savings, savingsPercentage };
  };

  const applicableDiscount = activeDiscounts
    .filter(d => currentQuantity >= d.min_quantity)
    .sort((a, b) => b.min_quantity - a.min_quantity)[0];

  const nextDiscount = activeDiscounts.find(
    d => d.min_quantity > currentQuantity
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="bg-gradient-to-r from-[#F4A024]/20 to-yellow-500/20 p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F4A024]/20 rounded-lg">
              <Tag className="w-6 h-6 text-[#F4A024]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Volume Discounts</h3>
              <p className="text-sm text-gray-400">Save more when you buy more</p>
            </div>
          </div>
          {applicableDiscount && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Discount Active
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                Quantity Range
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                Discount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                Unit Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                You Save
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {activeDiscounts.map((discount, index) => {
              const isActive = applicableDiscount?.id === discount.id;
              const isNext = nextDiscount?.id === discount.id;
              const discountedPrice = calculateDiscountedPrice(discount);
              const { savings, savingsPercentage } = calculateSavings(discount);

              return (
                <tr
                  key={discount.id}
                  className={`transition-all ${
                    isActive
                      ? 'bg-[#F4A024]/10 hover:bg-[#F4A024]/15'
                      : isNext
                      ? 'bg-blue-500/5 hover:bg-blue-500/10'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <div className="w-2 h-2 bg-[#F4A024] rounded-full animate-pulse"></div>
                      )}
                      <span className="text-white font-medium">
                        {discount.min_quantity}+ units
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-[#F4A024]" />
                      <span className="text-[#F4A024] font-bold">
                        {discount.discount_type === 'percentage'
                          ? `${discount.discount_value}%`
                          : formatPrice(discount.discount_value.toString())}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-semibold">
                        {formatPrice(discountedPrice.toFixed(2))}
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(basePrice.toString())}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-green-400 font-semibold">
                        {formatPrice(savings.toFixed(2))}
                      </p>
                      <p className="text-xs text-gray-400">
                        ({savingsPercentage.toFixed(1)}% off)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F4A024] text-gray-900 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Applied
                      </span>
                    ) : isNext ? (
                      <button
                        onClick={() => onQuantityChange?.(discount.min_quantity)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm font-medium hover:bg-blue-500/30 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {discount.min_quantity - currentQuantity} more
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {discount.min_quantity - currentQuantity} more needed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {nextDiscount && (
        <div className="p-4 bg-blue-500/10 border-t border-blue-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-blue-300 font-medium">Next Discount Available</p>
              <p className="text-sm text-gray-400 mt-1">
                Add {nextDiscount.min_quantity - currentQuantity} more units to save an additional{' '}
                {nextDiscount.discount_type === 'percentage'
                  ? `${nextDiscount.discount_value}%`
                  : formatPrice(nextDiscount.discount_value.toString())}{' '}
                per unit
              </p>
            </div>
            {onQuantityChange && (
              <button
                onClick={() => onQuantityChange(nextDiscount.min_quantity)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Update Quantity
              </button>
            )}
          </div>
        </div>
      )}

      <div className="hidden sm:block">
        <div className="p-6 bg-gray-900/50 border-t border-gray-700/50">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Quantity</p>
              <p className="text-2xl font-bold text-white">{currentQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Unit Price</p>
              <p className="text-2xl font-bold text-[#F4A024]">
                {applicableDiscount
                  ? formatPrice(calculateDiscountedPrice(applicableDiscount).toFixed(2))
                  : formatPrice(basePrice.toString())}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Savings</p>
              <p className="text-2xl font-bold text-green-400">
                {applicableDiscount
                  ? formatPrice(
                      (calculateSavings(applicableDiscount).savings * currentQuantity).toFixed(2)
                    )
                  : formatPrice('0')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
