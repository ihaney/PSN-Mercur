'use client'

import React, { useState, useEffect } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import ReadReceiptModal from './ReadReceiptModal';

interface ReadReceiptIndicatorProps {
  messageId: string;
  isRead: boolean;
  isOwnMessage: boolean;
  compact?: boolean;
  showModal?: boolean;
}

interface ReadReceipt {
  reader_id: string;
  read_at: string;
  reader_name?: string;
}

export default function ReadReceiptIndicator({
  messageId,
  isRead,
  isOwnMessage,
  compact = false,
  showModal = false
}: ReadReceiptIndicatorProps) {
  const [receipts, setReceipts] = useState<ReadReceipt[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRead && isOwnMessage) {
      fetchReadReceipts();
    }
  }, [messageId, isRead, isOwnMessage]);

  const fetchReadReceipts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('read_receipt_tracking')
        .select('reader_id, read_at')
        .eq('message_id', messageId);

      if (error) throw error;

      if (data && data.length > 0) {
        const receiptsWithNames = await Promise.all(
          data.map(async (receipt) => {
            const { data: memberData } = await supabase
              .from('members')
              .select('display_name, email')
              .eq('auth_id', receipt.reader_id)
              .maybeSingle();

            if (memberData) {
              return {
                ...receipt,
                reader_name: memberData.display_name || memberData.email || 'Unknown'
              };
            }

            const { data: supplierData } = await supabase
              .from('supplier_claim_requests')
              .select('Supplier:supplier_id(Supplier_Title)')
              .eq('reviewed_by_auth_id', receipt.reader_id)
              .eq('status', 'approved')
              .maybeSingle();

            if (supplierData?.Supplier) {
              return {
                ...receipt,
                reader_name: supplierData.Supplier.Supplier_Title || 'Unknown'
              };
            }

            return {
              ...receipt,
              reader_name: 'Unknown'
            };
          })
        );

        setReceipts(receiptsWithNames);
      }
    } catch (error) {
      console.error('Error fetching read receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOwnMessage) {
    return null;
  }

  const formatReadTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (compact) {
    return (
      <>
        <button
          onClick={(e) => {
            if (showModal && isRead && receipts.length > 0) {
              e.stopPropagation();
              setShowReceiptModal(true);
            }
          }}
          className={`inline-flex items-center gap-1 ml-2 ${
            showModal && isRead && receipts.length > 0 ? 'cursor-pointer hover:opacity-70' : ''
          }`}
          title={isRead && receipts.length > 0 ? 'View read receipts' : ''}
        >
          {isRead ? (
            <CheckCheck className="w-3 h-3 text-blue-400" />
          ) : (
            <Check className="w-3 h-3 text-gray-400" />
          )}
        </button>
        {showReceiptModal && (
          <ReadReceiptModal
            messageId={messageId}
            onClose={() => setShowReceiptModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="relative inline-flex items-center">
        <button
          className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => {
            if (showModal && isRead && receipts.length > 0) {
              setShowReceiptModal(true);
            }
          }}
          title={isRead && receipts.length > 0 ? 'Click to view detailed read receipts' : ''}
        >
          {isRead ? (
            <CheckCheck className="w-4 h-4 text-blue-400" />
          ) : (
            <Check className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-xs text-gray-400">
            {isRead ? 'Read' : 'Sent'}
          </span>
        </button>

      {showTooltip && isRead && receipts.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 dark:bg-gray-900 light:bg-white rounded-lg shadow-xl border dark:border-gray-700 light:border-gray-200 whitespace-nowrap z-20 min-w-[200px]">
          <div className="text-xs font-medium dark:text-gray-200 light:text-gray-800 mb-2">
            Read by:
          </div>
          {receipts.map((receipt, index) => (
            <div key={index} className="text-xs dark:text-gray-300 light:text-gray-700 mb-1">
              <div className="font-medium">{receipt.reader_name}</div>
              <div className="text-gray-500">{formatReadTime(receipt.read_at)}</div>
            </div>
          ))}
          <div className="absolute top-full left-4 -mt-1">
            <div className="w-2 h-2 dark:bg-gray-900 light:bg-white border-r dark:border-gray-700 light:border-gray-200 border-b dark:border-gray-700 light:border-gray-200 transform rotate-45"></div>
          </div>
        </div>
      )}
      </div>
      {showReceiptModal && (
        <ReadReceiptModal
          messageId={messageId}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </>
  );
}
