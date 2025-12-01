'use client'

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import toast from 'react-hot-toast';

const COMPARISON_KEY = 'product_comparison';
const MAX_COMPARISON_ITEMS = 4;

/**
 * Hook for product comparison
 * Uses localStorage for client-side comparison
 * TODO: Sync to Medusa backend if needed
 */
export function useProductComparison() {
  const [comparisonItems, setComparisonItems] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(COMPARISON_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setComparisonItems(items);
      } catch (error) {
        console.error('Error loading comparison:', error);
      }
    }
  };

  const syncToDatabase = async (items: Product[]) => {
    // TODO: Sync to Medusa backend if needed
    // For now, just use localStorage
    try {
      // Placeholder for future backend sync
      console.log('Comparison items:', items.map(i => i.id));
    } catch (error) {
      console.error('Error syncing comparison:', error);
    }
  };

  const addToComparison = async (product: Product) => {
    if (comparisonItems.find(item => item.id === product.id)) {
      toast.error('Product already in comparison');
      return;
    }

    if (comparisonItems.length >= MAX_COMPARISON_ITEMS) {
      toast.error(`You can compare up to ${MAX_COMPARISON_ITEMS} products at once`);
      return;
    }

    const newItems = [...comparisonItems, product];
    setComparisonItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(newItems));
    }

    setIsSyncing(true);
    await syncToDatabase(newItems);
    setIsSyncing(false);

    toast.success('Added to comparison');
    setIsOpen(true);
  };

  const removeFromComparison = async (productId: string) => {
    const newItems = comparisonItems.filter(item => item.id !== productId);
    setComparisonItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(newItems));
    }

    setIsSyncing(true);
    await syncToDatabase(newItems);
    setIsSyncing(false);

    toast.success('Removed from comparison');
  };

  const clearComparison = async () => {
    setComparisonItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(COMPARISON_KEY);
    }

    setIsSyncing(true);
    try {
      await syncToDatabase([]);
    } catch (error) {
      console.error('Error clearing comparison:', error);
    }
    setIsSyncing(false);

    toast.success('Comparison cleared');
  };

  const saveComparisonHistory = async (resultedInSave: boolean = false) => {
    try {
      if (comparisonItems.length === 0) return;

      const productIds = comparisonItems.map(item => item.id);
      // TODO: Save comparison history to Medusa backend
      console.log('Comparison history:', { productIds, resultedInSave });
    } catch (error) {
      console.error('Error saving comparison history:', error);
    }
  };

  const isInComparison = (productId: string) => {
    return comparisonItems.some(item => item.id === productId);
  };

  return {
    comparisonItems,
    addToComparison,
    removeFromComparison,
    clearComparison,
    saveComparisonHistory,
    isInComparison,
    isOpen,
    setIsOpen,
    isSyncing,
    maxItems: MAX_COMPARISON_ITEMS
  };
}

