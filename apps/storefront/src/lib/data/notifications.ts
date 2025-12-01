'use server'

import { sdk } from '../config'
import { getCurrentUser, getAuthHeaders } from './cookies'
import { revalidatePath } from 'next/cache'

/**
 * Get notifications for current user
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function getNotifications(filters?: {
  type?: string
  read?: boolean
  archived?: boolean
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { notifications: [] }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const query: Record<string, any> = {}
    if (filters?.type) query.type = filters.type
    if (filters?.read !== undefined) query.read = filters.read
    if (filters?.archived !== undefined) query.archived = filters.archived

    const response = await sdk.client.fetch<{ notifications: any[] }>(
      `/store/notifications`,
      {
        method: "GET",
        query,
        headers,
        cache: "no-cache",
      }
    )

    return { notifications: response.notifications || [] }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { notifications: [] }
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/${id}/read`,
      {
        method: "PUT",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark notification as read' }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/read-all`,
      {
        method: "PUT",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark all notifications as read' }
  }
}

/**
 * Archive notification
 */
export async function archiveNotification(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/${id}/archive`,
      {
        method: "PUT",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to archive notification' }
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch(
      `/store/notifications/${id}`,
      {
        method: "DELETE",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete notification' }
  }
}

/**
 * Get snoozed notifications
 */
export async function getSnoozedNotifications() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { notifications: [] }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ notifications: any[] }>(
      `/store/notifications/snoozed`,
      {
        method: "GET",
        headers,
        cache: "no-cache",
      }
    )

    return { notifications: response.notifications || [] }
  } catch (error) {
    console.error('Error fetching snoozed notifications:', error)
    return { notifications: [] }
  }
}

/**
 * Snooze notification
 */
export async function snoozeNotification(id: string, until: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/${id}/snooze`,
      {
        method: "POST",
        body: { until },
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to snooze notification' }
  }
}

/**
 * Unsnooze notification
 */
export async function unsnoozeNotification(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch(
      `/store/notifications/${id}/snooze`,
      {
        method: "DELETE",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to unsnooze notification' }
  }
}

/**
 * Get notification groups
 */
export async function getNotificationGroups() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { groups: [] }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ groups: any[] }>(
      `/store/notifications/groups`,
      {
        method: "GET",
        headers,
        cache: "no-cache",
      }
    )

    return { groups: response.groups || [] }
  } catch (error) {
    console.error('Error fetching notification groups:', error)
    return { groups: [] }
  }
}

/**
 * Toggle notification group expanded state
 */
export async function toggleNotificationGroupExpanded(groupId: string, expanded: boolean) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/groups/${groupId}/expanded`,
      {
        method: "PUT",
        body: { expanded },
        headers,
        cache: "no-cache",
      }
    )

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle group expanded state' }
  }
}

/**
 * Mark notification group as read
 */
export async function markNotificationGroupAsRead(groupId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/groups/${groupId}/read`,
      {
        method: "PUT",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark group as read' }
  }
}

/**
 * Track notification delivery
 */
export async function trackNotificationDelivery(notificationId: string) {
  try {
    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/${notificationId}/delivery`,
      {
        method: "POST",
        headers,
        cache: "no-cache",
      }
    )

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to track delivery' }
  }
}

/**
 * Track notification interaction
 */
export async function trackNotificationInteraction(notificationId: string, action: string) {
  try {
    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    await sdk.client.fetch(
      `/store/notifications/${notificationId}/interaction`,
      {
        method: "POST",
        body: { action },
        headers,
        cache: "no-cache",
      }
    )

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to track interaction' }
  }
}

