'use client'

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  itemType: 'product' | 'supplier';
  itemName: string;
  itemId: string;
  additionalInfo?: {
    productsCount?: number;
    country?: string;
    category?: string;
  };
  isDeleting?: boolean;
}

const DELETION_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam_or_scam', label: 'Spam or Scam' },
  { value: 'duplicate_entry', label: 'Duplicate Entry' },
  { value: 'broken_links', label: 'Broken Links' },
  { value: 'outdated_information', label: 'Outdated Information' },
  { value: 'copyright_violation', label: 'Copyright Violation' },
  { value: 'low_quality_data', label: 'Low Quality Data' },
  { value: 'user_request', label: 'User Request' },
  { value: 'other', label: 'Other (specify below)' }
];

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
  itemId,
  additionalInfo,
  isDeleting = false
}: ConfirmDeleteModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const reason = selectedReason === 'other' && customReason
      ? customReason
      : DELETION_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;

    if (reason && reason.length >= 10) {
      onConfirm(reason);
    }
  };

  const isValid = () => {
    if (!selectedReason) return false;
    if (selectedReason === 'other') {
      return customReason.trim().length >= 10;
    }
    return true;
  };

  const getFinalReason = () => {
    if (selectedReason === 'other' && customReason) {
      return customReason;
    }
    return DELETION_REASONS.find(r => r.value === selectedReason)?.label || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Delete {itemType === 'product' ? 'Product' : 'Supplier'}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-yellow-200 font-medium">Soft Delete - 14 Day Grace Period</p>
                <p className="text-sm text-yellow-200/80">
                  This item will be moved to deleted items and can be restored within 14 days.
                  After 14 days, it will be permanently deleted automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-gray-700/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Item Name:</span>
                <span className="text-white font-medium">{itemName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Item ID:</span>
                <span className="text-white font-mono text-sm">{itemId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Type:</span>
                <span className="text-white capitalize">{itemType}</span>
              </div>
              {additionalInfo?.country && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Country:</span>
                  <span className="text-white">{additionalInfo.country}</span>
                </div>
              )}
              {additionalInfo?.category && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Category:</span>
                  <span className="text-white">{additionalInfo.category}</span>
                </div>
              )}
            </div>

            {itemType === 'supplier' && additionalInfo?.productsCount !== undefined && additionalInfo.productsCount > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-medium mb-1">Cascade Delete Warning</p>
                    <p className="text-sm text-red-200/80">
                      Deleting this supplier will also delete <strong>{additionalInfo.productsCount}</strong>{' '}
                      associated product{additionalInfo.productsCount !== 1 ? 's' : ''}. All items can be restored within 14 days.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="deletion-reason" className="block text-sm font-medium text-gray-300">
              Deletion Reason <span className="text-red-400">*</span>
            </label>
            <select
              id="deletion-reason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              disabled={isDeleting}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024] disabled:opacity-50"
            >
              <option value="">Select a reason...</option>
              {DELETION_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <label htmlFor="custom-reason" className="block text-sm font-medium text-gray-300">
                Please specify reason (minimum 10 characters) <span className="text-red-400">*</span>
              </label>
              <textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={isDeleting}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#F4A024] disabled:opacity-50"
                placeholder="Explain why this item is being deleted..."
              />
              <p className="text-xs text-gray-400">
                {customReason.length}/10 characters minimum
              </p>
            </div>
          )}

          {selectedReason && getFinalReason().length >= 10 && (
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">This deletion will be logged as:</p>
              <p className="text-sm text-white italic">{getFinalReason()}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid() || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
