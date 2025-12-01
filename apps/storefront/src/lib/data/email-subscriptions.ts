'use server'

import { sdk } from '../config'
import { getAuthHeaders } from './cookies'
import { revalidatePath } from 'next/cache'

/**
 * Subscribe email to newsletter
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function subscribeEmail(email: string) {
  try {
    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/email-subscriptions`,
      {
        method: "POST",
        body: { 
          email: email.toLowerCase().trim(),
          consent_timestamp: new Date().toISOString(),
          is_active: true,
        },
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    // Handle duplicate email error
    if (error.message?.includes('duplicate') || error.message?.includes('already')) {
      return { success: false, error: 'This email is already subscribed!' }
    }
    return { success: false, error: error.message || 'Failed to subscribe' }
  }
}

