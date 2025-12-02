'use client'

import React, { useState } from 'react';
import { Bell, Package, TrendingDown, Clock, X, Check, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { formatPrice } from '@/lib/helpers/priceFormatter';
import LoadingSpinner from './LoadingSpinner';
import { getCurrentUser } from '@/lib/data/user-actions';
import { createClientSupabaseClient } from '@/lib/supabase-client';

type NotificationType = 'all' | 'price_drop' | 'stock' | 'backorder' | 'preorder';

export default function UnifiedNotificationsCenter() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [filter, setFilter] = useState<NotificationType>('all');
  const [isOpen, setIsOpen] = useState(false);

  const { data: priceAlerts, isLoading: priceAlertsLoading } = useQuery({
    queryKey: ['triggeredPriceAlerts'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];

      const supabase = createClientSupabaseClient();
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('dynamic_price_alerts')
        .select(`
          *,
          product:product_id (
            Product_ID,
            Product_Title,
            Product_Image_URL
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'triggered')
        .eq('notification_sent', false)
        .order('triggered_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60
  });

  const { data: stockNotifications, isLoading: stockLoading } = useQuery({
    queryKey: ['recentStockNotifications'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];

      const supabase = createClientSupabaseClient();
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('stock_notification_history')
        .select(`
          *,
          product:product_id (
            Product_ID,
            Product_Title,
            Product_Image_URL
          )
        `)
        .eq('user_id', user.id)
        .is('opened_at', null)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60
  });

  const { data: backorders, isLoading: backordersLoading } = useQuery({
    queryKey: ['pendingBackorders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];

      const supabase = createClientSupabaseClient();
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('backorders')
        .select(`
          *,
          product:product_id (
            Product_ID,
            Product_Title,
            Product_Image_URL
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'partially_fulfilled'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5
  });

  const { data: preorders, isLoading: preordersLoading } = useQuery({
    queryKey: ['pendingPreorders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];

      const supabase = createClientSupabaseClient();
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('preorders')
        .select(`
          *,
          product:product_id (
            Product_ID,
            Product_Title,
            Product_Image_URL
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .order('updated_at', { ascending: false});

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5
  });

  const isLoading = priceAlertsLoading || stockLoading || backordersLoading || preordersLoading;

  const allNotifications = [
    ...(priceAlerts || []).map(alert => ({
      id: alert.id,
      type: 'price_drop' as const,
      title: 'Price Drop Alert',
      message: `${alert.product?.title || alert.product?.Product_Title || 'Product'} dropped to ${formatPrice(alert.triggered_price?.toString() || '0')}`,
      productId: alert.product_id,
      image: alert.product?.thumbnail || alert.product?.Product_Image_URL,
      timestamp: alert.triggered_at
    })),
    ...(stockNotifications || []).map(notif => ({
      id: notif.id,
      type: 'stock' as const,
      title: notif.notification_type === 'back_in_stock' ? 'Back In Stock' : 'Stock Alert',
      message: notif.message,
      productId: notif.product_id,
      image: notif.product?.thumbnail || notif.product?.Product_Image_URL,
      timestamp: notif.sent_at
    })),
    ...(backorders || []).map(order => ({
      id: order.id,
      type: 'backorder' as const,
      title: 'Backorder Update',
      message: `${order.product?.title || order.product?.Product_Title || 'Your backorder'} - ${order.status}`,
      productId: order.product_id,
      image: order.product?.thumbnail || order.product?.Product_Image_URL,
      timestamp: order.updated_at
    })),
    ...(preorders || []).map(order => ({
      id: order.id,
      type: 'preorder' as const,
      title: 'Pre-Order Update',
      message: `${order.product?.title || order.product?.Product_Title || 'Your pre-order'} - ${order.status}`,
      productId: order.product_id,
      image: order.product?.thumbnail || order.product?.Product_Image_URL,
      timestamp: order.updated_at
    }))
  ];

  const filteredNotifications = filter === 'all'
    ? allNotifications
    : allNotifications.filter(n => n.type === filter);

  const sortedNotifications = filteredNotifications.sort((a, b) =>
    new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
  );

  const unreadCount = allNotifications.length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      case 'stock':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'backorder':
      case 'preorder':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleNotificationClick = (productId: string) => {
    router.push(`/${locale}/products/${productId}`);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-[#F4A024] text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-sm text-gray-400">{unreadCount} unread</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'price_drop', label: 'Price' },
                  { value: 'stock', label: 'Stock' },
                  { value: 'backorder', label: 'Backorders' },
                  { value: 'preorder', label: 'Pre-Orders' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as NotificationType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === option.value
                        ? 'bg-[#F4A024] text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : sortedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400">No notifications</p>
                  <p className="text-sm text-gray-500 mt-2">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {sortedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.productId)}
                      className="p-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {notification.image ? (
                            <img
                              src={notification.image}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                              {getTypeIcon(notification.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white">
                              {notification.title}
                            </h4>
                            {getTypeIcon(notification.type)}
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp!).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
