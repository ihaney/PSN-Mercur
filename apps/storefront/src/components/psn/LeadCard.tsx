'use client'

import React from 'react';
import { FileText, MessageSquare, Bookmark, Eye, MapPin, Package, Clock, TrendingUp } from 'lucide-react';
import type { LeadInquiry } from '@/hooks/useSupplierLeads';

interface LeadCardProps {
  lead: LeadInquiry;
  onView: (leadId: string) => void;
  onRespond?: (leadId: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onView, onRespond }) => {
  const getInquiryIcon = (type: string) => {
    switch (type) {
      case 'rfq': return <FileText className="w-5 h-5" />;
      case 'product_question': return <MessageSquare className="w-5 h-5" />;
      case 'profile_save': return <Bookmark className="w-5 h-5" />;
      case 'product_view': return <Eye className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getInquiryLabel = (type: string) => {
    switch (type) {
      case 'rfq': return 'RFQ Request';
      case 'product_question': return 'Product Question';
      case 'profile_save': return 'Profile Saved';
      case 'product_view': return 'Product View';
      default: return 'Inquiry';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'viewed': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'responded': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'converted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div
      className="bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 rounded-lg p-4 transition-all duration-300 cursor-pointer hover:border-[#F4A024]/40"
      onClick={() => onView(lead.id)}
    >
      <div className="flex items-start gap-4">
        {lead.product_image && (
          <img
            src={lead.product_image}
            alt={lead.product_title || 'Product'}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
        )}
        {!lead.product_image && lead.product_id && (
          <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${
                lead.inquiry_type === 'rfq' ? 'bg-[#F4A024]/10 text-[#F4A024] border-[#F4A024]/20' :
                lead.inquiry_type === 'product_question' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                lead.inquiry_type === 'profile_save' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}>
                {getInquiryIcon(lead.inquiry_type)}
                {getInquiryLabel(lead.inquiry_type)}
              </div>

              <div className={`px-2 py-1 rounded-md border text-xs font-medium capitalize ${getStatusColor(lead.status)}`}>
                {lead.status}
              </div>

              {lead.priority !== 'low' && (
                <div className={`flex items-center gap-1 ${getPriorityColor(lead.priority)}`}>
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium capitalize">{lead.priority}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-gray-400 text-xs whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {getTimeAgo(lead.created_at)}
            </div>
          </div>

          {lead.product_title && (
            <h3 className="text-white font-medium text-sm mb-1 truncate">
              {lead.product_title}
            </h3>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {lead.member_location}
            </div>

            {lead.message_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {lead.message_count} {lead.message_count === 1 ? 'message' : 'messages'}
              </div>
            )}

            {lead.engagement_score > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Score: {lead.engagement_score}
              </div>
            )}
          </div>

          {lead.metadata?.subject && (
            <p className="text-gray-300 text-sm line-clamp-2">
              {lead.metadata.subject}
            </p>
          )}

          {lead.response_time_minutes && (
            <div className="mt-2 text-xs text-gray-500">
              Response time: {lead.response_time_minutes < 60
                ? `${Math.round(lead.response_time_minutes)}m`
                : `${Math.round(lead.response_time_minutes / 60)}h`}
            </div>
          )}
        </div>

        {onRespond && lead.status === 'new' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRespond(lead.id);
            }}
            className="px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Respond
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
