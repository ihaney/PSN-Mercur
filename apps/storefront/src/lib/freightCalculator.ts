'use client'

/**
 * Temporary stub for freight calculator utilities
 * TODO: Migrate full implementation from psn-a1-site-4
 */
export function formatShippingMethod(method: string): string {
  return method || 'Standard Shipping'
}

export function getProductHTSWithTariff(productId: string, country: string) {
  return Promise.resolve(null)
}

export function getAvailableDestinationCountries() {
  return Promise.resolve(['United States'])
}

