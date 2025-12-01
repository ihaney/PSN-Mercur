'use client'

import React from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Violation, getSeverityColor, getSeverityLabel } from '@/lib/contentModeration';

interface ValidationFeedbackProps {
  violations: Violation[];
  suggestions?: string[];
  className?: string;
}

export default function ValidationFeedback({
  violations,
  suggestions,
  className = ''
}: ValidationFeedbackProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  if (violations.length === 0) {
    return null;
  }

  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const highViolations = violations.filter(v => v.severity === 'high');
  const mediumViolations = violations.filter(v => v.severity === 'medium');
  const lowViolations = violations.filter(v => v.severity === 'low');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-gray-600 flex-shrink-0" />;
    }
  };

  const renderViolationGroup = (groupViolations: Violation[], title: string) => {
    if (groupViolations.length === 0) return null;

    return (
      <div className="mb-4 last:mb-0">
        <h4 className="text-sm font-semibold text-themed mb-2">{title}</h4>
        <div className="space-y-3">
          {groupViolations.map((violation, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-themed-secondary rounded-lg border border-themed"
            >
              {getSeverityIcon(violation.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-themed">
                    {violation.field}
                  </p>
                  <span className={`text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                    {getSeverityLabel(violation.severity)}
                  </span>
                </div>
                <p className="text-sm text-themed-secondary mb-2">
                  {violation.message}
                </p>
                {violation.detectedContent && (
                  <p className="text-xs text-themed-muted mb-2">
                    Detected: {violation.detectedContent}
                  </p>
                )}
                {violation.policyReference && (
                  <Link
                    href={`/${locale}${violation.policyReference}`}
                    target="_blank"
                    className="text-xs text-[#F4A024] hover:underline"
                  >
                    View Policy Guidelines →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <XCircle className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-1">
            Content Policy Violations Detected
          </h3>
          <p className="text-sm text-red-700 dark:text-red-500">
            Your content cannot be submitted because it violates our community guidelines.
            Please review and fix the issues below.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {renderViolationGroup(criticalViolations, 'Critical Issues')}
        {renderViolationGroup(highViolations, 'High Priority Issues')}
        {renderViolationGroup(mediumViolations, 'Medium Priority Issues')}
        {renderViolationGroup(lowViolations, 'Minor Issues')}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
          <h4 className="text-sm font-semibold text-themed mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#F4A024]" />
            Suggestions to Fix
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-themed-secondary">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
        <p className="text-xs text-themed-muted">
          Need help? Contact our support team or{' '}
          <Link href={`/${locale}/policies`} target="_blank" className="text-[#F4A024] hover:underline">
            review our complete policies
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
