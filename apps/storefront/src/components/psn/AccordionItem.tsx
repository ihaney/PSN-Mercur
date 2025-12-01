'use client'

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  isFirst?: boolean;
}

export default function AccordionItem({ question, answer, defaultOpen = false, isFirst = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-gray-200/50 dark:border-gray-700/50 ${isFirst ? 'border-t' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-left hover:bg-gray-50/10 dark:hover:bg-gray-800/10 transition-colors group"
        aria-expanded={isOpen}
      >
        <span className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 pr-4">
          {question}
        </span>
        <span className="flex-shrink-0 text-gray-900 dark:text-gray-100">
          {isOpen ? (
            <Minus className="w-5 h-5" strokeWidth={2} />
          ) : (
            <Plus className="w-5 h-5" strokeWidth={2} />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="pb-8 pr-12 text-gray-700 dark:text-gray-300 leading-relaxed animate-fadeIn">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
