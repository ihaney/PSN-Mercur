'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flag, ChevronDown, ChevronUp, ExternalLink, Clock, CheckCircle, Eye, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface UserReport {
  id: string;
  report_type: string;
  description: string;
  reported_url: string | null;
  page_context: any;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  screenshots: {
    id: string;
    screenshot_url: string;
    file_name: string;
  }[];
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  incorrect_product_info: 'Incorrect Product Info',
  broken_link: 'Broken Link',
  outdated_supplier: 'Outdated Supplier',
  inappropriate_content: 'Inappropriate Content',
  duplicate_entry: 'Duplicate Entry',
  glitch: 'Technical Glitch',
  other: 'Other Issue'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  under_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  dismissed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  under_review: Eye,
  resolved: CheckCircle,
  dismissed: X
};

export default function UserReportHistory() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['user-reports'],
    queryFn: async () => {
      const { data: { user } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('data_reports')
        .select(`
          *,
          screenshots:report_screenshots(
            id,
            screenshot_url,
            file_name
          )
        `)
        .eq('reporter_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as UserReport[];
    },
    staleTime: 1000 * 30,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading reports</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <Flag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">You haven't submitted any reports yet</p>
        <p className="text-sm text-gray-500 mt-2">Use the flag icon on any page to report data issues</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const StatusIcon = STATUS_ICONS[report.status];

        return (
          <div key={report.id} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${STATUS_COLORS[report.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {REPORT_TYPE_LABELS[report.report_type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Submitted {formatDate(report.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {expandedReport === report.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              <p className="text-white text-sm mb-3">{report.description}</p>

              {expandedReport === report.id && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                  {report.reported_url && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Reported URL</p>
                      <a
                        href={report.reported_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F4A024] hover:text-[#F4A024]/80 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {report.reported_url}
                      </a>
                    </div>
                  )}

                  {report.screenshots.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Screenshots ({report.screenshots.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {report.screenshots.map((screenshot) => (
                          <a
                            key={screenshot.id}
                            href={screenshot.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-video rounded overflow-hidden border border-gray-700 hover:border-[#F4A024] transition-colors"
                          >
                            <img
                              src={screenshot.screenshot_url}
                              alt={screenshot.file_name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-5 h-5 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.admin_notes && (
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Admin Response</p>
                      <p className="text-white text-sm">{report.admin_notes}</p>
                    </div>
                  )}

                  {report.resolved_at && (
                    <div className="text-xs text-gray-400">
                      {report.status === 'resolved' ? 'Resolved' : 'Dismissed'} on {formatDate(report.resolved_at)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
