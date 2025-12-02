'use client'

/**
 * Temporary stub for contact protection
 * TODO: Migrate full implementation from psn-a1-site-4
 */
export async function canContactSupplier(supplierId: string): Promise<boolean> {
  // For now, allow all contacts
  // TODO: Implement rate limiting and authentication checks
  return true
}

