'use client'

import React, { useState } from 'react';
import { TrendingDown, Eye, Package, Calendar, PercentIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePriceDropAlerts, useNotificationPreferences } from '@/hooks/usePriceDropAlerts';
import { formatPrice } from '@/lib/helpers/priceFormatter';
import LoadingSpinner from './LoadingSpinner';

export default function PriceDropAlertsList() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: alerts = [], isLoading } = usePriceDropAlerts(false);
  const { markAlertViewed } = useNotificationPreferences();
  const [filter, setFilter] = useState<'all' | 'unviewed'>('all');

  const filteredAlerts = filter === 'unviewed'
    ? alerts.filter(alert => !alert.viewed)
    : alerts;

  const handleViewAlert = async (alertId: string) => {
    await markAlertViewed.mutateAsync(alertId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-gray-100 light:text-gray-900">
            Price Drop Alerts
          </h2>
          <p className="text-sm dark:text-gray-400 light:text-gray-600 mt-1">
            Track all price drops on your saved items
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-[#F4A024] text-gray-900'
                : 'dark:bg-gray-800 light:bg-gray-200 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unviewed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'unviewed'
                ? 'bg-[#F4A024] text-gray-900'
                : 'dark:bg-gray-800 light:bg-gray-200 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700'
            }`}
          >
            Unviewed ({alerts.filter(a => !a.viewed).length})
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 card-glow rounded-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full dark:bg-[#F4A024]/10 light:bg-[#F4A024]/20 mb-4">
            <TrendingDown className="w-8 h-8 text-[#F4A024]" />
          </div>
          <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-2">
            {filter === 'unviewed' ? 'No unviewed alerts' : 'No price drops yet'}
          </h3>
          <p className="dark:text-gray-400 light:text-gray-600 max-w-md mx-auto">
            {filter === 'unviewed'
              ? 'You have viewed all your price drop alerts'
              : 'Start saving products and we\'ll notify you when prices drop'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <Link
              key={alert.alert_id}
              href={`/${locale}/products/${alert.product_id}`}
              onClick={() => handleViewAlert(alert.alert_id)}
              className="card-glow rounded-xl p-4 hover:scale-[1.02] transition-transform"
            >
              <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={alert.product_image}
                    alt={alert.product_name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  {!alert.viewed && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F4A024] rounded-full border-2 dark:border-gray-900 light:border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold dark:text-gray-100 light:text-gray-900 line-clamp-2 mb-2">
                    {alert.product_name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm dark:text-gray-400 light:text-gray-600 line-through">
                        {formatPrice(alert.old_price.toString())}
                      </span>
                      <span className="text-lg font-bold text-[#F4A024]">
                        {formatPrice(alert.new_price.toString())}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">
                        <PercentIcon className="w-3 h-3" />
                        <span className="font-semibold">
                          -{Math.round(alert.drop_percentage)}% OFF
                        </span>
                      </div>

                      <div className="flex items-center gap-1 dark:text-gray-400 light:text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(alert.detected_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs dark:text-gray-500 light:text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>{alert.viewed ? 'Viewed' : 'New'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
