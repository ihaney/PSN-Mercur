'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addWishlistItem, removeWishlistItem } from '@/lib/data/wishlist'
import { toast } from '@/lib/helpers/toast'
import type { Wishlist } from '@/types/wishlist'

interface UseWishlistToggleProps {
  productId: string
  wishlist?: Wishlist[]
  user: any | null
}

export function useWishlistToggle({ productId, wishlist, user }: UseWishlistToggleProps) {
  const queryClient = useQueryClient()
  
  // Check if product is in wishlist
  const isInWishlist = wishlist?.some((w) => 
    w.products?.some((item: any) => 
      item.id === productId || item.product_id === productId
    )
  ) || false

  // Get wishlist ID (assumes first wishlist or default)
  const wishlistId = wishlist?.[0]?.id

  // Add to wishlist mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      await addWishlistItem({
        reference_id: productId,
        reference: 'product',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success({ title: 'Added to wishlist' })
    },
    onError: (error) => {
      console.error('Error adding to wishlist:', error)
      toast.error({ title: 'Failed to add to wishlist' })
    },
  })

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!wishlistId) {
        throw new Error('Wishlist ID not found')
      }
      await removeWishlistItem({
        wishlist_id: wishlistId,
        product_id: productId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success({ title: 'Removed from wishlist' })
    },
    onError: (error) => {
      console.error('Error removing from wishlist:', error)
      toast.error({ title: 'Failed to remove from wishlist' })
    },
  })

  const toggle = async () => {
    if (!user) {
      toast.error({ title: 'Please log in to use wishlist' })
      return
    }

    if (isInWishlist) {
      await removeMutation.mutateAsync()
    } else {
      await addMutation.mutateAsync()
    }
  }

  return {
    isInWishlist,
    toggle,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isLoading: addMutation.isPending || removeMutation.isPending,
  }
}

