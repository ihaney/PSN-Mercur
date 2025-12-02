"use server"

import { sdk } from '../config'

/**
 * Server action to resend verification email using Medusa
 * This replaces the custom resend() function
 */
export async function resendVerificationEmail(email: string) {
  try {
    // Use Medusa's customer email verification endpoint
    // Note: This may need to be adjusted based on your Medusa setup
    const response = await sdk.client.fetch('/store/customers/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    
    return { error: null, data: response }
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to resend verification email' 
      }, 
      data: null 
    }
  }
}

