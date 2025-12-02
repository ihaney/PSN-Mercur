'use client'

/**
 * Temporary stub for freight calculator hooks
 * TODO: Migrate full implementation from psn-a1-site-4
 */
export function useQuickFreightEstimate(
  price: number,
  category: string,
  moq: string,
  originCountry: string,
  destinationCountry: string
) {
  return {
    estimate: null,
    loading: false,
    error: 'Freight calculator not yet available'
  }
}

export function useProductHTSCode(productId: string, country: string) {
  return {
    data: null,
    isLoading: false
  }
}

