'use server'

import { sdk } from '../config'
import { getCurrentUser, getAuthHeaders, getCacheOptions } from './cookies'
import { revalidatePath } from 'next/cache'

/**
 * List saved suppliers
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function listSavedSuppliers() {
  const user = await getCurrentUser()
  if (!user) {
    return { suppliers: [] }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("saved-suppliers")),
  }

  try {
    // Note: This endpoint may need to be implemented in the Medusa backend
    const response = await sdk.client.fetch<{ saved_suppliers: any[] }>(
      `/store/saved-suppliers`,
      {
        method: "GET",
        headers,
        next,
        cache: "force-cache",
      }
    )

    return { suppliers: response.saved_suppliers || [] }
  } catch (error) {
    console.error('Error fetching saved suppliers:', error)
    return { suppliers: [] }
  }
}

/**
 * Add saved supplier
 * Uses Medusa SDK
 */
export async function addSavedSupplier(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Must be logged in' }
  }

  const sellerId = formData.get('seller_id') || formData.get('supplier_id') as string

  if (!sellerId) {
    return { success: false, error: 'Seller ID is required' }
  }

  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
  }

  try {
    await sdk.client.fetch(
      `/store/saved-suppliers`,
      {
        method: "POST",
        body: { seller_id: sellerId },
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/saved-suppliers')
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save supplier',
    }
  }
}

/**
 * Remove saved supplier
 * Uses Medusa SDK
 */
export async function removeSavedSupplier(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Must be logged in' }
  }

  const sellerId = formData.get('seller_id') || formData.get('supplier_id') as string

  if (!sellerId) {
    return { success: false, error: 'Seller ID is required' }
  }

  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
  }

  try {
    await sdk.client.fetch(
      `/store/saved-suppliers/${sellerId}`,
      {
        method: "DELETE",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/saved-suppliers')
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to remove saved supplier',
    }
  }
}

