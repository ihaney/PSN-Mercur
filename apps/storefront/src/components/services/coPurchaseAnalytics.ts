/**
 * Temporary stub for coPurchaseAnalytics service
 * TODO: Migrate full implementation from psn-a1-site-4
 */

export const coPurchaseService = {
  getCoPurchasedProducts: async (productId: string, limit: number = 6) => {
    // Stub implementation
    console.warn('getCoPurchasedProducts not yet implemented')
    return []
  },
  getFallbackRecommendations: async (
    productId: string,
    categoryName?: string,
    supplierId?: string,
    limit: number = 6
  ) => {
    // Stub implementation
    console.warn('getFallbackRecommendations not yet implemented')
    return []
  },
  trackCoPurchase: async (productId: string, coPurchasedProductId: string) => {
    // Stub implementation
    console.warn('trackCoPurchase not yet implemented')
  },
}
