'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Package, Building2 } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useRouter, useParams } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import LoadingSpinner from './LoadingSpinner';
import { createSupplierUrl } from '@/lib/helpers/urlHelpers';
import { isBrowser } from '@/lib/helpers/isomorphic-helpers';

interface SearchResult {
  id: string;
  name: string;
  type: 'product' | 'supplier';
  image?: string;
  country?: string;
  category?: string;
  supplier?: string;
  marketplace?: string;
  price?: string;
  moq?: string;
  product_count?: number;
  description?: string;
  location?: string;
  sourceId?: string;
  sourceTitle?: string;
  url: string;
  is_verified?: boolean;
}

// Helper function to get saved search mode from localStorage
function getSavedSearchMode(): 'products' | 'suppliers' {
  if (!isBrowser) return 'products';
  
  try {
    const saved = localStorage.getItem('paisan_search_mode');
    return saved === 'products' ? 'products' : 'suppliers';
  } catch {
    return 'suppliers';
  }
}

// Helper function to save search mode to localStorage
function saveSearchMode(mode: 'products' | 'suppliers') {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem('paisan_search_mode', mode);
  } catch {
    // Silently fail if localStorage is not available
  }
}

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'products' | 'suppliers'>(getSavedSearchMode);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalSuppliers, setTotalSuppliers] = useState<number | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  
  const { products, suppliers, isLoading } = useSearch(searchQuery, searchMode);

  useEffect(() => {
    // TODO: Fetch stats from Medusa backend
    // For now, use placeholder values
    setTotalProducts(null);
    setTotalSuppliers(null);
  }, []);

  // Save search mode to localStorage whenever it changes
  useEffect(() => {
    saveSearchMode(searchMode);
  }, [searchMode]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      analytics.trackEvent('hero_search_submit', {
        props: { 
          query: searchQuery,
          mode: searchMode
        }
      });
      
      const searchParams = new URLSearchParams({
        q: searchQuery.trim(),
        mode: searchMode
      });
      router.push(`/${locale}/search?${searchParams.toString()}`);
    }
  }, [searchQuery, router, searchMode, locale]);

  const handleSearchModeChange = (mode: 'products' | 'suppliers') => {
    setSearchMode(mode);
    analytics.trackEvent('hero_search_mode_change', {
      props: { mode }
    });
  };

  return (
    <div className="mb-12 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl glow-border">
        {/* Hero Background Image - Static */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://i.postimg.cc/sgByxMj6/Golden-Dawn-Over-the-Americas.png')`
          }}
        />

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 dark:bg-black/20 light:bg-black/15 transition-colors duration-300" />
        
        <div>
          <div className="relative z-10 pb-5 sm:pb-10 md:pb-12 lg:pb-18 xl:pb-20 pt-10">
            <main className="mt-10 px-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  <span className="block">Discover</span>
                  <span className="block text-[#F4A024] drop-shadow-[0_0_15px_rgba(244,160,36,0.5)]">Latin American Products</span>
                </h1>
                <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  We connect Latin American suppliers with global markets.
                </p>
                
                {/* Stats Display */}
                {(totalProducts !== null || totalSuppliers !== null) && (
                  <div className="mt-6 flex justify-center gap-6 text-white">
                    {totalProducts !== null && (
                      <div>
                        <span className="text-2xl font-bold">{totalProducts.toLocaleString()}</span>
                        <span className="ml-2 text-sm opacity-90">Products</span>
                      </div>
                    )}
                    {totalSuppliers !== null && (
                      <div>
                        <span className="text-2xl font-bold">{totalSuppliers.toLocaleString()}</span>
                        <span className="ml-2 text-sm opacity-90">Suppliers</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-8 sm:mt-12 flex justify-center px-4">
                  <form onSubmit={handleSearch} className="w-full max-w-2xl">
                    {/* Search Mode Toggle */}
                    <div className="flex justify-center gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => handleSearchModeChange('suppliers')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          searchMode === 'suppliers'
                            ? 'bg-[#F4A024] text-gray-900 shadow-glow-orange transform scale-105'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        Suppliers
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSearchModeChange('products')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          searchMode === 'products'
                            ? 'bg-[#F4A024] text-gray-900 shadow-glow-orange transform scale-105'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        Products
                      </button>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <Search className="w-5 h-5 text-[#F4A024] group-focus-within:drop-shadow-[0_0_8px_rgba(244,160,36,0.8)]" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchMode === 'products'
                          ? "Search products, categories, suppliers..."
                          : "Search suppliers by name, location, capabilities..."}
                        className="w-full px-12 py-4 dark:bg-white/10 light:bg-white/90 hover:dark:bg-white/20 hover:light:bg-white focus:dark:bg-white/20 focus:light:bg-white rounded-lg dark:text-gray-100 light:text-gray-900 dark:placeholder-gray-400 light:placeholder-gray-600 outline-none ring-1 dark:ring-gray-700 light:ring-gray-400 focus:ring-[#F4A024] focus:shadow-glow-orange border dark:border-white/20 light:border-gray-400 transition-all duration-300"
                      />
                      {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

