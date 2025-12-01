'use client'

import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

interface RecentlyViewedProductsSectionProps {
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
}

export default function RecentlyViewedProductsSection({
  limit = 10,
  showHeader = true,
  showViewAll = false
}: RecentlyViewedProductsSectionProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: products, isLoading } = useRecentlyViewed(limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F4A024]/10 rounded-lg">
              <Clock className="w-6 h-6 text-[#F4A024]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Recently Viewed</h2>
              <p className="text-sm text-gray-400">Continue browsing where you left off</p>
            </div>
          </div>

          {showViewAll && (
            <button
              onClick={() => router.push(`/${locale}/recently-viewed`)}
              className="flex items-center gap-2 text-[#F4A024] hover:text-[#F4A024]/80 transition-colors font-medium"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={false} index={index} />
        ))}
      </div>
    </div>
  );
}
