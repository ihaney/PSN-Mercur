'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { X, Package, Building2, Search, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import ProductCard from '@/components/psn/ProductCard';
import SupplierCard from '@/components/psn/SupplierCard';
import { Product } from '@/types/product';
import { Supplier } from '@/types/psn';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'products' | 'suppliers'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const { products, suppliers, isLoading } = useSearch(searchQuery, searchMode);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleProductClick = (product: Product) => {
    router.push(`/${locale}/products/${product.id}`);
    onClose();
  };

  const handleSupplierClick = (supplier: Supplier) => {
    const supplierId = supplier.id || supplier.Supplier_ID || '';
    const supplierName = supplier.name || supplier.Supplier_Title || '';
    const slug = supplierName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    router.push(`/${locale}/sellers/${slug}-${supplierId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-700">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white placeholder-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-[#F4A024]"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Mode Tabs */}
        <div className="flex gap-2 px-4 pt-2 border-b border-gray-700">
          <button
            onClick={() => setSearchMode('all')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              searchMode === 'all'
                ? 'bg-gray-800 text-[#F4A024]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSearchMode('products')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              searchMode === 'products'
                ? 'bg-gray-800 text-[#F4A024]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setSearchMode('suppliers')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              searchMode === 'suppliers'
                ? 'bg-gray-800 text-[#F4A024]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Suppliers
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && searchQuery.length > 2 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#F4A024] animate-spin" />
              <span className="ml-2 text-gray-400">Searching...</span>
            </div>
          ) : searchQuery.length <= 2 ? (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Type at least 3 characters to search</p>
            </div>
          ) : (searchMode === 'all' || searchMode === 'products') && products.length === 0 && 
              (searchMode === 'all' || searchMode === 'suppliers') && suppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Products Results */}
              {(searchMode === 'all' || searchMode === 'products') && products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-[#F4A024]" />
                    <h3 className="text-lg font-semibold text-white">
                      Products ({products.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map((product) => (
                      <div key={product.id} onClick={() => handleProductClick(product)}>
                        <ProductCard product={product as Product} />
                      </div>
                    ))}
                  </div>
                  {products.length > 6 && (
                    <Link
                      href={`/${locale}/search?q=${encodeURIComponent(searchQuery)}&mode=products`}
                      onClick={onClose}
                      className="block mt-4 text-center text-[#F4A024] hover:underline"
                    >
                      View all {products.length} products
                    </Link>
                  )}
                </div>
              )}

              {/* Suppliers Results */}
              {(searchMode === 'all' || searchMode === 'suppliers') && suppliers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-[#F4A024]" />
                    <h3 className="text-lg font-semibold text-white">
                      Suppliers ({suppliers.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {suppliers.slice(0, 5).map((supplier) => (
                      <div key={supplier.id} onClick={() => handleSupplierClick(supplier)}>
                        <SupplierCard supplier={supplier as Supplier} />
                      </div>
                    ))}
                  </div>
                  {suppliers.length > 5 && (
                    <Link
                      href={`/${locale}/search?q=${encodeURIComponent(searchQuery)}&mode=suppliers`}
                      onClick={onClose}
                      className="block mt-4 text-center text-[#F4A024] hover:underline"
                    >
                      View all {suppliers.length} suppliers
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
