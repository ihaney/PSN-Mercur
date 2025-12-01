'use client'

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, searchSuppliers } from '@/lib/data/search';

/**
 * Debounce hook for search input
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for searching products and suppliers
 * Uses Medusa SDK
 */
export function useSearch(query: string, type: 'products' | 'suppliers' | 'all' = 'all') {
  const debouncedQuery = useDebouncedValue(query, 300);

  const productsQuery = useQuery({
    queryKey: ['search', 'products', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length > 2 && (type === 'products' || type === 'all'),
    staleTime: 1000 * 60 * 5,
  });

  const suppliersQuery = useQuery({
    queryKey: ['search', 'suppliers', debouncedQuery],
    queryFn: () => searchSuppliers(debouncedQuery),
    enabled: debouncedQuery.length > 2 && (type === 'suppliers' || type === 'all'),
    staleTime: 1000 * 60 * 5,
  });

  return {
    products: productsQuery.data?.products || [],
    suppliers: suppliersQuery.data?.sellers || [],
    isLoading: productsQuery.isLoading || suppliersQuery.isLoading,
    error: productsQuery.error || suppliersQuery.error,
  };
}

