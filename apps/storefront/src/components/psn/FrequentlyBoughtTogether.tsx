'use client'

import React, { useState } from 'react';
import { useFrequentlyBoughtTogether } from '@/hooks/useCrossSellProducts';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { formatPrice } from '@/lib/helpers/priceFormatter';
import toast from 'react-hot-toast';
import { useShoppingCart } from '@/hooks/useShoppingCart';

interface FrequentlyBoughtTogetherProps {
  productId: string;
  currentProduct: {
    id: string;
    title: string;
    price: string;
    image: string;
    supplierId: string;
  };
}

export default function FrequentlyBoughtTogether({
  productId,
  currentProduct
}: FrequentlyBoughtTogetherProps) {
  const { data: products = [], isLoading } = useFrequentlyBoughtTogether(productId, 3);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set([currentProduct.id]));
  const { addItem } = useShoppingCart();
  const [adding, setAdding] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-themed-card border-themed rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-themed-secondary rounded w-3/4 mb-4" />
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-themed-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  const allProducts = [
    {
      product_id: currentProduct.id,
      product_title: currentProduct.title,
      product_price: currentProduct.price,
      product_image_url: currentProduct.image,
      supplier_id: currentProduct.supplierId,
    },
    ...products
  ];

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      // Always keep at least current product selected
      if (productId !== currentProduct.id) {
        newSelected.delete(productId);
      }
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const calculateTotal = () => {
    return allProducts
      .filter(p => selectedProducts.has(p.product_id))
      .reduce((sum, p) => {
        const price = parseFloat(p.product_price.replace(/[^0-9.]/g, '')) || 0;
        return sum + price;
      }, 0);
  };

  const handleAddAllToCart = async () => {
    setAdding(true);
    try {
      const productsToAdd = allProducts.filter(p =>
        selectedProducts.has(p.product_id) && p.product_id !== currentProduct.id
      );

      for (const product of productsToAdd) {
        await addItem.mutateAsync({
          productId: product.product_id,
          supplierId: product.supplier_id,
          quantity: 1
        });
      }

      toast.success(`Added ${productsToAdd.length} ${productsToAdd.length === 1 ? 'item' : 'items'} to cart`);
    } catch (error) {
      console.error('Error adding products to cart:', error);
      toast.error('Failed to add products to cart');
    } finally {
      setAdding(false);
    }
  };

  const selectedCount = selectedProducts.size;
  const totalPrice = calculateTotal();

  return (
    <div className="bg-themed-card border-themed rounded-lg p-6">
      <h3 className="text-lg font-semibold text-themed mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-[#F4A024]" />
        Frequently Bought Together
      </h3>

      <div className="space-y-3 mb-4">
        {allProducts.map((product, index) => (
          <div key={product.product_id}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.product_id)}
                  onChange={() => toggleProduct(product.product_id)}
                  disabled={product.product_id === currentProduct.id}
                  className="w-5 h-5 rounded border-themed-border text-[#F4A024] focus:ring-[#F4A024] focus:ring-offset-0 disabled:opacity-50"
                />
                {product.product_id === currentProduct.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F4A024] rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center gap-3">
                <img
                  src={product.product_image_url}
                  alt={product.product_title}
                  className="w-16 h-16 object-cover rounded border-themed"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=No+Image';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-themed line-clamp-2 group-hover:text-[#F4A024] transition-colors">
                    {product.product_title}
                  </p>
                  <p className="text-sm text-[#F4A024] font-semibold mt-1">
                    {formatPrice(product.product_price)}
                  </p>
                </div>
              </div>
            </label>

            {index < allProducts.length - 1 && (
              <div className="flex items-center justify-center my-2">
                <Plus className="w-4 h-4 text-themed-muted" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-themed-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-themed-muted">
            Total ({selectedCount} {selectedCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-lg font-bold text-[#F4A024]">
            {formatPrice(totalPrice.toString())}
          </span>
        </div>

        <button
          onClick={handleAddAllToCart}
          disabled={selectedCount <= 1 || adding}
          className="w-full bg-[#F4A024] hover:bg-[#d88f1f] disabled:bg-themed-muted disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          {adding ? 'Adding...' : `Add ${selectedCount > 1 ? `${selectedCount - 1} more` : 'Selected'} to Cart`}
        </button>

        {selectedCount > 1 && (
          <p className="text-xs text-themed-muted text-center mt-2">
            Save time by buying these products together
          </p>
        )}
      </div>
    </div>
  );
}
