'use client'

import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useCollectionItems } from '@/hooks/useSupplierCollections';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import type { SupplierCollection } from '../types';

interface SupplierCollectionCardProps {
  collection: SupplierCollection;
}

export default function SupplierCollectionCard({ collection }: SupplierCollectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(collection.is_featured);
  const { items, isLoading } = useCollectionItems(isExpanded ? collection.id : undefined);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      {collection.banner_image_url && (
        <div className="aspect-[3/1] bg-gray-900 overflow-hidden">
          <img
            src={collection.banner_image_url}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{collection.name}</h3>
              {collection.is_featured && (
                <span className="px-2 py-1 bg-[#F4A024]/20 text-[#F4A024] text-xs font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>
            {collection.description && (
              <p className="text-gray-400 text-sm mb-3">{collection.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="w-4 h-4" />
              <span>{collection.item_count || 0} products</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t border-gray-700">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                <p>No products in this collection yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  item.product && (
                    <div key={item.id} className="relative">
                      <ProductCard product={item.product} />
                      {item.highlight_text && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            {item.highlight_text}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
