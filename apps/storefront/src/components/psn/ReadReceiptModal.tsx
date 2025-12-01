'use client'

import React, { useState, useEffect } from 'react';
import { X, CheckCheck, Clock, User } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ReadReceiptModalProps {
  messageId: string;
  onClose: () => void;
}

interface ReadReceipt {
  reader_id: string;
  read_at: string;
  read_location?: string;
  reader_name: string;
  reader_avatar?: string;
}

export default function ReadReceiptModal({ messageId, onClose }: ReadReceiptModalProps) {
  const [receipts, setReceipts] = useState<ReadReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInfo, setMessageInfo] = useState<any>(null);

  useEffect(() => {
    fetchReceiptsAndMessageInfo();
  }, [messageId]);

  const fetchReceiptsAndMessageInfo = async () => {
    setLoading(true);
    try {
      const { data: message } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('id', messageId)
        .single();

      setMessageInfo(message);

      const { data: receiptsData, error } = await supabase
        .from('read_receipt_tracking')
        .select('reader_id, read_at, read_location')
        .eq('message_id', messageId)
        .order('read_at', { ascending: true });

      if (error) throw error;

      if (receiptsData && receiptsData.length > 0) {
        const receiptsWithDetails = await Promise.all(
          receiptsData.map(async (receipt) => {
            const { data: memberData } = await supabase
              .from('members')
              .select('display_name, email')
              .eq('auth_id', receipt.reader_id)
              .maybeSingle();

            if (memberData) {
              return {
                ...receipt,
                reader_name: memberData.display_name || memberData.email || 'Unknown User'
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
                reader_name: (supplierData.Supplier as any).Supplier_Title || 'Unknown Supplier'
              };
            }

            return {
              ...receipt,
              reader_name: 'Unknown'
            };
          })
        );

        setReceipts(receiptsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching read receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSinceRead = (readAt: string) => {
    const now = new Date();
    const readTime = new Date(readAt);
    const diffMs = now.getTime() - readTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="dark:bg-gray-800 light:bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b dark:border-gray-700 light:border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900">
                Read Receipts
              </h2>
              <p className="text-sm dark:text-gray-400 light:text-gray-600 mt-0.5">
                See who has read this message
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="dark:text-gray-400 light:text-gray-600 hover:text-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {messageInfo && (
          <div className="p-4 dark:bg-gray-900/50 light:bg-gray-50 border-b dark:border-gray-700 light:border-gray-200">
            <p className="text-sm dark:text-gray-300 light:text-gray-700 line-clamp-2">
              "{messageInfo.content}"
            </p>
            <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-1">
              Sent {formatDateTime(messageInfo.created_at)}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
              <p className="dark:text-gray-400 light:text-gray-600 text-sm">
                No read receipts yet
              </p>
              <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-2">
                Read receipts will appear here when the recipient opens your message
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg dark:bg-gray-700/30 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium dark:text-gray-100 light:text-gray-900 truncate">
                        {receipt.reader_name}
                      </h3>
                      <span className="text-xs dark:text-gray-400 light:text-gray-600 flex-shrink-0 ml-2">
                        {getTimeSinceRead(receipt.read_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs dark:text-gray-400 light:text-gray-600">
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                      <span>Read at {formatDateTime(receipt.read_at)}</span>
                    </div>
                    {receipt.read_location && (
                      <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-1">
                        {receipt.read_location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 light:border-gray-200 dark:bg-gray-900/50 light:bg-gray-50">
          <div className="flex items-center gap-2 text-xs dark:text-gray-400 light:text-gray-600">
            <CheckCheck className="w-4 h-4" />
            <span>
              {receipts.length === 0
                ? 'Waiting for recipient to read the message'
                : `${receipts.length} ${receipts.length === 1 ? 'person has' : 'people have'} read this message`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
