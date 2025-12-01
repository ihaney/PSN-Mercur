'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components
 * This client handles browser-based authentication
 */
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Supabase features will be disabled.')
    // Return a mock client that won't crash but won't work
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Hook for accessing Supabase client in Client Components
 * Returns a singleton instance of the Supabase client
 */
export function useSupabaseClient() {
  if (typeof window === 'undefined') return null
  return createClientSupabaseClient()
}

// Export a default client instance for direct use
export const supabase = typeof window !== 'undefined' ? createClientSupabaseClient() : null

