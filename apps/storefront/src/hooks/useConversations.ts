'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations, createConversation as createConv } from '@/lib/data/messages';

interface Conversation {
  id: string
  member_id: string
  seller_id: string
  supplier_id?: string // Legacy alias
  product_id?: string
  subject?: string
  last_message_at?: string
  created_at: string
  updated_at: string
  product?: any
  seller?: any
  supplier?: any // Legacy alias
  member?: any
  unread_count: number
}

/**
 * Hook for conversations
 * Migrated from Supabase to use Medusa SDK via server actions
 */
export function useConversations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const result = await getConversations();
        
        // Transform to legacy format for backward compatibility
        return (result.conversations || []).map(conv => ({
          id: conv.id,
          member_id: conv.member_id,
          seller_id: conv.seller_id || conv.supplier_id,
          supplier_id: conv.supplier_id, // Legacy alias
          product_id: conv.product_id,
          subject: conv.subject,
          last_message_at: conv.last_message_at || conv.updated_at,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          product: conv.product ? {
            id: conv.product.id,
            title: conv.product.title,
            thumbnail: conv.product.thumbnail || conv.product.image_url,
            price: conv.product.price,
            // Legacy aliases
            Product_ID: conv.product.id,
            Product_Title: conv.product.title,
            Product_Image_URL: conv.product.thumbnail || conv.product.image_url,
            Product_Price: conv.product.price,
          } : undefined,
          seller: conv.seller ? {
            id: conv.seller.id,
            name: conv.seller.name,
            // Legacy aliases
            Supplier_ID: conv.seller.id,
            Supplier_Title: conv.seller.name,
          } : undefined,
          supplier: conv.seller ? { // Legacy alias
            Supplier_ID: conv.seller.id,
            Supplier_Title: conv.seller.name
          } : undefined,
          member: conv.member ? {
            id: conv.member.id,
            email: conv.member.email,
            display_name: conv.member.display_name || conv.member.name
          } : undefined,
          unread_count: conv.unread_count || 0
        })) as Conversation[];
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const createConversation = async (sellerId: string, productId?: string, subject?: string) => {
    try {
      const result = await createConv(sellerId, subject);
      
      if (!result.success || !result.conversation) {
        throw new Error(result.error || 'Failed to create conversation');
      }

      // Invalidate conversations cache
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      return result.conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  return {
    ...query,
    createConversation
  };
}

