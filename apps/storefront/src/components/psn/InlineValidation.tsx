'use client'

import React from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Violation } from '@/lib/contentModeration';

interface InlineValidationProps {
  violations: Violation[];
  isValidating?: boolean;
  showSuccess?: boolean;
  className?: string;
}

export default function InlineValidation({
  violations,
  isValidating = false,
  showSuccess = false,
  className = ''
}: InlineValidationProps) {
  if (isValidating) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <Loader className="w-4 h-4 animate-spin" />
        <span>Validating content...</span>
      </div>
    );
  }

  if (violations.length > 0) {
    const highestSeverity = violations.reduce((max, v) => {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const currentSeverity = severityOrder[v.severity as keyof typeof severityOrder] || 0;
      const maxSeverity = severityOrder[max.severity as keyof typeof severityOrder] || 0;
      return currentSeverity > maxSeverity ? v : max;
    }, violations[0]);

    const getColorClass = () => {
      switch (highestSeverity.severity) {
        case 'critical':
        case 'high':
          return 'text-red-600 dark:text-red-500';
        case 'medium':
          return 'text-yellow-600 dark:text-yellow-500';
        case 'low':
          return 'text-blue-600 dark:text-blue-500';
        default:
          return 'text-gray-600 dark:text-gray-500';
      }
    };

    return (
      <div className={`flex items-start gap-2 text-sm ${getColorClass()} ${className}`}>
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{highestSeverity.message}</p>
          {violations.length > 1 && (
            <p className="text-xs opacity-75 mt-1">
              +{violations.length - 1} more {violations.length - 1 === 1 ? 'issue' : 'issues'}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-500 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span>Content looks good</span>
      </div>
    );
  }

  return null;
}
