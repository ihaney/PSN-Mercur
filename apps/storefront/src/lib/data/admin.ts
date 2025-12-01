'use server'

import { getCurrentUser } from './cookies'

/**
 * Check if current user is an admin
 * Uses Medusa SDK - checks user metadata or admin list
 */
export async function checkAdminStatus() {
  const user = await getCurrentUser()
  if (!user) {
    return { isAdmin: false }
  }

  // Check if user has admin role
  // This may need to check user metadata or a separate admin table
  // For now, check if user email is in admin list or has admin metadata
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  const isAdmin = user.metadata?.is_admin === true || 
                  adminEmails.includes(user.email || '')

  return { isAdmin }
}

