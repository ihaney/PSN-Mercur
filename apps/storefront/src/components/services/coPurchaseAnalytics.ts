/**
 * Temporary stub for coPurchaseAnalytics service
 * TODO: Migrate full implementation from psn-a1-site-4
 */

interface CoPurchaseService {
  getCoPurchasedProducts: (productId: string, limit?: number) => Promise<any[]>
  getFallbackRecommendations: (
    productId: string,
    categoryName?: string,
    supplierId?: string,
    limit?: number
  ) => Promise<string[]>
  trackCoPurchase: (productId: string, coPurchasedProductId: string) => Promise<void>
  trackRecommendationView: (productId: string, recommendedProductIds: string[]) => Promise<void>
  trackRecommendationClick: (productId: string, clickedProductId: string, confidence: number) => Promise<void>
}

export const coPurchaseService: CoPurchaseService = {
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
  trackRecommendationView: async (productId: string, recommendedProductIds: string[]) => {
    // Stub implementation
    console.warn('trackRecommendationView not yet implemented')
  },
  trackRecommendationClick: async (productId: string, clickedProductId: string, confidence: number) => {
    // Stub implementation
    console.warn('trackRecommendationClick not yet implemented')
  },
}
