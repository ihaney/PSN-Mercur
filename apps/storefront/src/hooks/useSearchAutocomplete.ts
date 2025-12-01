'use client'

import { useQuery } from '@tanstack/react-query';
import { useSearch } from './useSearch';

interface SearchAutocompleteResult {
  id: string;
  title: string;
  url: string;
  type: 'product' | 'supplier';
  image?: string;
}

/**
 * Hook for search autocomplete
 * Uses Medusa SDK via useSearch hook
 */
export function useSearchAutocomplete(
  query: string,
  options?: { enabled?: boolean }
) {
  const { products, suppliers, isLoading } = useSearch(query, 'all');

  const results = useQuery<SearchAutocompleteResult[]>({
    queryKey: ['search-autocomplete', query],
    queryFn: async () => {
      const results: SearchAutocompleteResult[] = [];

      // Add products
      products.forEach(product => {
        results.push({
          id: product.id,
          title: product.title || product.name || 'Untitled Product',
          url: `/products/${product.id}`,
          type: 'product',
          image: product.thumbnail || product.images?.[0]?.url,
        });
      });

      // Add suppliers
      suppliers.forEach(supplier => {
        const supplierId = supplier.id || supplier.Supplier_ID || '';
        const supplierName = supplier.name || supplier.Supplier_Title || 'Unknown Supplier';
        results.push({
          id: supplierId,
          title: supplierName,
          url: `/sellers/${supplierId}`,
          type: 'supplier',
          image: supplier.photo || supplier.profile_picture_url,
        });
      });

      return results.slice(0, 10); // Limit to 10 results
    },
    enabled: (options?.enabled !== false) && query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: results.data || [],
    isLoading: isLoading || results.isLoading,
  };
}

// Recent searches management
const RECENT_SEARCHES_KEY = 'paisan_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function addRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading recent searches:', error);
    return [];
  }
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
}

