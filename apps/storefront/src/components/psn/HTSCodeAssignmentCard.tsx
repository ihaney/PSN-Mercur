'use client'

import React, { useState } from 'react';
import { FileText, Search, Check, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductHTSWithTariff, assignHTSCodeToProduct, type HTSWithTariff } from '@/lib/freightCalculator';
import HTSCodeSearchModal from './modals/HTSCodeSearchModal';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface HTSCodeAssignmentCardProps {
  productId: string;
  productTitle: string;
  canEdit: boolean;
  destinationCountry?: string;
}

export default function HTSCodeAssignmentCard({
  productId,
  productTitle,
  canEdit,
  destinationCountry = 'United States'
}: HTSCodeAssignmentCardProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: htsInfo, isLoading } = useQuery({
    queryKey: ['product-hts-tariff', productId, destinationCountry],
    queryFn: () => getProductHTSWithTariff(productId, destinationCountry),
    staleTime: 1000 * 60 * 5,
  });

  const assignMutation = useMutation({
    mutationFn: async (htsCodeId: string) => {
      return await assignHTSCodeToProduct(productId, htsCodeId, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-hts-tariff', productId] });
      toast.success('HTS code assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning HTS code:', error);
      toast.error('Failed to assign HTS code');
    }
  });

  const handleSelectHTS = async (htsCode: any) => {
    await assignMutation.mutateAsync(htsCode.id);
  };

  const getAssignmentMethodLabel = (method?: string) => {
    switch (method) {
      case 'admin_approved':
        return { label: 'Admin Verified', color: 'text-green-400 bg-green-400/10' };
      case 'supplier_assigned':
        return { label: 'Supplier Assigned', color: 'text-blue-400 bg-blue-400/10' };
      case 'ai_suggested':
        return { label: 'AI Suggested', color: 'text-purple-400 bg-purple-400/10' };
      default:
        return { label: 'Manual', color: 'text-gray-400 bg-gray-400/10' };
    }
  };

  const getConfidenceBadge = (score?: number) => {
    if (!score) return null;

    const percentage = Math.round(score * 100);
    let color = 'text-gray-400 bg-gray-400/10';

    if (percentage >= 80) color = 'text-green-400 bg-green-400/10';
    else if (percentage >= 50) color = 'text-yellow-400 bg-yellow-400/10';
    else color = 'text-red-400 bg-red-400/10';

    return (
      <span className={`text-xs px-2 py-1 rounded ${color}`}>
        {percentage}% confidence
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F4A024]/10 rounded-lg">
              <FileText className="w-5 h-5 text-[#F4A024]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">HTS Classification</h3>
              <p className="text-sm text-gray-400">Harmonized Tariff Schedule Code</p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowSearchModal(true)}
              disabled={assignMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {htsInfo ? <Edit2 className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              {htsInfo ? 'Change' : 'Assign'} HTS Code
            </button>
          )}
        </div>

        {htsInfo ? (
          <div className="space-y-4">
            {/* HTS Code Display */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-2xl font-bold text-[#F4A024]">
                      {htsInfo.full_code}
                    </span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {htsInfo.description}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {htsInfo.assignment_method && (
                  <span className={`text-xs px-2 py-1 rounded ${getAssignmentMethodLabel(htsInfo.assignment_method).color}`}>
                    {getAssignmentMethodLabel(htsInfo.assignment_method).label}
                  </span>
                )}
                {getConfidenceBadge(htsInfo.confidence_score)}
              </div>
            </div>

            {/* Tariff Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">General Duty Rate</p>
                <p className="text-xl font-bold text-white">
                  {(htsInfo.general_rate * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Rate for {destinationCountry}</p>
                <p className="text-xl font-bold text-[#F4A024]">
                  {htsInfo.destination_rate !== undefined
                    ? `${(htsInfo.destination_rate * 100).toFixed(2)}%`
                    : 'No data'}
                </p>
              </div>
            </div>

            {/* Trade Agreement Info */}
            {htsInfo.trade_agreement && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-400">Trade Agreement</p>
                    <p className="text-sm text-gray-300 mt-1">{htsInfo.trade_agreement}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 font-medium mb-1">No HTS Code Assigned</p>
              <p className="text-sm text-gray-500 mb-4">
                Assign an HTS code to calculate accurate duties and tariffs for this product.
              </p>
              {canEdit && (
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium text-sm"
                >
                  <Search className="w-4 h-4" />
                  Search & Assign HTS Code
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Notice */}
        {!htsInfo && !canEdit && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              Contact the supplier to assign an HTS code for accurate duty calculations.
            </p>
          </div>
        )}
      </div>

      <HTSCodeSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handleSelectHTS}
        productTitle={productTitle}
      />
    </>
  );
}
