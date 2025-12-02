'use client'

import React, { useState } from 'react';
import { Bell, BellOff, TrendingDown, Target, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { DynamicPriceAlert } from '../types';
import { getCurrentUser } from '@/lib/data/user-actions';
import { createClientSupabaseClient } from '@/lib/supabase-client';

interface PriceAlertButtonProps {
  productId: string;
  currentPrice: number;
  productName: string;
}

export default function PriceAlertButton({
  productId,
  currentPrice,
  productName
}: PriceAlertButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertType, setAlertType] = useState<'target_price' | 'percentage_drop' | 'any_drop'>('target_price');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentageThreshold, setPercentageThreshold] = useState('10');

  const queryClient = useQueryClient();

  const { data: existingAlert } = useQuery({
    queryKey: ['priceAlert', productId],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return null;

      const supabase = createClientSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('dynamic_price_alerts')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as DynamicPriceAlert | null;
    },
    staleTime: 1000 * 60 * 5
  });

  const createAlert = useMutation({
    mutationFn: async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const supabase = createClientSupabaseClient();
      if (!supabase) throw new Error('Service unavailable');

      const alertData: any = {
        user_id: user.id,
        product_id: productId,
        alert_type: alertType,
        current_price: currentPrice,
        status: 'active'
      };

      if (alertType === 'target_price') {
        const target = parseFloat(targetPrice);
        if (isNaN(target) || target <= 0) {
          throw new Error('Please enter a valid target price');
        }
        if (target >= currentPrice) {
          throw new Error('Target price must be below current price');
        }
        alertData.target_price = target;
      } else if (alertType === 'percentage_drop') {
        const threshold = parseFloat(percentageThreshold);
        if (isNaN(threshold) || threshold <= 0 || threshold > 100) {
          throw new Error('Please enter a valid percentage between 1-100');
        }
        alertData.percentage_threshold = threshold;
      }

      const { data, error } = await supabase
        .from('dynamic_price_alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlert', productId] });
      toast.success('Price alert created successfully');
      setIsModalOpen(false);
      setTargetPrice('');
      setPercentageThreshold('10');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create price alert');
    }
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('dynamic_price_alerts')
        .update({ status: 'cancelled' })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlert', productId] });
      toast.success('Price alert removed');
    }
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    createAlert.mutate();
  };

  if (existingAlert) {
    return (
      <button
        onClick={() => deleteAlert.mutate(existingAlert.id)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
      >
        <BellOff className="w-4 h-4" />
        <span>Remove Price Alert</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-600 rounded-lg hover:border-[#F4A024] hover:text-[#F4A024] transition-colors"
      >
        <Bell className="w-4 h-4" />
        <span>Set Price Alert</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Set Price Alert</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Product:</p>
              <p className="text-white font-medium truncate">{productName}</p>
              <p className="text-sm text-gray-400 mt-2">Current Price:</p>
              <p className="text-2xl font-bold text-[#F4A024]">${currentPrice.toFixed(2)}</p>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Alert Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors">
                    <input
                      type="radio"
                      name="alertType"
                      value="target_price"
                      checked={alertType === 'target_price'}
                      onChange={(e) => setAlertType(e.target.value as any)}
                      className="text-[#F4A024] focus:ring-[#F4A024]"
                    />
                    <Target className="w-5 h-5 text-[#F4A024]" />
                    <span className="text-white">Target Price</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors">
                    <input
                      type="radio"
                      name="alertType"
                      value="percentage_drop"
                      checked={alertType === 'percentage_drop'}
                      onChange={(e) => setAlertType(e.target.value as any)}
                      className="text-[#F4A024] focus:ring-[#F4A024]"
                    />
                    <TrendingDown className="w-5 h-5 text-[#F4A024]" />
                    <span className="text-white">Percentage Drop</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors">
                    <input
                      type="radio"
                      name="alertType"
                      value="any_drop"
                      checked={alertType === 'any_drop'}
                      onChange={(e) => setAlertType(e.target.value as any)}
                      className="text-[#F4A024] focus:ring-[#F4A024]"
                    />
                    <Bell className="w-5 h-5 text-[#F4A024]" />
                    <span className="text-white">Any Price Drop</span>
                  </label>
                </div>
              </div>

              {alertType === 'target_price' && (
                <div>
                  <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-300 mb-2">
                    Target Price ($)
                  </label>
                  <input
                    type="number"
                    id="targetPrice"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    step="0.01"
                    min="0.01"
                    max={currentPrice}
                    placeholder={`Below ${currentPrice.toFixed(2)}`}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#F4A024]"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    We&apos;ll notify you when the price drops to or below this amount
                  </p>
                </div>
              )}

              {alertType === 'percentage_drop' && (
                <div>
                  <label htmlFor="percentageThreshold" className="block text-sm font-medium text-gray-300 mb-2">
                    Drop Threshold (%)
                  </label>
                  <input
                    type="number"
                    id="percentageThreshold"
                    value={percentageThreshold}
                    onChange={(e) => setPercentageThreshold(e.target.value)}
                    step="1"
                    min="1"
                    max="100"
                    placeholder="10"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#F4A024]"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    We&apos;ll notify you when the price drops by {percentageThreshold || '10'}% or more
                  </p>
                </div>
              )}

              {alertType === 'any_drop' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    You&apos;ll be notified whenever the price decreases by any amount
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAlert.isPending}
                  className="flex-1 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAlert.isPending ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
