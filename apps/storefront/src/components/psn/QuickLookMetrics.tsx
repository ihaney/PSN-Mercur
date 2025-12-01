'use client'

import React, { useState, useEffect } from 'react';
import { Building2, Users, Globe } from 'lucide-react';
export default function QuickLookMetrics() {
  const [metrics, setMetrics] = useState({
    suppliers: 0,
    products: 0,
    countries: 0
  });

  // Function to format numbers to nearest 500 with K suffix
  const formatMetricNumber = (num: number): string => {
    if (num < 1000) {
      return num.toString();
    }

    // Round to nearest 500
    const rounded = Math.round(num / 500) * 500;

    if (rounded >= 1000) {
      const kValue = rounded / 1000;
      // If it's a whole number, show without decimal
      if (kValue % 1 === 0) {
        return `${kValue}K`;
      } else {
        // Show one decimal place
        return `${kValue.toFixed(1)}K`;
      }
    }

    return rounded.toString();
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // TODO: Fetch metrics from Medusa backend
        // For now, use placeholder values or fetch from listProducts/listSellers
        // Option 1: Fetch from Medusa (when endpoints are available)
        // const response = await fetch('/api/metrics');
        // const data = await response.json();
        
        // Option 2: Placeholder values (can be enhanced later)
        // These could be fetched from:
        // - listProducts() for product count
        // - listSellers() for supplier count
        // - listRegions() for country count
        
        setMetrics({
          suppliers: 0, // TODO: Fetch from Medusa sellers endpoint
          products: 0,  // TODO: Fetch from Medusa products endpoint
          countries: 0  // TODO: Fetch from Medusa regions endpoint
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 border dark:border-white/20 light:border-[#F4A024]/30">
      {/* Animated Water Gradient Background - Dark Mode */}
      <div className="absolute inset-0 dark:block hidden animate-water-flow"
        style={{
          background: 'linear-gradient(135deg, #121218 0%, #1e1e32 20%, #121218 40%, #1e1e32 60%, #121218 80%, #1e1e32 100%)',
          backgroundSize: '400% 400%',
          willChange: 'background-position',
          opacity: 1
        }}
      />

      {/* Secondary Water Layer - Dark Mode */}
      <div className="absolute inset-0 dark:block hidden animate-water-wave opacity-30"
        style={{
          background: 'radial-gradient(ellipse at top left, #1e1e32 0%, transparent 50%), radial-gradient(ellipse at bottom right, #0a0a0e 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          willChange: 'background-position'
        }}
      />

      {/* Animated Water Gradient Background - Light Mode */}
      <div className="absolute inset-0 light:block hidden animate-water-flow"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 20%, #e5e7eb 40%, #d1d5db 60%, #f9fafb 80%, #ffffff 100%)',
          backgroundSize: '400% 400%',
          willChange: 'background-position',
          opacity: 1
        }}
      />

      {/* Secondary Water Layer - Light Mode */}
      <div className="absolute inset-0 light:block hidden animate-water-wave opacity-20"
        style={{
          background: 'radial-gradient(ellipse at top left, #e5e7eb 0%, transparent 50%), radial-gradient(ellipse at bottom right, #f3f4f6 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          willChange: 'background-position'
        }}
      />

      {/* Backdrop blur and glass effect */}
      <div className="absolute inset-0 backdrop-blur-sm dark:bg-black/10 light:bg-white/20" />

      {/* Content */}
      <div className="relative z-10 py-3">
        <div className="mb-4">
          <div className="text-center">
            <h3 className="text-4xl font-bold paisan-text text-[#F4A024] mb-2">
              Paisán
            </h3>
            <p className="text-xl text-gray-900 dark:text-gray-300 mb-4">
              A Trusted Sourcing Tool
            </p>
            <p className="text-base text-gray-700 dark:text-gray-400 max-w-3xl mx-auto">
              Simplifying sourcing across Latin America by providing comprehensive supplier and product data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-3">
              <Building2 className="w-6 h-6 text-[#F4A024]" />
            </div>
            <div className="text-3xl font-bold text-[#F4A024] mb-1">
              {formatMetricNumber(metrics.suppliers)}+
            </div>
            <div className="text-base text-gray-900 dark:text-gray-300">Suppliers</div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-3">
              <Users className="w-6 h-6 text-[#F4A024]" />
            </div>
            <div className="text-3xl font-bold text-[#F4A024] mb-1">
              {formatMetricNumber(metrics.products)}+
            </div>
            <div className="text-base text-gray-900 dark:text-gray-300">Products</div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F4A024]/10 rounded-lg mb-3">
              <Globe className="w-6 h-6 text-[#F4A024]" />
            </div>
            <div className="text-3xl font-bold text-[#F4A024] mb-1">
              {metrics.countries}
            </div>
            <div className="text-base text-gray-900 dark:text-gray-300">Countries</div>
          </div>
        </div>
      </div>
    </div>
  );
}