'use client'

import React from 'react';
import { Shield, CheckCircle, Award, Verified } from 'lucide-react';

interface ComplianceBadgeStripProps {
  badges?: Array<{
    type: 'verified' | 'certified' | 'compliant' | 'award';
    label: string;
  }>;
  className?: string;
}

const defaultBadges = [
  { type: 'verified' as const, label: 'Verified Supplier' },
  { type: 'compliant' as const, label: 'Compliant' },
];

const iconMap = {
  verified: Verified,
  certified: Award,
  compliant: Shield,
  award: CheckCircle,
};

const colorMap = {
  verified: 'text-blue-400',
  certified: 'text-purple-400',
  compliant: 'text-green-400',
  award: 'text-yellow-400',
};

export default function ComplianceBadgeStrip({ 
  badges = defaultBadges, 
  className = '' 
}: ComplianceBadgeStripProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {badges.map((badge, index) => {
        const Icon = iconMap[badge.type] || Shield;
        const colorClass = colorMap[badge.type] || 'text-gray-400';

        return (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-full"
          >
            <Icon className={`w-3 h-3 ${colorClass}`} />
            <span className="text-xs text-gray-300">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}

