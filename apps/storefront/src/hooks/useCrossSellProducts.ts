'use client'

import type { Product } from '@/types/product'

/**
 * Temporary stub for useCrossSellProducts hook
 * TODO: Migrate full implementation from psn-a1-site-4
 */

export function useCrossSellProducts(productId: string, limit: number = 4) {
  return {
    data: [] as (Product & { recommendation_id?: string; product_id?: string })[],
    products: [] as (Product & { recommendation_id?: string; product_id?: string })[],
    isLoading: false,
    error: null,
  }
}

export function useFrequentlyBoughtTogether(productId: string, limit: number = 4) {
  return {
    data: [],
    products: [],
    isLoading: false,
    error: null,
  }
}

export function trackRecommendationInteraction(productId: string, recommendationType: string) {
  // Stub implementation
  console.warn('trackRecommendationInteraction not yet implemented')
}

