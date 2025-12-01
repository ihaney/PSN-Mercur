'use client'

import { useRecommendations } from '@/hooks/useRecommendations';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { Sparkles } from 'lucide-react';

interface RecommendedProductsProps {
  type?: 'personalized' | 'related';
  productId?: string;
  limit?: number;
  excludeProductIds?: string[];
  title?: string;
  showReason?: boolean;
}

function RecommendedProducts({
  type = 'personalized',
  productId,
  limit = 12,
  excludeProductIds = [],
  title,
  showReason = true
}: RecommendedProductsProps) {
  const { recommendations, isLoading, error } = useRecommendations(type, {
    productId,
    limit,
    excludeProductIds
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  const defaultTitle = type === 'personalized'
    ? 'Recommended for You'
    : 'You Might Also Like';

  return (
    <section className="py-12">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          {title || defaultTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            {showReason && product.recommendationScore.reason && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {product.recommendationScore.reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendedProducts;
