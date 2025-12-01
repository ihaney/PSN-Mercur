'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listSavedSuppliers, addSavedSupplier, removeSavedSupplier } from '@/lib/data/saved-suppliers';
import type { Supplier } from '@/types/psn';

/**
 * Hook for saved suppliers
 * Migrated from Supabase to use Medusa SDK via server actions
 */
export function useSavedSuppliers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['savedSuppliers'],
    queryFn: async () => {
      try {
        const result = await listSavedSuppliers();
        
        // Transform to legacy format for backward compatibility
        return (result.suppliers || []).map(supplier => ({
          id: supplier.id || supplier.seller_id,
          name: supplier.name || supplier.seller_name || 'Unknown Seller',
          description: supplier.description || '',
          website: supplier.website || supplier.metadata?.website || '',
          email: supplier.email || '',
          location: supplier.location || '',
          whatsapp: supplier.whatsapp || '',
          country: supplier.country || supplier.metadata?.country_name || 'Unknown',
          city: supplier.city || supplier.metadata?.city_name || '',
          sourceId: supplier.source_id || '',
          is_verified: supplier.is_verified || supplier.store_status === 'ACTIVE',
          logo: supplier.logo || '',
          profile_picture_url: supplier.photo || supplier.profile_picture_url || '',
          handle: supplier.handle || supplier.id?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
          photo: supplier.photo || supplier.profile_picture_url || null,
          tax_id: supplier.tax_id || '',
          created_at: supplier.created_at || new Date().toISOString(),
          metadata: {
            website: supplier.metadata?.website || supplier.website || null,
            country_name: supplier.metadata?.country_name || supplier.country || null,
            city_name: supplier.metadata?.city_name || supplier.city || null,
          },
          store_status: supplier.store_status || (supplier.is_verified ? 'ACTIVE' : 'INACTIVE'),
        })) as Supplier[];
      } catch (error) {
        console.error('Error fetching saved suppliers:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const toggleSavedSupplier = async (supplier: Supplier) => {
    // Optimistically update the cache
    const previousData = queryClient.getQueryData<Supplier[]>(['savedSuppliers']) || [];
    const isCurrentlySaved = previousData.some(item => item.id === supplier.id);

    queryClient.setQueryData(['savedSuppliers'], isCurrentlySaved
      ? previousData.filter(item => item.id !== supplier.id)
      : [...previousData, supplier]
    );

    try {
      const formData = new FormData();
      formData.append('seller_id', supplier.id);

      if (isCurrentlySaved) {
        const result = await removeSavedSupplier(formData);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await addSavedSupplier(formData);
        if (!result.success) throw new Error(result.error);
      }

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['savedSuppliers'] });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(['savedSuppliers'], previousData);
      throw error;
    }
  };

  return {
    ...query,
    toggleSavedSupplier
  };
}

