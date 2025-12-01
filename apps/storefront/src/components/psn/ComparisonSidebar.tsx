'use client'

import React from 'react';
import { X, Scale, ArrowRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useProductComparison } from '@/hooks/useProductComparison';
import { formatPrice } from '@/lib/helpers/priceFormatter';
import Image from 'next/image';

export default function ComparisonSidebar() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const {
    comparisonItems,
    removeFromComparison,
    clearComparison,
    isOpen,
    setIsOpen,
    maxItems
  } = useProductComparison();

  if (!isOpen || comparisonItems.length === 0) return null;

  const handleCompare = () => {
    if (comparisonItems.length < 2) {
      return;
    }
    const ids = comparisonItems.map(p => p.id).join(',');
    router.push(`/${locale}/compare?products=${ids}`);
    setIsOpen(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed bottom-0 left-0 right-0 md:right-auto md:left-auto md:bottom-8 md:left-8 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-t-2xl md:rounded-2xl shadow-2xl z-50 md:w-96 transition-transform">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#F4A024]" />
            <h3 className="font-semibold text-gray-100">
              Compare Products ({comparisonItems.length}/{maxItems})
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {comparisonItems.map((product) => {
              const productImage = product.thumbnail || product.images?.[0]?.url || '/placeholder.png';
              const productName = product.title || product.name || 'Untitled Product';
              const productPrice = product.variants?.[0]?.calculated_price?.calculated_amount?.toString() || 
                                 product.variants?.[0]?.calculated_price?.calculated_amount_with_tax?.toString() ||
                                 '0';

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3"
                >
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">
                      {productName}
                    </p>
                    <p className="text-xs text-[#F4A024]">
                      {formatPrice(productPrice)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 space-y-2">
          {comparisonItems.length >= 2 && (
            <button
              onClick={handleCompare}
              className="w-full bg-[#F4A024] text-gray-900 py-3 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Compare Products
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {comparisonItems.length < 2 && (
            <p className="text-center text-sm text-gray-400 py-2">
              Add at least 2 products to compare
            </p>
          )}
          <button
            onClick={clearComparison}
            className="w-full bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
}

