'use client'

/**
 * Temporary stub for useAskConversations hook
 * TODO: Migrate full implementation from psn-a1-site-4
 */

export interface AskConversation {
  id: string
  title?: string
  question: string
  answer?: string
  last_query?: string
  created_at: string
  updated_at: string
}

export function useAskConversations() {
  return {
    conversations: [] as AskConversation[],
    isLoading: false,
    deleteConversation: async (id: string) => {
      // Stub implementation
      console.warn('deleteConversation not yet implemented')
    },
    isDeleting: false,
  }
}

