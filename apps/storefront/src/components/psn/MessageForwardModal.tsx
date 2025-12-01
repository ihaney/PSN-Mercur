'use client'

import React, { useState, useEffect } from 'react';
import { X, Search, Check, Forward, Package, Building2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  supplier_id: string;
  member_id: string;
  product_id?: string;
  subject?: string;
  seller?: {
    id: string; // Changed from Supplier_ID
    name: string; // Changed from Supplier_Title
  };
  member?: {
    id: string;
    email: string;
    display_name: string;
  };
  product?: {
    id: string; // Changed from Product_ID
    title: string; // Changed from Product_Title
    thumbnail: string; // Changed from Product_Image_URL
  };
}

interface MessageForwardModalProps {
  messageId: string;
  messageContent: string;
  onClose: () => void;
  onForward: (conversationId: string) => void;
  currentConversationId: string;
}

export default function MessageForwardModal({
  messageId,
  messageContent,
  onClose,
  onForward,
  currentConversationId
}: MessageForwardModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [forwarding, setForwarding] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) return;

      const { data: supplierClaim } = await supabase
        .from('supplier_claim_requests')
        .select('supplier_id')
        .eq('reviewed_by_auth_id', session.user.id)
        .eq('status', 'approved')
        .maybeSingle();

      const { data: memberProfile } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      setIsSupplier(!!supplierClaim);

      let query = supabase
        .from('conversations')
        .select(`
          id,
          member_id,
          supplier_id,
          product_id,
          subject,
          Products:product_id (
            Product_ID,
            Product_Title,
            Product_Image_URL
          ),
          Supplier:supplier_id (
            Supplier_ID,
            Supplier_Title
          ),
          members:member_id (
            id,
            email,
            display_name
          )
        `)
        .neq('id', currentConversationId)
        .order('last_message_at', { ascending: false })
        .limit(50);

      if (supplierClaim) {
        query = query.eq('supplier_id', supplierClaim.supplier_id); // Database still uses supplier_id
      } else if (memberProfile) {
        query = query.eq('member_id', memberProfile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (selectedConversations.size === 0) {
      toast.error('Please select at least one conversation');
      return;
    }

    setForwarding(true);
    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) throw new Error('Not authenticated');

      let successCount = 0;
      let failCount = 0;

      for (const targetConversationId of Array.from(selectedConversations)) {
        try {
          const targetConversation = conversations.find(c => c.id === targetConversationId);
          if (!targetConversation) continue;

          let receiverId: string;
          if (isSupplier) {
            const { data: memberData } = await supabase
              .from('members')
              .select('auth_id')
              .eq('id', targetConversation.member_id)
              .single();
            if (!memberData) throw new Error('Member not found');
            receiverId = memberData.auth_id;
          } else {
            const { data: supplierData } = await supabase
              .from('supplier_claim_requests')
              .select('reviewed_by_auth_id')
              .eq('supplier_id', targetConversation.supplier_id)
              .eq('status', 'approved')
              .single();
            if (!supplierData) throw new Error('Supplier not found');
            receiverId = supplierData.reviewed_by_auth_id;
          }

          const forwardedContent = `[Forwarded message]\n\n${messageContent}`;

          const { data: newMessage, error: messageError } = await supabase
            .from('messages')
            .insert({
              conversation_id: targetConversationId,
              sender_id: session.user.id,
              receiver_id: receiverId,
              content: forwardedContent,
              is_read: false
            })
            .select()
            .single();

          if (messageError) throw messageError;

          await supabase
            .from('message_forwards')
            .insert({
              original_message_id: messageId,
              forwarded_message_id: newMessage.id,
              forwarded_by: session.user.id,
              forwarded_to_conversation_id: targetConversationId
            });

          await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', targetConversationId);

          successCount++;
        } catch (error) {
          console.error('Error forwarding to conversation:', error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `Message forwarded to ${successCount} conversation${successCount > 1 ? 's' : ''}` +
          (failCount > 0 ? ` (${failCount} failed)` : '')
        );
      } else {
        toast.error('Failed to forward message');
      }

      onClose();
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast.error('Failed to forward message');
    } finally {
      setForwarding(false);
    }
  };

  const toggleConversation = (conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const sellerName = conv.seller?.name?.toLowerCase() || conv.supplier?.Supplier_Title?.toLowerCase() || '';
    const memberName = conv.member?.display_name?.toLowerCase() || conv.member?.email?.toLowerCase() || '';
    const productName = conv.product?.title?.toLowerCase() || conv.product?.Product_Title?.toLowerCase() || '';
    const subject = conv.subject?.toLowerCase() || '';

    return sellerName.includes(searchLower) ||
           memberName.includes(searchLower) ||
           productName.includes(searchLower) ||
           subject.includes(searchLower);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="dark:bg-gray-800 light:bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b dark:border-gray-700 light:border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900 flex items-center gap-2">
              <Forward className="w-5 h-5" />
              Forward Message
            </h2>
            <p className="text-sm dark:text-gray-400 light:text-gray-600 mt-1">
              Select conversations to forward this message to
            </p>
          </div>
          <button
            onClick={onClose}
            className="dark:text-gray-400 light:text-gray-600 hover:text-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b dark:border-gray-700 light:border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-400 light:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full dark:bg-gray-700 light:bg-gray-50 dark:border-gray-600 light:border-gray-300 border rounded-lg pl-10 pr-4 py-2 dark:text-white light:text-gray-900 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F4A024] focus:border-[#F4A024] text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <Forward className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
              <p className="dark:text-gray-400 light:text-gray-600">
                {searchQuery ? 'No conversations match your search' : 'No other conversations found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => toggleConversation(conversation.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedConversations.has(conversation.id)
                      ? 'border-[#F4A024] bg-[#F4A024]/10'
                      : 'dark:border-gray-700 light:border-gray-200 dark:hover:bg-gray-700 light:hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {conversation.product?.thumbnail || conversation.product?.Product_Image_URL ? (
                      <img
                        src={conversation.product.thumbnail || conversation.product.Product_Image_URL}
                        alt={conversation.product.title || conversation.product.Product_Title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {conversation.product ? (
                          <Package className="w-6 h-6 text-gray-400" />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium dark:text-gray-100 light:text-gray-900 truncate">
                        {isSupplier
                          ? conversation.member?.display_name || conversation.member?.email || 'Unknown User'
                          : conversation.seller?.name || conversation.supplier?.Supplier_Title || 'Unknown Seller'
                        }
                      </h3>
                      <p className="text-xs dark:text-gray-400 light:text-gray-600 truncate">
                        {conversation.product?.title || conversation.product?.Product_Title || conversation.subject || 'General inquiry'}
                      </p>
                    </div>

                    {selectedConversations.has(conversation.id) && (
                      <div className="w-6 h-6 bg-[#F4A024] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-gray-900" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-gray-700 light:border-gray-200 flex items-center justify-between">
          <p className="text-sm dark:text-gray-400 light:text-gray-600">
            {selectedConversations.size} conversation{selectedConversations.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 dark:bg-gray-700 light:bg-gray-200 dark:text-gray-200 light:text-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              disabled={forwarding}
            >
              Cancel
            </button>
            <button
              onClick={handleForward}
              disabled={selectedConversations.size === 0 || forwarding}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {forwarding ? (
                <>
                  <LoadingSpinner />
                  Forwarding...
                </>
              ) : (
                <>
                  <Forward className="w-4 h-4" />
                  Forward
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
