'use client'

import React from 'react';
import { Package, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useProductInventory } from '@/hooks/useProductInventory';
import { useStockNotifications } from '@/hooks/useStockNotifications';
import toast from 'react-hot-toast';

interface StockAvailabilityBadgeProps {
  productId: string;
  showNotifyButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StockAvailabilityBadge({
  productId,
  showNotifyButton = true,
  size = 'md'
}: StockAvailabilityBadgeProps) {
  const {
    data: inventory,
    isLoading,
    availableStock,
    isLowStock,
    isOutOfStock,
    canBackorder,
    canPreorder
  } = useProductInventory(productId);

  const { isSubscribed, createNotification } = useStockNotifications(productId);

  if (isLoading || !inventory) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleNotifyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await createNotification.mutateAsync({
        product_id: productId,
        notification_type: 'back_in_stock'
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const renderBadge = () => {
    if (inventory.stock_status === 'out_of_stock') {
      return (
        <div className="space-y-2">
          <div
            className={`inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-medium ${sizeClasses[size]}`}
          >
            <AlertCircle className={iconSize[size]} />
            <span>Out of Stock</span>
          </div>

          {canBackorder && (
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 ml-2 ${sizeClasses[size]}`}
            >
              <Clock className={iconSize[size]} />
              <span>Backorder Available</span>
            </div>
          )}

          {canPreorder && (
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 ml-2 ${sizeClasses[size]}`}
            >
              <Clock className={iconSize[size]} />
              <span>Pre-Order Available</span>
            </div>
          )}

          {showNotifyButton && !isSubscribed(productId, 'back_in_stock') && (
            <button
              onClick={handleNotifyClick}
              className="ml-2 text-sm text-[#F4A024] hover:text-[#F4A024]/80 underline"
            >
              Notify me when available
            </button>
          )}

          {showNotifyButton && isSubscribed(productId, 'back_in_stock') && (
            <span className="ml-2 text-sm text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Notification active
            </span>
          )}
        </div>
      );
    }

    if (isLowStock) {
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-medium ${sizeClasses[size]}`}
        >
          <AlertCircle className={iconSize[size]} />
          <span>Low Stock ({availableStock} left)</span>
        </div>
      );
    }

    if (inventory.stock_status === 'preorder_only') {
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 font-medium ${sizeClasses[size]}`}
        >
          <Clock className={iconSize[size]} />
          <span>Pre-Order Only</span>
        </div>
      );
    }

    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-medium ${sizeClasses[size]}`}
      >
        <CheckCircle className={iconSize[size]} />
        <span>In Stock</span>
      </div>
    );
  };

  return (
    <div className="flex items-center flex-wrap gap-2">
      {renderBadge()}
      {inventory.next_availability_date && isOutOfStock && (
        <span className="text-sm text-gray-400">
          Expected: {new Date(inventory.next_availability_date).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
