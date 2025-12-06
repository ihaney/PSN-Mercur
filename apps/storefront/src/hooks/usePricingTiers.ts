'use client'

import { useQuery } from '@tanstack/react-query'

export interface PricingTier {
  id?: string
  min_quantity: number
  max_quantity?: number
  unit_price: number
  tier_name?: string
  minQuantity?: number
  maxQuantity?: number
  price?: number
}

export interface VolumeDiscount {
  quantity: number
  discount: number
  price: number
  min_quantity?: number
}

interface UseVolumeDiscountsParams {
  productId: string
  supplierId?: string
  categoryId?: string
}

/**
 * Hook to fetch and manage pricing tiers for a product
 */
export function usePricingTiers(productId: string) {
  const { data: tiers = [], isLoading } = useQuery<PricingTier[]>({
    queryKey: ['pricingTiers', productId],
    queryFn: async () => {
      // TODO: Implement actual API call to fetch pricing tiers
      console.warn('usePricingTiers not yet implemented')
      return []
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const getPriceForQuantity = (quantity: number): PricingTier | null => {
    if (!tiers || tiers.length === 0) return null
    
    // Find the appropriate tier for the quantity
    const tier = tiers.find(
      (t) => {
        const minQty = t.min_quantity || t.minQuantity || 0
        const maxQty = t.max_quantity || t.maxQuantity
        return quantity >= minQty && (!maxQty || quantity <= maxQty)
      }
    )
    
    return tier || null
  }

  const calculateSavings = (quantity: number, basePrice: number): { totalSavings: number; savingsPercentage: number } => {
    const tier = getPriceForQuantity(quantity)
    if (!tier || basePrice === 0) return { totalSavings: 0, savingsPercentage: 0 }
    
    const tierPrice = tier.unit_price || tier.price || 0
    const totalSavings = (basePrice - tierPrice) * quantity
    const savingsPercentage = basePrice > 0 ? ((basePrice - tierPrice) / basePrice) * 100 : 0
    
    return { totalSavings, savingsPercentage }
  }

  return {
    tiers,
    getPriceForQuantity,
    calculateSavings,
    isLoading,
  }
}

/**
 * Hook to fetch volume discounts for a product
 */
export function useVolumeDiscounts(params: UseVolumeDiscountsParams) {
  const { productId, supplierId, categoryId } = params
  const { data: volumeDiscounts = [], isLoading } = useQuery<VolumeDiscount[]>({
    queryKey: ['volumeDiscounts', productId, supplierId, categoryId],
    queryFn: async () => {
      // TODO: Implement actual API call to fetch volume discounts
      console.warn('useVolumeDiscounts not yet implemented')
      return []
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    data: volumeDiscounts,
    discounts: volumeDiscounts,
    isLoading,
  }
}

/**
 * Hook to calculate price based on quantity with pricing tiers
 */
export function useQuantityPriceCalculator(productId: string, basePrice: number) {
  const { tiers, getPriceForQuantity, isLoading } = usePricingTiers(productId)

  const calculatePrice = (quantity: number): { price: number; savings: number; basePrice: number } => {
    const tier = getPriceForQuantity(quantity)
    const tierPrice = tier?.unit_price || tier?.price || basePrice
    const totalPrice = tierPrice * quantity
    const savings = (basePrice - tierPrice) * quantity

    return {
      price: totalPrice,
      savings: savings > 0 ? savings : 0,
      basePrice: basePrice * quantity,
    }
  }

  const calculateFinalPrice = (quantity: number): {
    totalPrice: number
    unitPrice: number
    discount: {
      type: 'tier' | 'volume' | 'none'
      percentage: number
      amount: number
    }
  } => {
    const tier = getPriceForQuantity(quantity)
    const tierPrice = tier?.unit_price || tier?.price || basePrice
    const totalPrice = tierPrice * quantity
    const unitPrice = tierPrice
    const hasDiscount = tier && tierPrice < basePrice
    const discountAmount = hasDiscount ? (basePrice - tierPrice) * quantity : 0
    const discountPercentage = hasDiscount && basePrice > 0 ? ((basePrice - tierPrice) / basePrice) * 100 : 0

    return {
      totalPrice,
      unitPrice,
      discount: {
        type: hasDiscount ? (tier ? 'tier' : 'volume') : 'none',
        percentage: discountPercentage,
        amount: discountAmount,
      },
    }
  }

  const hasPricingOptions = tiers && tiers.length > 0

  return {
    calculatePrice,
    calculateFinalPrice,
    tiers,
    isLoading,
    hasPricingOptions,
  }
}

