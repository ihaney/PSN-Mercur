'use server'

import { sdk } from '../config'
import { getAuthHeaders } from './cookies'

/**
 * Search products
 * Uses Medusa SDK - Note: May need custom backend implementation or Meilisearch integration
 */
export async function searchProducts(query: string, filters?: {
  category?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
}) {
  const headers = { ...(await getAuthHeaders()) }
  
  try {
    const response = await sdk.client.fetch<{ products: any[] }>(
      `/store/search/products`,
      {
        method: "GET",
        query: { 
          q: query, 
          ...filters,
          limit: filters?.limit || 20,
        },
        headers,
        cache: "no-cache",
      }
    )
    
    return { products: response.products || [] }
  } catch (error) {
    console.error('Error searching products:', error)
    // Fallback to regular product list with query filter
    try {
      const response = await sdk.store.product.list({
        query: { q: query, limit: filters?.limit || 20 },
        headers,
      })
      return { products: response.products || [] }
    } catch (fallbackError) {
      console.error('Error in fallback product search:', fallbackError)
      return { products: [] }
    }
  }
}

/**
 * Search suppliers/sellers
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function searchSuppliers(query: string, filters?: {
  country?: string
  category?: string
  limit?: number
}) {
  const headers = { ...(await getAuthHeaders()) }
  
  try {
    const response = await sdk.client.fetch<{ sellers: any[] }>(
      `/store/search/sellers`,
      {
        method: "GET",
        query: { 
          q: query, 
          ...filters,
          limit: filters?.limit || 20,
        },
        headers,
        cache: "no-cache",
      }
    )
    
    return { sellers: response.sellers || [] }
  } catch (error) {
    console.error('Error searching suppliers:', error)
    // Fallback to regular seller list with query filter
    try {
      const response = await sdk.store.seller.list({
        query: { q: query, limit: filters?.limit || 20 },
        headers,
      })
      return { sellers: response.sellers || [] }
    } catch (fallbackError) {
      console.error('Error in fallback supplier search:', fallbackError)
      return { sellers: [] }
    }
  }
}

