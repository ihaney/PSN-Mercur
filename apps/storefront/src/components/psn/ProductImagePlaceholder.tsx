'use client'

import React from 'react';
import { Package } from 'lucide-react';

interface ProductImagePlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductImagePlaceholder({ 
  className = '', 
  size = 'md' 
}: ProductImagePlaceholderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
      <Package className={`${sizeClasses[size]} text-gray-400`} />
    </div>
  );
}

