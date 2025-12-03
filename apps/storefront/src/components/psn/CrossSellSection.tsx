'use client'

import React, { useEffect, useRef } from 'react';
import { useCrossSellProducts, trackRecommendationInteraction } from '@/hooks/useCrossSellProducts';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import type { Product } from '@/types/product';

interface CrossSellSectionProps {
  productId: string;
  title?: string;
  limit?: number;
}

export default function CrossSellSection({
  productId,
  title = "You might also like",
  limit = 6
}: CrossSellSectionProps) {
  const { data: products = [], isLoading } = useCrossSellProducts(productId, limit);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Track section view when it enters viewport
  useEffect(() => {
    if (!products.length || hasTrackedView.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            hasTrackedView.current = true;
            // Track view for all recommendations
            products.forEach((product) => {
              if (product.recommendation_id) {
                trackRecommendationInteraction(product.recommendation_id, 'view');
              }
            });
          }
        });
      },
      { threshold: 0.5, rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [products]);

  const handleProductClick = (product: any) => {
    // Track click
    if (product.recommendation_id) {
      trackRecommendationInteraction(product.recommendation_id, 'click');
    }
  };

  // Transform product data to Product type
  const transformProduct = (product: any): Product => ({
    id: Number(product.id) || Number(product.product_id) || 0,
    brand: product.brand || 'Unknown',
    handle: product.handle || String(product.id || product.product_id || ''),
    title: product.title || product.name || product.product_title || 'Untitled Product',
    name: product.name || product.product_title,
    size: product.size || '',
    price: Number(product.price) || Number(product.product_price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || Number(product.product_price) || 0,
    thumbnail: product.thumbnail || product.product_image_url || product.image || '/placeholder.png',
    created_at: product.created_at || new Date().toISOString(),
    images: product.images,
    variants: product.variants,
    categories: product.categories,
    regions: product.regions,
    seller: product.seller,
  });

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-themed">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-themed-card rounded-lg h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <div ref={sectionRef} className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-themed">{title}</h2>
        {products.length >= limit && (
          <button
            onClick={() => router.push(`/${locale}/products`)}
            className="flex items-center gap-2 text-[#F4A024] hover:text-[#d88f1f] transition-colors text-sm font-medium"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const productForCard = transformProduct(product);
          return (
            <div key={product.product_id || product.id} onClick={() => handleProductClick(product)}>
              <ProductCard product={productForCard} />
            </div>
          );
        })}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="lg:hidden overflow-x-auto -mx-4 px-4">
        <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
          {products.map((product) => {
            const productForCard = transformProduct(product);
            return (
              <div
                key={product.product_id || product.id}
                className="w-64 flex-shrink-0"
                onClick={() => handleProductClick(product)}
              >
                <ProductCard product={productForCard} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation attribution (small text) */}
      {products.length > 0 && (
        <div className="mt-4 text-xs text-themed-muted text-center">
          Recommendations based on similar products and customer preferences
        </div>
      )}
    </div>
  );
}
