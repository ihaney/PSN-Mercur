'use client'

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types/product';
import { analytics } from '@/lib/analytics';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useBreadcrumbTracking } from '@/hooks/useBreadcrumbTracking';
import toast from 'react-hot-toast';
import { PRODUCT_CARD_SIZES } from '@/lib/helpers/imageOptimization';
import { formatPrice, isRequestQuotePrice } from '@/lib/helpers/priceFormatter';
import { createSupplierUrl } from '@/lib/helpers/urlHelpers';
import { getCurrentUser } from '@/lib/data/cookies';
import { sdk } from '@/lib/config';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}


export default function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: savedItems = [], toggleSavedItem } = useSavedItems();
  const { trackProductNavigation } = useBreadcrumbTracking();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isSaved = savedItems.some(item => item.id === product.id);

  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    setIsHovered(true);

    // TODO: Prefetch product details using Medusa SDK
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: async () => {
        try {
          // const response = await sdk.store.product.retrieve(product.id);
          // return response.product;
          return product;
        } catch (error) {
          console.error('Error prefetching product:', error);
          return product;
        }
      },
      staleTime: 1000 * 60 * 5
    });

    // TODO: Get seller info if available using Medusa SDK
    const sellerId = product.seller?.id;
    if (sellerId) {
      queryClient.prefetchQuery({
        queryKey: ['sellerContact', product.id],
        queryFn: async () => {
          try {
            // const response = await sdk.store.seller.retrieve(sellerId);
            // return response.seller;
            return null;
          } catch (error) {
            console.error('Error prefetching seller:', error);
            return null;
          }
        },
        staleTime: 1000 * 60 * 5
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Get product fields in Mercur format
  const productTitle = product.title || 'Untitled Product';
  const productImage = product.thumbnail || product.images?.[0]?.url || '/placeholder.png';
  const productPrice = product.variants?.[0]?.calculated_price?.calculated_amount?.toString() || 
                       product.variants?.[0]?.calculated_price?.calculated_amount_with_tax?.toString() ||
                       '0';
  const productCategory = product.categories?.[0]?.name || 'Unknown';
  const productCountry = product.regions?.[0]?.name || product.seller?.country_code || 'Unknown';
  const sellerName = product.seller?.name || 'Unknown';
  const sellerId = product.seller?.id;
  const marketplace = product.metadata?.source_name || 'Unknown';

  const handleClick = () => {
    // Track breadcrumb navigation
    trackProductNavigation(product.id, productTitle);

    // Track analytics
    analytics.trackEvent('product_click', {
      props: {
        product_id: product.id,
        product_name: productTitle,
        product_category: productCategory,
        product_country: productCountry,
        product_supplier: sellerName,
        product_source: marketplace,
        product_price: productPrice
      }
    });

    // TODO: Record view using Medusa SDK
    // sdk.client.fetch('/store/products/record-view', {
    //   method: 'POST',
    //   body: { product_id: product.id }
    // }).catch(err => console.error('Error recording product view:', err));

    // Navigate immediately
    router.push(`/${locale}/products/${product.id}`);
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        toast.error('Please log in to save items');
        return;
      }
      
      await toggleSavedItem(product);
      toast.success(isSaved ? 'Item removed from saved items' : 'Item saved successfully');
      
      // Track analytics
      analytics.trackEvent(isSaved ? 'item_unsaved' : 'item_saved', {
        props: {
          product_id: product.id,
          product_name: productTitle
        }
      });
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="group relative h-full">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer flex flex-col h-full card-glow rounded-xl overflow-hidden transition-all duration-300"
        onClick={handleClick}
        data-product-card
      >
        <div className="aspect-square overflow-hidden rounded-lg dark:bg-gray-800/50 light:bg-gray-100 backdrop-blur-sm relative">
          {!imageError ? (
            <Image
              src={productImage}
              alt={productTitle}
              fill
              sizes={PRODUCT_CARD_SIZES}
              className="object-cover object-center group-hover:scale-105 transition-all duration-300"
              onError={handleImageError}
              priority={priority}
            />
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:opacity-75 transition-opacity">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="text-xs sm:text-sm dark:text-gray-100 light:text-gray-900 mb-2 line-clamp-2 font-medium">{productTitle}</h3>
          <div className="mt-auto space-y-1.5 sm:space-y-2">
            <p className={`text-base sm:text-lg font-medium drop-shadow-[0_0_8px_rgba(244,160,36,0.3)] ${
              isRequestQuotePrice(productPrice)
                ? 'text-[#F4A024]'
                : 'text-[#F4A024]'
            }`}>
              {formatPrice(productPrice)}
            </p>
            <div className="flex flex-col gap-1.5">
              {/* Seller Name - Clickable */}
              {sellerId ? (
                <Link
                  href={`/${locale}${createSupplierUrl(sellerName, sellerId)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-2 py-1 dark:bg-gray-800 light:bg-gray-200 rounded-full dark:text-gray-300 light:text-gray-700 inline-flex items-center justify-center gap-1.5 hover:dark:bg-gray-700 hover:light:bg-gray-300 transition-colors"
                >
                  <span>{sellerName}</span>
                </Link>
              ) : (
                <span className="text-xs px-2 py-1 dark:bg-gray-800 light:bg-gray-200 rounded-full dark:text-gray-300 light:text-gray-700 inline-flex items-center justify-center gap-1.5">
                  <span>{sellerName}</span>
                </span>
              )}
              {/* Product Category - Clickable */}
              <Link
                href={`/${locale}/search?q=${encodeURIComponent(productCategory)}&mode=products`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-1 dark:bg-gray-800 light:bg-gray-200 rounded-full dark:text-gray-300 light:text-gray-700 inline-block text-center hover:dark:bg-gray-700 hover:light:bg-gray-300 transition-colors"
              >
                {productCategory}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6">
        <button
          onClick={handleSaveClick}
          className={`p-2 rounded-full transition-all duration-300 icon-glow ${
            isSaved
              ? 'dark:bg-gray-800/80 light:bg-gray-200/80 text-[#F4A024]'
              : 'dark:bg-gray-800/80 light:bg-gray-200/80 dark:text-gray-300 light:text-gray-600 hover:text-[#F4A024]'
          }`}
        >
          <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          <span className="sr-only">{isSaved ? 'Remove from saved' : 'Save item'}</span>
        </button>
      </div>
    </div>
  );
}

