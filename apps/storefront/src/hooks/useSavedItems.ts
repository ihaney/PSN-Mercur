'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserWishlists, addWishlistItem, removeWishlistItem } from '@/lib/data/wishlist';
import type { Product } from '@/types/product';

/**
 * Hook for saved items (uses wishlist via Medusa SDK)
 * Migrated from Supabase to use server actions
 */
export function useSavedItems() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['savedItems'],
    queryFn: async () => {
      try {
        const result = await getUserWishlists();
        
        if (!result.wishlists || result.wishlists.length === 0) {
          return [];
        }

        // Transform wishlist items to Product format
        const products: Product[] = [];
        
        for (const wishlist of result.wishlists) {
          for (const item of wishlist.items || []) {
            const variant = item.variant || item.variant_id;
            const product = variant?.product || item.product;
            
            if (!product) continue;

            const calculatedPrice = variant?.calculated_price || product.variants?.[0]?.calculated_price;
            const priceAmount = calculatedPrice?.calculated_amount || calculatedPrice?.calculated_amount_with_tax || 0;
            const moq = variant?.metadata?.moq || product.metadata?.moq || null;

            products.push({
              id: product.id,
              title: product.title,
              name: product.title, // Legacy alias
              description: product.description || null,
              thumbnail: product.thumbnail || null,
              image: product.thumbnail || '', // Legacy alias
              variants: product.variants || [variant].filter(Boolean),
              categories: product.categories || [],
              category: product.categories?.[0]?.name || 'Unknown', // Legacy alias
              regions: product.regions || [],
              country: product.regions?.[0]?.name || 'Unknown', // Legacy alias
              seller: product.seller || variant?.seller,
              supplier: product.seller?.name || 'Unknown', // Legacy alias
              supplierId: product.seller?.id, // Legacy alias
              Product_Price: `$${(priceAmount / 100).toFixed(2)}`, // Legacy alias
              Product_MOQ: moq || '0', // Legacy alias
              sourceUrl: product.metadata?.source_url || '', // Legacy alias
              marketplace: product.metadata?.source_name || 'Unknown', // Legacy alias
              metadata: {
                moq: moq,
                source_name: product.metadata?.source_name || null,
              },
            } as Product);
          }
        }

        return products;
      } catch (error) {
        console.error('Error fetching saved items:', error);
        return [];
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('Must be logged in')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const toggleSavedItem = async (product: Product) => {
    // Get the first variant ID from the product
    const variantId = product.variants?.[0]?.id || product.id;

    // Optimistically update the cache
    const previousData = queryClient.getQueryData<Product[]>(['savedItems']) || [];
    const isCurrentlySaved = previousData.some(item => item.id === product.id);

    queryClient.setQueryData(['savedItems'], isCurrentlySaved
      ? previousData.filter(item => item.id !== product.id)
      : [...previousData, product]
    );

    try {
      if (isCurrentlySaved) {
        // Find wishlist item to remove
        const result = await getUserWishlists();
        const wishlist = result.wishlists?.[0];
        if (wishlist) {
          await removeWishlistItem({ 
            wishlist_id: wishlist.id, 
            product_id: product.id 
          });
        }
      } else {
        await addWishlistItem({ 
          reference_id: variantId, 
          reference: "product" 
        });
      }

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['savedItems'] });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(['savedItems'], previousData);
      throw error;
    }
  };

  return {
    ...query,
    toggleSavedItem
  };
}

