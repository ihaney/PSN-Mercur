'use client'

import { useQuery } from '@tanstack/react-query';
import { checkAdminStatus } from '@/lib/data/admin';

/**
 * Hook for checking admin authentication status
 * Uses Medusa SDK
 */
export function useAdminAuth(requireAuth: boolean = true) {
  const query = useQuery({
    queryKey: ['adminStatus'],
    queryFn: async () => {
      const result = await checkAdminStatus();
      return result.isAdmin;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false,
  });

  return {
    isAdmin: query.data || false,
    loading: query.isLoading,
  };
}

