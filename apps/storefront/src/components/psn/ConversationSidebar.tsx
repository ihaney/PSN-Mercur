'use client'

import { useState } from 'react';
import { MessageSquare, Trash2, Plus, Search, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAskConversations, AskConversation } from '@/hooks/useAskConversations';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onConversationSelect: (conversationId: string | null) => void;
  onNewConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
}: ConversationSidebarProps) {
  const { conversations, isLoading, deleteConversation, isDeleting } = useAskConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.title?.toLowerCase().includes(searchLower) ||
      conv.last_query?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    setDeletingId(conversationId);
    try {
      await deleteConversation(conversationId);
      toast.success('Conversation deleted');

      if (currentConversationId === conversationId) {
        onConversationSelect(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 dark:bg-gray-900/50 light:bg-white/50 dark:border-gray-700 light:border-gray-200 border-r flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg dark:hover:bg-gray-800 light:hover:bg-gray-100 transition-colors dark:text-gray-400 light:text-gray-600 mb-4"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onNewConversation}
          className="p-2 rounded-lg bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90 transition-colors mb-4"
          title="New conversation"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto w-full px-2">
          {conversations.slice(0, 5).map((conv) => (
            <button
              key={conv.id}
              onClick={() => onConversationSelect(conv.id)}
              className={`w-full p-2 rounded-lg transition-all ${
                currentConversationId === conv.id
                  ? 'bg-[#F4A024]/20 border border-[#F4A024]/40'
                  : 'dark:hover:bg-gray-800/50 light:hover:bg-gray-100'
              }`}
              title={conv.title}
            >
              <MessageSquare className="w-4 h-4 dark:text-gray-400 light:text-gray-600 mx-auto" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 dark:bg-gray-900/50 light:bg-white/50 dark:border-gray-700 light:border-gray-200 border-r flex flex-col">
      <div className="p-4 dark:border-gray-700 light:border-gray-200 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversations
          </h2>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg dark:hover:bg-gray-800 light:hover:bg-gray-100 transition-colors dark:text-gray-400 light:text-gray-600"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onNewConversation}
          className="w-full px-4 py-2.5 rounded-lg bg-[#F4A024] text-gray-900 hover:bg-[#F4A024]/90 transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      <div className="p-4 dark:border-gray-700 light:border-gray-200 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-400 light:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full dark:bg-gray-800/50 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg pl-10 pr-10 py-2 dark:text-white light:text-gray-900 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F4A024] focus:border-[#F4A024] text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-400 light:text-gray-500 dark:hover:text-white light:hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <LoadingSpinner />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
            <p className="dark:text-gray-400 light:text-gray-600 text-sm">
              {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-2">
                Start a new conversation to get started
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`group relative p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                  currentConversationId === conversation.id
                    ? 'bg-[#F4A024]/20 border border-[#F4A024]/40 shadow-md'
                    : 'dark:hover:bg-gray-800/50 light:hover:bg-gray-100 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium dark:text-gray-100 light:text-gray-900 truncate mb-1">
                      {conversation.title}
                    </h3>
                    {conversation.last_query && (
                      <p className="text-xs dark:text-gray-400 light:text-gray-600 line-clamp-2 mb-2">
                        {conversation.last_query}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs dark:text-gray-500 light:text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(conversation.updated_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, conversation.id)}
                    disabled={isDeleting && deletingId === conversation.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg dark:hover:bg-gray-700 light:hover:bg-gray-200 transition-all dark:text-gray-400 light:text-gray-600 dark:hover:text-red-400 light:hover:text-red-600 disabled:opacity-50"
                    title="Delete conversation"
                  >
                    {isDeleting && deletingId === conversation.id ? (
                      <div className="w-4 h-4">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
