'use client'

import React, { useEffect, useState } from 'react';
interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

interface TypingUser {
  user_id: string;
  started_at: string;
  last_updated: string;
}

export default function TypingIndicator({ conversationId, currentUserId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    let isSubscribed = true;

    const fetchTypingUsers = async () => {
      const { data, error } = await supabase
        .from('typing_indicators')
        .select('user_id, started_at, last_updated')
        .eq('conversation_id', conversationId)
        .neq('user_id', currentUserId)
        .gte('last_updated', new Date(Date.now() - 10000).toISOString());

      if (error) {
        console.error('Error fetching typing users:', error);
        return;
      }

      if (isSubscribed) {
        setTypingUsers(data || []);
      }
    };

    fetchTypingUsers();

    const subscription = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchTypingUsers();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchTypingUsers();
    }, 3000);

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (typingUsers.length > 0) {
      const fetchUserName = async () => {
        const userId = typingUsers[0].user_id;

        const { data: memberData } = await supabase
          .from('members')
          .select('display_name, email')
          .eq('auth_id', userId)
          .maybeSingle();

        if (memberData) {
          setUserName(memberData.display_name || memberData.email || 'Someone');
          return;
        }

        const { data: supplierData } = await supabase
          .from('supplier_claim_requests')
          .select('Supplier:supplier_id(Supplier_Title)')
          .eq('reviewed_by_auth_id', userId)
          .eq('status', 'approved')
          .maybeSingle();

        if (supplierData?.Supplier) {
          setUserName(supplierData.Supplier.Supplier_Title || 'Someone');
        } else {
          setUserName('Someone');
        }
      };

      fetchUserName();
    }
  }, [typingUsers]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 dark:text-gray-400 light:text-gray-600 text-sm">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-[#F4A024] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-[#F4A024] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-[#F4A024] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span className="italic">
        {typingUsers.length === 1
          ? `${userName} is typing...`
          : `${typingUsers.length} people are typing...`}
      </span>
    </div>
  );
}
