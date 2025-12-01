'use client'

import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useConversations } from '@/hooks/useConversations';
import { analytics } from '@/lib/analytics';
import { canContactSupplier } from '@/lib/contactProtection';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface MessageButtonProps {
  sellerId?: string; // Changed from supplierId to sellerId (supports both)
  supplierId?: string; // Legacy alias
  sellerName?: string; // Changed from supplierName to sellerName (supports both)
  supplierName?: string; // Legacy alias
  productId?: string;
  productName?: string;
  className?: string;
}

export default function MessageButton({ 
  sellerId,
  supplierId, // Legacy support
  sellerName,
  supplierName, // Legacy support
  productId, 
  productName,
  className = "w-full bg-[#F4A024] text-gray-900 px-6 py-3 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium flex items-center justify-center gap-2"
}: MessageButtonProps) {
  const finalSellerId = sellerId || supplierId || ''
  const finalSellerName = sellerName || supplierName || ''
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [loading, setLoading] = useState(false);
  const { createConversation } = useConversations();

  const handleMessageClick = async () => {
    try {
      // Check if user can contact seller (includes rate limiting and authentication)
      const canContact = await canContactSupplier(finalSellerId);
      if (!canContact) {
        return; // Error messages are shown by canContactSupplier
      }

      setLoading(true);

      // Create or get existing conversation
      const subject = productName ? `Inquiry about ${productName}` : `General inquiry`;
      const conversationId = await createConversation(finalSellerId, productId, subject);

      analytics.trackEvent('message_conversation_started', {
        props: {
          seller_id: finalSellerId, // Changed from supplier_id
          seller_name: finalSellerName, // Changed from supplier_name
          supplier_id: finalSellerId, // Legacy alias
          supplier_name: finalSellerName, // Legacy alias
          product_id: productId,
          product_name: productName,
          has_product: !!productId
        }
      });

      // Navigate to messages page with conversation selected
      router.push(`/${locale}/messages?conversation=${conversationId}`);

    } catch (error) {
      console.error('Error starting conversation:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Member profile not found')) {
          toast.error('Please complete your profile setup to send messages.');
          return;
        }
      }
      
      toast.error('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMessageClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <MessageSquare className="w-4 h-4" />
          Send Message
        </>
      )}
    </button>
  );
}