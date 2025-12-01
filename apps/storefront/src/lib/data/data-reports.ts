'use server'

import { sdk } from '../config'
import { getCurrentUser, getAuthHeaders } from './cookies'
import { revalidatePath } from 'next/cache'

/**
 * Submit data report
 * Uses Medusa SDK - Note: May need custom backend implementation for file uploads
 */
export async function submitDataReport(
  reportData: {
    pageType: string
    pageId?: string
    reportType: string
    description: string
    url: string
    contextData?: any
  },
  screenshots?: File[]
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    // Note: File uploads would need separate handling (multipart/form-data)
    // For now, send file metadata only
    const body = {
      ...reportData,
      screenshots: screenshots?.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })) || [],
    }

    await sdk.client.fetch(
      `/store/data-reports`,
      {
        method: "POST",
        body,
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit report' }
  }
}

/**
 * Check rate limit for data reports
 */
export async function checkDataReportRateLimit() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { allowed: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ allowed: boolean; remaining?: number }>(
      `/store/data-reports/rate-limit`,
      {
        method: "GET",
        headers,
        cache: "no-cache",
      }
    )

    return { allowed: response.allowed, remaining: response.remaining }
  } catch (error) {
    // If endpoint doesn't exist, allow by default
    return { allowed: true }
  }
}

