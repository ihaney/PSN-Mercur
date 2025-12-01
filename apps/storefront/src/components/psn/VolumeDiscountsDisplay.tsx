'use client'

import React from 'react';
import { Tag, TrendingDown, Percent } from 'lucide-react';
import { useVolumeDiscounts } from '@/hooks/usePricingTiers';
import { formatPrice } from '@/lib/helpers/priceFormatter';

interface VolumeDiscountsDisplayProps {
  supplierId?: string;
  productId?: string;
  categoryId?: string;
  currentQuantity?: number;
}

export default function VolumeDiscountsDisplay({
  supplierId,
  productId,
  categoryId,
  currentQuantity = 1
}: VolumeDiscountsDisplayProps) {
  const { data: discounts, isLoading } = useVolumeDiscounts({
    supplierId,
    productId,
    categoryId
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-16 bg-gray-700 rounded"></div>
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

  const applicableDiscount = activeDiscounts.find(
    d => currentQuantity >= d.min_quantity
  );

  return (
    <div className="bg-gradient-to-r from-[#F4A024]/10 to-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-[#F4A024]/30">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-[#F4A024]" />
        <h3 className="text-lg font-semibold text-white">Volume Discounts Available</h3>
      </div>

      <div className="space-y-3">
        {activeDiscounts.map((discount) => {
          const isApplied = applicableDiscount?.id === discount.id;

          return (
            <div
              key={discount.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isApplied
                  ? 'border-[#F4A024] bg-[#F4A024]/20'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {discount.discount_type === 'percentage' ? (
                      <Percent className="w-4 h-4 text-[#F4A024]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[#F4A024]" />
                    )}
                    <span className="font-medium text-white">
                      Buy {discount.min_quantity}+ units
                    </span>
                    {isApplied && (
                      <span className="text-xs px-2 py-1 bg-[#F4A024] text-gray-900 rounded-full font-medium">
                        Applied
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {discount.product_id
                      ? 'Product-specific discount'
                      : discount.category_id
                      ? 'Category discount'
                      : 'Supplier-wide discount'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-[#F4A024]">
                    {discount.discount_type === 'percentage' ? (
                      <>{discount.discount_value}% OFF</>
                    ) : (
                      <>{formatPrice(discount.discount_value.toString())} OFF</>
                    )}
                  </p>
                </div>
              </div>

              {discount.end_date && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Offer ends: {new Date(discount.end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!applicableDiscount && activeDiscounts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            Add {activeDiscounts[0].min_quantity - currentQuantity} more units to unlock volume
            discounts!
          </p>
        </div>
      )}

      {applicableDiscount && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-green-400 font-medium">Discount applied:</span>
            <span className="text-xl font-bold text-green-400">
              {applicableDiscount.discount_type === 'percentage'
                ? `${applicableDiscount.discount_value}% OFF`
                : formatPrice((applicableDiscount.discount_value * currentQuantity).toString())}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
