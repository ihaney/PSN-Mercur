'use client'

import React from 'react';
import { CheckCircle, Clock, Shield, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './LoadingSpinner';
import Tooltip from './Tooltip';

interface ReliabilityMetrics {
  has_sufficient_data: boolean;
  message?: string;
  supplier_id?: string;
  on_time_shipment_percentage?: number;
  avg_response_time_hours?: number;
  avg_message_response_hours?: number;
  avg_quote_response_hours?: number;
  dispute_rate?: number;
  overall_trust_score?: number;
  total_orders_fulfilled?: number;
  total_disputes?: number;
  resolved_disputes?: number;
  percentile_rank?: number;
  response_time_label?: string;
  reliability_tier?: 'excellent' | 'good' | 'average' | 'needs_improvement';
  last_calculated_at?: string;
}

interface SupplierReliabilityMetricsProps {
  supplierId: string;
  compact?: boolean;
}

export default function SupplierReliabilityMetrics({ supplierId, compact = false }: SupplierReliabilityMetricsProps) {
  const { data: metrics, isLoading, error } = useQuery<ReliabilityMetrics>({
    queryKey: ['supplierReliability', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_supplier_reliability_metrics', {
        p_supplier_id: supplierId
      });

      if (error) throw error;
      return data as ReliabilityMetrics;
    },
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-themed-secondary rounded-xl p-6 border-themed">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-themed-muted flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-themed mb-1">Insufficient Data for Reliability Evaluation</h3>
            <p className="text-sm text-themed-secondary">
              We do not have sufficient data to evaluate the supplier&apos;s reliability. Reliability metrics will appear once the supplier completes more orders on the platform.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics?.has_sufficient_data) {
    return (
      <div className="bg-themed-secondary rounded-xl p-8 border-themed text-center">
        <div className="flex flex-col items-center gap-4">
          <TrendingUp className="w-16 h-16 text-themed-muted" />
          <div>
            <h3 className="text-lg font-semibold text-themed mb-2">No Reliability Data Yet</h3>
            <p className="text-themed-secondary max-w-md mx-auto">
              Reliability Metrics data will appear here when Paisan gathers sufficient Purchase Order data from the supplier.
            </p>
          </div>
          {/* Visual placeholder for metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
            {/* On-Time Shipment Placeholder */}
            <div className="bg-themed-card rounded-lg p-4 border-themed opacity-40">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-themed-muted">On-Time Shipments</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-themed-muted">--%</div>
              <div className="mt-2 text-xs text-themed-muted">Delivery performance</div>
            </div>

            {/* Response Time Placeholder */}
            <div className="bg-themed-card rounded-lg p-4 border-themed opacity-40">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-themed-muted">Response Time</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-themed-muted">Response time varies</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-themed-muted">
                <div>
                  <div>Messages</div>
                  <div className="font-medium">--h</div>
                </div>
                <div>
                  <div>Quotes</div>
                  <div className="font-medium">--h</div>
                </div>
              </div>
            </div>

            {/* Dispute Rate Placeholder */}
            <div className="bg-themed-card rounded-lg p-4 border-themed opacity-40">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-themed-muted">Dispute Rate</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-themed-muted">--%</div>
              <div className="mt-2 text-xs text-themed-muted">No disputes filed</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'average':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-orange-600 dark:text-orange-400';
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'average':
        return 'Average';
      default:
        return 'Developing';
    }
  };

  const getOnTimeColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-500';
    if (percentage >= 95) return 'text-green-600 dark:text-green-400';
    if (percentage >= 85) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getDisputeColor = (rate?: number) => {
    if (!rate) return 'text-green-600 dark:text-green-400';
    if (rate < 2) return 'text-green-600 dark:text-green-400';
    if (rate < 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-5 h-5 ${getTierColor(metrics.reliability_tier)}`} />
          <span className={`font-semibold ${getTierColor(metrics.reliability_tier)}`}>
            {Math.round(metrics.overall_trust_score || 0)}/100
          </span>
          <span className="text-sm text-themed-secondary">Trust Score</span>
        </div>

        {metrics.response_time_label && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-themed-secondary" />
            <span className="text-sm text-themed-secondary">{metrics.response_time_label}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-themed-secondary rounded-xl p-6 border-themed">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-themed mb-1">Reliability Metrics</h3>
          <p className="text-sm text-themed-secondary">
            Based on {metrics.total_orders_fulfilled} completed {metrics.total_orders_fulfilled === 1 ? 'order' : 'orders'}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getTierColor(metrics.reliability_tier)}`}>
            {Math.round(metrics.overall_trust_score || 0)}/100
          </div>
          <div className={`text-sm font-medium ${getTierColor(metrics.reliability_tier)}`}>
            {getTierLabel(metrics.reliability_tier)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* On-Time Shipment */}
        <div className="bg-themed-card rounded-lg p-4 border-themed">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package className={`w-5 h-5 ${getOnTimeColor(metrics.on_time_shipment_percentage)}`} />
              <span className="text-sm font-medium text-themed">On-Time Shipments</span>
            </div>
            <Tooltip content="Percentage of orders delivered by the expected delivery date. Based on completed shipments with tracking data.">
              <div className="w-4 h-4 rounded-full bg-themed-secondary flex items-center justify-center cursor-help">
                <span className="text-xs text-themed-secondary">?</span>
              </div>
            </Tooltip>
          </div>
          <div className={`text-2xl font-bold ${getOnTimeColor(metrics.on_time_shipment_percentage)}`}>
            {Math.round(metrics.on_time_shipment_percentage || 0)}%
          </div>
          <div className="mt-2 text-xs text-themed-muted">
            {metrics.on_time_shipment_percentage && metrics.on_time_shipment_percentage >= 90 ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                Excellent delivery record
              </span>
            ) : (
              'Delivery performance'
            )}
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-themed-card rounded-lg p-4 border-themed">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F4A024]" />
              <span className="text-sm font-medium text-themed">Response Time</span>
            </div>
            <Tooltip content="Average time taken to respond to buyer messages and quote requests. Faster response times indicate better communication.">
              <div className="w-4 h-4 rounded-full bg-themed-secondary flex items-center justify-center cursor-help">
                <span className="text-xs text-themed-secondary">?</span>
              </div>
            </Tooltip>
          </div>
          <div className="text-sm font-semibold text-themed">
            {metrics.response_time_label || 'Response time varies'}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-themed-muted">
            <div>
              <div className="text-themed-secondary">Messages</div>
              <div className="font-medium text-themed">
                {Math.round(metrics.avg_message_response_hours || 0)}h
              </div>
            </div>
            <div>
              <div className="text-themed-secondary">Quotes</div>
              <div className="font-medium text-themed">
                {Math.round(metrics.avg_quote_response_hours || 0)}h
              </div>
            </div>
          </div>
        </div>

        {/* Dispute Rate */}
        <div className="bg-themed-card rounded-lg p-4 border-themed">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${getDisputeColor(metrics.dispute_rate)}`} />
              <span className="text-sm font-medium text-themed">Dispute Rate</span>
            </div>
            <Tooltip content="Percentage of orders that resulted in a dispute. Lower rates indicate better quality and service. Platform average is shown for comparison.">
              <div className="w-4 h-4 rounded-full bg-themed-secondary flex items-center justify-center cursor-help">
                <span className="text-xs text-themed-secondary">?</span>
              </div>
            </Tooltip>
          </div>
          <div className={`text-2xl font-bold ${getDisputeColor(metrics.dispute_rate)}`}>
            {metrics.dispute_rate?.toFixed(1) || '0.0'}%
          </div>
          <div className="mt-2 text-xs text-themed-muted">
            {metrics.total_disputes === 0 ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                No disputes filed
              </span>
            ) : (
              <span>
                {metrics.resolved_disputes}/{metrics.total_disputes} resolved
              </span>
            )}
          </div>
        </div>
      </div>

      {metrics.percentile_rank !== undefined && (
        <div className="mt-4 p-3 bg-themed-card rounded-lg border-themed">
          <p className="text-xs text-themed-secondary">
            This supplier ranks in the top <span className="font-semibold text-themed">{100 - (metrics.percentile_rank || 0)}%</span> of suppliers on the platform for overall reliability.
          </p>
        </div>
      )}

      {metrics.last_calculated_at && (
        <div className="mt-3 text-xs text-themed-muted text-right">
          Last updated: {new Date(metrics.last_calculated_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
