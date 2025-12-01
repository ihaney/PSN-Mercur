'use client'

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface Reaction {
  emoji: string;
  count: number;
  user_ids: string[];
  user_names?: string[];
}

interface MessageReactionDisplayProps {
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: () => void;
  onToggleReaction: (emoji: string) => void;
  isOwnMessage?: boolean;
}

export default function MessageReactionDisplay({
  reactions,
  currentUserId,
  onAddReaction,
  onToggleReaction,
  isOwnMessage = false
}: MessageReactionDisplayProps) {
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  if (!reactions || reactions.length === 0) {
    return (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onAddReaction}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 rounded-full hover:bg-[#F4A024] hover:text-gray-900 transition-all"
          title="Add reaction"
        >
          <Plus className="w-3 h-3" />
          <span>React</span>
        </button>
      </div>
    );
  }

  const hasUserReacted = (userIds: string[]) => {
    return userIds.includes(currentUserId);
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction) => {
        const userReacted = hasUserReacted(reaction.user_ids);

        return (
          <div
            key={reaction.emoji}
            className="relative"
            onMouseEnter={() => setHoveredEmoji(reaction.emoji)}
            onMouseLeave={() => setHoveredEmoji(null)}
          >
            <button
              onClick={() => onToggleReaction(reaction.emoji)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-all hover:scale-110 ${
                userReacted
                  ? 'bg-[#F4A024] text-gray-900 border-2 border-[#F4A024]'
                  : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 border-2 border-transparent hover:border-[#F4A024]'
              }`}
              title={userReacted ? 'Remove your reaction' : 'Add this reaction'}
            >
              <span className="text-sm">{reaction.emoji}</span>
              <span className="font-medium">{reaction.count}</span>
            </button>

            {hoveredEmoji === reaction.emoji && reaction.user_names && reaction.user_names.length > 0 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 dark:bg-gray-900 light:bg-white rounded-lg shadow-lg border dark:border-gray-700 light:border-gray-200 whitespace-nowrap z-10">
                <div className="text-xs dark:text-gray-300 light:text-gray-700">
                  {reaction.user_names.slice(0, 5).join(', ')}
                  {reaction.user_names.length > 5 && (
                    <span className="dark:text-gray-400 light:text-gray-600">
                      {' '}and {reaction.user_names.length - 5} more
                    </span>
                  )}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="w-2 h-2 dark:bg-gray-900 light:bg-white border-r dark:border-gray-700 light:border-gray-200 border-b dark:border-gray-700 light:border-gray-200 transform rotate-45"></div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={onAddReaction}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 rounded-full hover:bg-[#F4A024] hover:text-gray-900 transition-all hover:scale-110"
        title="Add reaction"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
