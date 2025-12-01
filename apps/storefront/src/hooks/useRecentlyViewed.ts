'use client'

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';

const RECENTLY_VIEWED_KEY = 'paisan_recently_viewed';
const MAX_RECENT = 20;

/**
 * Hook for recently viewed products
 * Uses localStorage to track viewed products
 */
export function useRecentlyViewed(limit: number = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const recent: Product[] = JSON.parse(stored);
        setProducts(recent.slice(0, limit));
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  return { data: products, isLoading };
}

/**
 * Add a product to recently viewed
 */
export function addToRecentlyViewed(product: Product) {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const recent: Product[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    const filtered = recent.filter(p => p.id !== product.id);
    
    // Add to beginning
    const updated = [product, ...filtered].slice(0, MAX_RECENT);
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recently viewed:', error);
  }
}

/**
 * Clear recently viewed products
 */
export function clearRecentlyViewed() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
}

