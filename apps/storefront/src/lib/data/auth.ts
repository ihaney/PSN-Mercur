'use server'

import { sdk } from '../config'
import { setAuthToken, removeAuthToken } from './cookies'
import { revalidatePath } from 'next/cache'

/**
 * Sign in user
 * Uses Medusa SDK
 */
export async function signIn(email: string, password: string) {
  try {
    const token = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })

    await setAuthToken(token as string)

    const headers = {
      authorization: `Bearer ${token}`,
    }

    const { customer } = await sdk.store.customer.retrieve({}, {}, headers)

    revalidatePath('/')
    return { success: true, customer, token }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sign in' }
  }
}

/**
 * Sign up new user
 * Uses Medusa SDK
 */
export async function signUp(email: string, password: string, metadata?: any) {
  try {
    // Register auth
    const token = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    })

    await setAuthToken(token as string)

    const headers = {
      authorization: `Bearer ${token}`,
    }

    // Create customer profile
    const { customer } = await sdk.store.customer.create(
      {
        email,
        metadata,
      },
      {},
      headers
    )

    revalidatePath('/')
    return { success: true, customer, token }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sign up' }
  }
}

/**
 * Sign out user
 * Uses Medusa SDK
 */
export async function signOut() {
  try {
    await sdk.auth.logout()
    await removeAuthToken()
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sign out' }
  }
}

/**
 * Reset password
 * Uses Medusa SDK
 */
export async function resetPassword(email: string) {
  try {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send reset email' }
  }
}

/**
 * Resend verification email
 * Uses Medusa SDK
 */
export async function resendVerificationEmail(email: string) {
  try {
    // Note: This endpoint may need to be implemented in the Medusa backend
    await sdk.client.fetch('/store/auth/resend-verification', {
      method: 'POST',
      body: { email },
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to resend verification email' }
  }
}

