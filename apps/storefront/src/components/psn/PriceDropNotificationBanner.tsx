'use client'

import React from 'react';
import { TrendingDown, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePriceDropAlerts, useNotificationPreferences } from '@/hooks/usePriceDropAlerts';
import { formatPrice } from '@/lib/helpers/priceFormatter';

export default function PriceDropNotificationBanner() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: alerts = [] } = usePriceDropAlerts(true);
  const { markAlertViewed } = useNotificationPreferences();
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const unviewedAlerts = alerts.filter(alert => !alert.viewed && !dismissed.has(alert.alert_id));

  if (unviewedAlerts.length === 0) return null;

  const handleDismiss = async (alertId: string) => {
    setDismissed(prev => new Set(prev).add(alertId));
    await markAlertViewed.mutateAsync(alertId);
  };

  const displayAlert = unviewedAlerts[0];

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-right">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl border border-green-400/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm">
                Price Drop Alert!
              </h3>
              {unviewedAlerts.length > 1 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium">
                  +{unviewedAlerts.length - 1} more
                </span>
              )}
            </div>

            <p className="text-white/90 text-xs mb-2 line-clamp-2">
              {displayAlert.product_name}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/70 text-xs line-through">
                {formatPrice(displayAlert.old_price.toString())}
              </span>
              <span className="text-white font-bold text-sm">
                {formatPrice(displayAlert.new_price.toString())}
              </span>
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
                -{Math.round(displayAlert.drop_percentage)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/products/${displayAlert.product_id}`}
                className="flex-1 bg-white text-green-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors text-center"
                onClick={() => handleDismiss(displayAlert.alert_id)}
              >
                View Product
              </Link>
              <button
                onClick={() => handleDismiss(displayAlert.alert_id)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {unviewedAlerts.length > 1 && (
          <Link
            href={`/${locale}/profile?tab=price-alerts`}
            className="mt-3 flex items-center justify-center gap-1 text-white/90 hover:text-white text-xs transition-colors"
          >
            <Eye className="w-3 h-3" />
            View all alerts ({unviewedAlerts.length})
          </Link>
        )}
      </div>
    </div>
  );
}
