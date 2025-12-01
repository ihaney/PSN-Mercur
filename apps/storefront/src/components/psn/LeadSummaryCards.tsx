'use client'

import React from 'react';
import { FileText, MessageSquare, Bookmark, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { LeadSummary } from '@/hooks/useSupplierLeads';
import LoadingSpinner from './LoadingSpinner';

interface LeadSummaryCardsProps {
  summary: LeadSummary | null | undefined;
  isLoading: boolean;
}

const LeadSummaryCards: React.FC<LeadSummaryCardsProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: 'New RFQs',
      value: summary.new_rfqs,
      icon: FileText,
      color: 'text-[#F4A024]',
      bgColor: 'bg-[#F4A024]/10',
      borderColor: 'border-[#F4A024]/20',
      description: 'Quote requests waiting'
    },
    {
      title: 'Product Questions',
      value: summary.new_questions,
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Buyer inquiries pending'
    },
    {
      title: 'Profile Saves',
      value: summary.profile_saves,
      icon: Bookmark,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Buyers interested in you'
    }
  ];

  const statsCards = [
    {
      title: 'Avg Response Time',
      value: summary.avg_response_time_minutes
        ? `${Math.round(summary.avg_response_time_minutes)}m`
        : 'N/A',
      icon: Clock,
      color: 'text-green-400',
      description: 'Time to first reply'
    },
    {
      title: 'Response Rate',
      value: summary.total_leads > 0
        ? `${Math.round((summary.responded_leads / summary.total_leads) * 100)}%`
        : '0%',
      icon: CheckCircle,
      color: 'text-green-400',
      description: 'Leads you\'ve replied to'
    },
    {
      title: 'High Priority',
      value: summary.high_priority_count,
      icon: TrendingUp,
      color: 'text-red-400',
      description: 'Hot leads needing attention'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`bg-gray-800/50 border ${card.borderColor} rounded-lg p-6 transition-all duration-300 hover:border-opacity-60`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${card.color}`}>
                  {card.value}
                </div>
              </div>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{card.title}</h3>
            <p className="text-gray-400 text-xs">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 transition-all duration-300 hover:border-gray-600"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-700/50">
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-white">{card.value}</div>
                <p className="text-gray-400 text-xs">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">Total Leads (30 Days)</h4>
            <p className="text-gray-400 text-xs">All inquiries and interactions</p>
          </div>
          <div className="text-3xl font-bold text-[#F4A024]">
            {summary.total_leads}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadSummaryCards;
