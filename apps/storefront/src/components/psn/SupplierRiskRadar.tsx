'use client'

import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, MapPin, DollarSign, Truck, Building } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './LoadingSpinner';
import Tooltip from './Tooltip';

interface CountryRisk {
  overall_risk_level: number;
  tariff_exposure_score: number;
  political_stability_score: number;
  logistics_reliability_score: number;
  risk_trend: 'improving' | 'stable' | 'declining';
  average_duty_rate: number;
  trade_agreement_status?: string;
  key_risks: string[];
  key_opportunities: string[];
  contextual_narrative?: string;
}

interface PolicyEvent {
  event_type: string;
  event_title: string;
  event_description: string;
  effective_date: string;
  impact_level: string;
}

interface RiskAssessment {
  supplier_id: string;
  supplier_country_id: string;
  country_name: string;
  country_risk: CountryRisk;
  exposure_data: Array<{
    country_id: string;
    exposure_type: string;
    exposure_percentage: number;
    product_count: number;
    tariff_impact_score: number;
    avg_tariff_rate: number;
  }>;
  recent_policy_events: PolicyEvent[];
}

interface SupplierRiskRadarProps {
  supplierId: string;
}

export default function SupplierRiskRadar({ supplierId }: SupplierRiskRadarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: riskData, isLoading } = useQuery<RiskAssessment>({
    queryKey: ['supplierRiskAssessment', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_supplier_risk_assessment', {
        p_supplier_id: supplierId
      });

      if (error) throw error;
      return data as RiskAssessment;
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!riskData || !riskData.country_risk) {
    return (
      <div className="bg-themed-secondary rounded-xl p-8 border-themed text-center">
        <div className="flex flex-col items-center gap-4">
          <MapPin className="w-16 h-16 text-themed-muted" />
          <div>
            <h3 className="text-lg font-semibold text-themed mb-2">No Risk Assessment Yet</h3>
            <p className="text-themed-secondary max-w-md mx-auto">
              A risk analysis has yet to be completed for this supplier country and category.
            </p>
          </div>
          {/* Visual placeholder for risk assessment cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
            <div className="bg-themed-card rounded-lg p-4 border-themed opacity-40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-themed-muted">Tariff Exposure</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl text-themed-muted">☆☆☆☆☆</div>
                <span className="text-sm font-semibold text-themed-muted">-/5</span>
              </div>
              <p className="text-xs text-themed-muted mt-2">Avg duty rate: --%</p>
            </div>

            <div className="bg-themed-card rounded-lg p-4 border-themed opacity-40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-themed-muted">Political Stability</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl text-themed-muted">☆☆☆☆☆</div>
                <span className="text-sm font-semibold text-themed-muted">-/5</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Minus className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-themed-muted">Pending analysis</span>
              </div>
            </div>

            <div className="bg-themed-card rounded-lg p-4 border-themed opacity-40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-themed-muted">Logistics Reliability</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl text-themed-muted">☆☆☆☆☆</div>
                <span className="text-sm font-semibold text-themed-muted">-/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRiskColor = (level: number) => {
    if (level <= 2) return 'text-green-600 dark:text-green-400';
    if (level <= 3) return 'text-yellow-600 dark:text-yellow-400';
    if (level <= 4) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskBgColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 dark:bg-green-900/20';
    if (level <= 3) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (level <= 4) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getRiskLabel = (level: number) => {
    if (level <= 2) return 'Low Risk';
    if (level <= 3) return 'Moderate Risk';
    if (level <= 4) return 'Elevated Risk';
    return 'High Risk';
  };

  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= score ? 'text-[#F4A024]' : 'text-gray-300 dark:text-gray-600'}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const risk = riskData.country_risk;

  return (
    <div className="bg-themed-secondary rounded-xl p-6 border-themed">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#F4A024]" />
          <div className="text-left">
            <h3 className="text-lg font-bold text-themed">Risk Radar</h3>
            <p className="text-sm text-themed-secondary">
              Sourcing from {riskData.country_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full ${getRiskBgColor(risk.overall_risk_level)} ${getRiskColor(risk.overall_risk_level)} text-sm font-semibold`}>
            {getRiskLabel(risk.overall_risk_level)}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-themed-secondary group-hover:text-[#F4A024] transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-themed-secondary group-hover:text-[#F4A024] transition-colors" />
          )}
        </div>
      </button>

      {/* Compact View */}
      {!isExpanded && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-themed-secondary mb-1">Tariff Exposure</div>
            <div className="flex justify-center">{renderStars(risk.tariff_exposure_score)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-themed-secondary mb-1">Political Stability</div>
            <div className="flex justify-center">{renderStars(risk.political_stability_score)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-themed-secondary mb-1">Logistics Reliability</div>
            <div className="flex justify-center">{renderStars(risk.logistics_reliability_score)}</div>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Risk Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-themed-card rounded-lg p-4 border-themed">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#F4A024]" />
                  <span className="text-sm font-medium text-themed">Tariff Exposure</span>
                </div>
                <Tooltip content="Risk of tariff increases or trade policy changes affecting product costs. Lower scores indicate less exposure to tariff volatility.">
                  <div className="w-4 h-4 rounded-full bg-themed-secondary flex items-center justify-center cursor-help">
                    <span className="text-xs text-themed-secondary">?</span>
                  </div>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl">{renderStars(risk.tariff_exposure_score)}</div>
                <span className={`text-sm font-semibold ${getRiskColor(risk.tariff_exposure_score)}`}>
                  {risk.tariff_exposure_score.toFixed(1)}/5
                </span>
              </div>
              {risk.average_duty_rate > 0 && (
                <p className="text-xs text-themed-muted mt-2">
                  Avg duty rate: {risk.average_duty_rate.toFixed(1)}%
                </p>
              )}
            </div>

            <div className="bg-themed-card rounded-lg p-4 border-themed">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#F4A024]" />
                  <span className="text-sm font-medium text-themed">Political Stability</span>
                </div>
                <Tooltip content="Assessment of political and regulatory stability. Higher scores indicate more stable business environment with fewer disruptions.">
                  <div className="w-4 h-4 rounded-full bg-themed-secondary flex items-center justify-center cursor-help">
                    <span className="text-xs text-themed-secondary">?</span>
                  </div>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl">{renderStars(risk.political_stability_score)}</div>
                <span className={`text-sm font-semibold ${getRiskColor(6 - risk.political_stability_score)}`}>
                  {risk.political_stability_score.toFixed(1)}/5
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {getTrendIcon(risk.risk_trend)}
                <span className="text-xs text-themed-muted capitalize">{risk.risk_trend}</span>
              </div>
            </div>

            <div className="bg-themed-card rounded-lg p-4 border-themed">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#F4A024]" />
                  <span className="text-sm font-medium text-themed">Logistics Reliability</span>
                </div>
                <Tooltip content="Quality and reliability of shipping infrastructure and logistics. Higher scores indicate better transportation networks and faster delivery times.">
                  <div className="w-4 h-4 rounded-full bg-themed-secondary flex items-center justify-center cursor-help">
                    <span className="text-xs text-themed-secondary">?</span>
                  </div>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl">{renderStars(risk.logistics_reliability_score)}</div>
                <span className={`text-sm font-semibold ${getRiskColor(6 - risk.logistics_reliability_score)}`}>
                  {risk.logistics_reliability_score.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>

          {/* Trade Agreement Status */}
          {risk.trade_agreement_status && (
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-semibold">Trade Agreement:</span> {risk.trade_agreement_status}
              </p>
            </div>
          )}

          {/* Contextual Narrative */}
          {risk.contextual_narrative && (
            <div className="bg-themed-card rounded-lg p-4 border-themed">
              <p className="text-sm text-themed-secondary leading-relaxed">
                {risk.contextual_narrative}
              </p>
            </div>
          )}

          {/* Key Opportunities and Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risk.key_opportunities && risk.key_opportunities.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Opportunities
                </h4>
                <ul className="space-y-1">
                  {risk.key_opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {risk.key_risks && risk.key_risks.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Key Risks
                </h4>
                <ul className="space-y-1">
                  {risk.key_risks.map((riskItem, index) => (
                    <li key={index} className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span>{riskItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recent Policy Events */}
          {riskData.recent_policy_events && riskData.recent_policy_events.length > 0 && (
            <div className="bg-themed-card rounded-lg p-4 border-themed">
              <h4 className="font-semibold text-themed mb-3">Recent Policy Events</h4>
              <div className="space-y-3">
                {riskData.recent_policy_events.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-themed last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      event.impact_level === 'high' || event.impact_level === 'critical' ? 'bg-red-500' :
                      event.impact_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-themed text-sm">{event.event_title}</div>
                      <div className="text-xs text-themed-secondary mt-1">{event.event_description}</div>
                      <div className="text-xs text-themed-muted mt-1">
                        Effective: {new Date(event.effective_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How We Help Section */}
          <div className="bg-[#F4A024]/10 rounded-lg p-4 border border-[#F4A024]/20">
            <h4 className="font-semibold text-themed mb-2">How the Platform Helps You Manage Risk</h4>
            <ul className="space-y-1 text-sm text-themed-secondary">
              <li className="flex items-start gap-2">
                <span className="text-[#F4A024]">•</span>
                <span>Real-time tariff calculations using HTS codes for accurate landed cost estimates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4A024]">•</span>
                <span>Freight cost estimates from reliable Latin American shipping partners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4A024]">•</span>
                <span>Direct communication with verified suppliers for faster issue resolution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4A024]">•</span>
                <span>Supplier reliability metrics to help you choose trusted partners</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
