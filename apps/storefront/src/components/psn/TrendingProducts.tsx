'use client'

import { useTrendingProducts } from '@/hooks/useTrendingProducts';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { Flame, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TrendingProductsProps {
  limit?: number;
  category?: string;
  showViewAll?: boolean;
}

function TrendingProducts({
  limit = 12,
  category,
  showViewAll = true
}: TrendingProductsProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: products, isLoading, error } = useTrendingProducts({ limit, category });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category ? `Trending in ${category}` : 'Trending Now'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Hot products gaining traction this week
              </p>
            </div>
          </div>
          {showViewAll && !category && (
            <Link
              href={`/${locale}/products?sort=trending`}
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
            >
              View All
              <TrendingUp className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-sm font-bold">
                <Flame className="h-4 w-4" />
                #{index + 1}
              </div>
              {product.trending_score && product.trending_score > 50 && (
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-lg text-xs font-semibold text-orange-600 dark:text-orange-400">
                  +{Math.round(product.trending_score)}%
                </div>
              )}
            </div>
          ))}
        </div>

        {products.length >= limit && showViewAll && category && (
          <div className="mt-8 text-center">
            <Link
              href={`/${locale}/products?category=${encodeURIComponent(category)}&sort=trending`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              View All Trending in {category}
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrendingProducts;
