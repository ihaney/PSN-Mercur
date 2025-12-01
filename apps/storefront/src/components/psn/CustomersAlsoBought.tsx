'use client'

import React, { useEffect, useState } from 'react';
import { ShoppingBag, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { coPurchaseService } from '../services/coPurchaseAnalytics';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import type { Product } from '../types';

interface CustomersAlsoBoughtProps {
  productId: string;
  categoryName?: string;
  supplierId?: string;
  limit?: number;
}

export default function CustomersAlsoBought({
  productId,
  categoryName,
  supplierId,
  limit = 6
}: CustomersAlsoBoughtProps) {
  const [trackedView, setTrackedView] = useState(false);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['customersAlsoBought', productId, limit],
    queryFn: async () => {
      const { data: relationships, error: relError } = await supabase
        .from('customers_also_bought')
        .select('also_bought_product_id, confidence_score')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (relError) throw relError;

      if (!relationships || relationships.length === 0) {
        const fallbackIds = await coPurchaseService.getFallbackRecommendations(
          productId,
          categoryName,
          supplierId,
          limit
        );

        if (fallbackIds.length === 0) return [];

        const { data: fallbackProducts, error: fallbackError } = await supabase
          .from('Products')
          .select(`
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_Category_Name,
            Product_Country_Name,
            Product_MOQ,
            Supplier_Title,
            Supplier_ID,
            Product_Source_Name,
            Countries:Product_Country_ID (
              Country_Image
            )
          `)
          .in('Product_ID', fallbackIds);

        if (fallbackError) throw fallbackError;

        // Transform to Mercur format
        return {
          products: fallbackProducts?.map((p: any) => {
            const variant = {
              id: p.Product_ID || '',
              calculated_price: p.Product_Price ? {
                calculated_amount: parseFloat(p.Product_Price) || 0,
                calculated_amount_with_tax: parseFloat(p.Product_Price) || 0,
                currency_code: 'USD',
              } : null,
              metadata: { moq: p.Product_MOQ || null },
            }

            const seller = p.Supplier_ID ? {
              id: p.Supplier_ID,
              name: p.Supplier_Title || '',
              handle: p.Supplier_ID.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            } : undefined

            return {
              id: p.Product_ID,
              title: p.Product_Title || 'Untitled Product',
              name: p.Product_Title || 'Untitled Product', // Legacy alias
              description: null,
              thumbnail: p.Product_Image_URL || null,
              image: p.Product_Image_URL || '', // Legacy alias
              variants: [variant],
              categories: p.Product_Category_ID ? [{ id: p.Product_Category_ID, name: p.Product_Category_Name || '' }] : [],
              category: p.Product_Category_Name || 'Unknown', // Legacy alias
              regions: p.Product_Country_ID ? [{ id: p.Product_Country_ID, name: p.Product_Country_Name || '' }] : [],
              country: p.Product_Country_Name || 'Unknown', // Legacy alias
              countryImage: p.Countries?.Country_Image || undefined,
              seller,
              supplier: p.Supplier_Title || 'Unknown', // Legacy alias
              supplierId: p.Supplier_ID, // Legacy alias
              Product_Price: p.Product_Price || '', // Legacy alias
              Product_MOQ: p.Product_MOQ || '0', // Legacy alias
              marketplace: p.Product_Source_Name || 'Unknown', // Legacy alias
              sourceUrl: '', // Legacy alias
              metadata: {
                moq: p.Product_MOQ || null,
                source_name: p.Product_Source_Name || null,
              },
            } as Product
          }) || [],
          confidenceScores: {},
          isFallback: true
        };
      }

      const productIds = relationships.map(r => r.also_bought_product_id);
      const confidenceMap = relationships.reduce((acc, r) => {
        acc[r.also_bought_product_id] = r.confidence_score;
        return acc;
      }, {} as Record<string, number>);

      const { data: products, error: prodError } = await supabase
        .from('Products')
        .select(`
          Product_ID,
          Product_Title,
          Product_Price,
          Product_Image_URL,
          Product_Category_Name,
          Product_Country_Name,
          Product_MOQ,
          Supplier_Title,
          Supplier_ID,
          Product_Source_Name,
          Countries:Product_Country_ID (
            Country_Image
          )
        `)
        .in('Product_ID', productIds);

      if (prodError) throw prodError;

      // Transform to Mercur format
      return {
        products: products?.map((p: any) => {
          const variant = {
            id: p.Product_ID || '',
            calculated_price: p.Product_Price ? {
              calculated_amount: parseFloat(p.Product_Price) || 0,
              calculated_amount_with_tax: parseFloat(p.Product_Price) || 0,
              currency_code: 'USD',
            } : null,
            metadata: { moq: p.Product_MOQ || null },
          }

          const seller = p.Supplier_ID ? {
            id: p.Supplier_ID,
            name: p.Supplier_Title || '',
            handle: p.Supplier_ID.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          } : undefined

          return {
            id: p.Product_ID,
            title: p.Product_Title || 'Untitled Product',
            name: p.Product_Title || 'Untitled Product', // Legacy alias
            description: null,
            thumbnail: p.Product_Image_URL || null,
            image: p.Product_Image_URL || '', // Legacy alias
            variants: [variant],
            categories: p.Product_Category_ID ? [{ id: p.Product_Category_ID, name: p.Product_Category_Name || '' }] : [],
            category: p.Product_Category_Name || 'Unknown', // Legacy alias
            regions: p.Product_Country_ID ? [{ id: p.Product_Country_ID, name: p.Product_Country_Name || '' }] : [],
            country: p.Product_Country_Name || 'Unknown', // Legacy alias
            countryImage: p.Countries?.Country_Image || undefined,
            seller,
            supplier: p.Supplier_Title || 'Unknown', // Legacy alias
            supplierId: p.Supplier_ID, // Legacy alias
            Product_Price: p.Product_Price || '', // Legacy alias
            Product_MOQ: p.Product_MOQ || '0', // Legacy alias
            marketplace: p.Product_Source_Name || 'Unknown', // Legacy alias
            sourceUrl: '', // Legacy alias
            metadata: {
              moq: p.Product_MOQ || null,
              source_name: p.Product_Source_Name || null,
            },
          } as Product
        }) || [],
        confidenceScores: confidenceMap,
        isFallback: false
      };
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 10
  });

  useEffect(() => {
    if (recommendations?.products && recommendations.products.length > 0 && !trackedView) {
      const productIds = recommendations.products.map(p => p.id);
      coPurchaseService.trackRecommendationView(productId, productIds);
      setTrackedView(true);
    }
  }, [recommendations, productId, trackedView]);

  const handleProductClick = (clickedProductId: string) => {
    const confidence = recommendations?.confidenceScores?.[clickedProductId] || 0;
    coPurchaseService.trackRecommendationClick(productId, clickedProductId, confidence);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!recommendations?.products || recommendations.products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F4A024]/10 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-[#F4A024]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {recommendations.isFallback ? 'You May Also Like' : 'Customers Also Bought'}
            </h2>
            <p className="text-sm text-gray-400">
              {recommendations.isFallback
                ? 'Similar products from our catalog'
                : 'Products frequently purchased together'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
        {recommendations.products.map((product, index) => {
          const confidence = recommendations.confidenceScores?.[product.id];
          return (
            <div key={product.id} className="relative" onClick={() => handleProductClick(product.id)}>
              {!recommendations.isFallback && confidence && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-lg text-xs font-medium text-white flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {Math.round(confidence * 100)}% match
                </div>
              )}
              <ProductCard product={product} priority={false} index={index} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
