'use client'

import React from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Clock } from 'lucide-react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

interface RecentlyViewedProductsProps {
  limit?: number;
  className?: string;
}

export default function RecentlyViewedProducts({ limit = 8, className = '' }: RecentlyViewedProductsProps) {
  const { data: products = [], isLoading } = useRecentlyViewed(limit);

  if (isLoading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-[#F4A024]" />
        <h2 className="text-2xl font-bold dark:text-gray-100 light:text-gray-900">
          Recently Viewed
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={false}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
