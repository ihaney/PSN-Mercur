'use client'

import React, { useEffect, useRef } from 'react';
import { useCrossSellProducts, trackRecommendationInteraction } from '@/hooks/useCrossSellProducts';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

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
        {products.map((product) => (
          <div key={product.product_id} onClick={() => handleProductClick(product)}>
            <ProductCard
              id={product.product_id}
              name={product.product_title}
              price={product.product_price} // Changed from Product_Price
              Product_Price={product.product_price} // Legacy alias
              image={product.product_image_url}
              thumbnail={product.product_image_url} // Mercur format
              country="Unknown"
              category="Unknown"
              seller={product.seller_name || product.supplier_name} // Changed from supplier
              supplier={product.supplier_name} // Legacy alias
              sellerId={product.seller_id || product.supplier_id} // Changed from supplierId
              supplierId={product.supplier_id} // Legacy alias
              moq={product.product_moq || '1'} // Mercur format
              Product_MOQ={product.product_moq || '1'} // Legacy alias
              sourceUrl=""
              marketplace="Paisán"
            />
          </div>
        ))}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="lg:hidden overflow-x-auto -mx-4 px-4">
        <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
          {products.map((product) => (
            <div
              key={product.product_id}
              className="w-64 flex-shrink-0"
              onClick={() => handleProductClick(product)}
            >
              <ProductCard
                id={product.product_id}
                name={product.product_title}
                Product_Price={product.product_price}
                image={product.product_image_url}
                country="Unknown"
                category="Unknown"
                supplier={product.supplier_name}
                supplierId={product.supplier_id}
                Product_MOQ={product.product_moq || '1'}
                sourceUrl=""
                marketplace="Paisán"
              />
            </div>
          ))}
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
