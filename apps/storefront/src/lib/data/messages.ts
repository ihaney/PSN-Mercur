'use server'

import { sdk } from '../config'
import { getCurrentUser, getAuthHeaders } from './cookies'
import { revalidatePath } from 'next/cache'

/**
 * Get conversations for current user
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function getConversations() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { conversations: [] }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ conversations: any[] }>(
      `/store/conversations`,
      {
        method: "GET",
        headers,
        cache: "no-cache",
      }
    )

    return { conversations: response.conversations || [] }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return { conversations: [] }
  }
}

/**
 * Get messages for a conversation
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function getMessages(conversationId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { messages: [], error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ messages: any[] }>(
      `/store/messages/${conversationId}`,
      {
        method: "GET",
        headers,
        cache: "no-cache",
      }
    )

    return { messages: response.messages || [] }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { messages: [] }
  }
}

/**
 * Send a message
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function sendMessage(conversationId: string, content: string, attachments?: File[]) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    // Note: File uploads would need separate handling
    const response = await sdk.client.fetch(
      `/store/messages/${conversationId}`,
      {
        method: "POST",
        body: {
          content,
          attachments: attachments?.map(f => f.name) || [],
        },
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/messages')
    return { success: true, message: response }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send message' }
  }
}

/**
 * Create a new conversation
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function createConversation(sellerId: string, subject?: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Must be logged in' }
    }

    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    }

    const response = await sdk.client.fetch<{ conversation: { id: string } }>(
      `/store/conversations`,
      {
        method: "POST",
        body: { seller_id: sellerId, subject },
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/messages')
    return { success: true, conversation: response.conversation }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create conversation' }
  }
}

/**
 * Mark message as read
 * Uses Medusa SDK - Note: May need custom backend implementation
 */
export async function markMessageRead(messageId: string) {
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
      `/store/messages/${messageId}/read`,
      {
        method: "PUT",
        headers,
        cache: "no-cache",
      }
    )

    revalidatePath('/messages')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to mark message as read' }
  }
}

