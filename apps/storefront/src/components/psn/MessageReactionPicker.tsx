'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Smile, ThumbsUp, Heart, Laugh, PartyPopper, Check } from 'lucide-react';

interface MessageReactionPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

const COMMON_EMOJIS = [
  { emoji: '👍', label: 'Thumbs up', icon: ThumbsUp },
  { emoji: '❤️', label: 'Heart', icon: Heart },
  { emoji: '😊', label: 'Smile', icon: Smile },
  { emoji: '😂', label: 'Laugh', icon: Laugh },
  { emoji: '🎉', label: 'Party', icon: PartyPopper },
  { emoji: '✅', label: 'Check', icon: Check },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🙏', label: 'Thanks' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💯', label: '100' },
  { emoji: '👀', label: 'Eyes' },
  { emoji: '🤝', label: 'Handshake' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '✨', label: 'Sparkles' },
  { emoji: '🎯', label: 'Target' }
];

const CATEGORY_EMOJIS = {
  positive: ['👍', '❤️', '😊', '🎉', '✅', '👏', '🙏', '💯', '⭐', '✨'],
  neutral: ['👀', '🤔', '💭', '📝', '💼', '🎯'],
  question: ['❓', '🤷', '💬', '📞', '📧']
};

export default function MessageReactionPicker({
  onSelectEmoji,
  onClose,
  position
}: MessageReactionPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'positive' | 'neutral' | 'question'>('all');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const getDisplayEmojis = () => {
    if (selectedCategory === 'all') {
      return COMMON_EMOJIS.map(e => e.emoji);
    }
    return CATEGORY_EMOJIS[selectedCategory] || [];
  };

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
  };

  const displayEmojis = getDisplayEmojis();

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 dark:bg-gray-800 light:bg-white rounded-lg shadow-xl border dark:border-gray-700 light:border-gray-200 p-3 min-w-[280px]"
      style={position ? { top: position.top, left: position.left } : {}}
    >
      <div className="flex gap-1 mb-3 pb-2 border-b dark:border-gray-700 light:border-gray-200">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#F4A024] text-gray-900'
              : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory('positive')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            selectedCategory === 'positive'
              ? 'bg-[#F4A024] text-gray-900'
              : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600'
          }`}
        >
          Positive
        </button>
        <button
          onClick={() => setSelectedCategory('neutral')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            selectedCategory === 'neutral'
              ? 'bg-[#F4A024] text-gray-900'
              : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600'
          }`}
        >
          Neutral
        </button>
        <button
          onClick={() => setSelectedCategory('question')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            selectedCategory === 'question'
              ? 'bg-[#F4A024] text-gray-900'
              : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600'
          }`}
        >
          Question
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1">
        {displayEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="w-8 h-8 flex items-center justify-center text-2xl hover:bg-gray-700 rounded transition-colors"
            title={COMMON_EMOJIS.find(e => e.emoji === emoji)?.label || emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t dark:border-gray-700 light:border-gray-200">
        <p className="text-xs dark:text-gray-400 light:text-gray-600 text-center">
          Click an emoji to react
        </p>
      </div>
    </div>
  );
}
