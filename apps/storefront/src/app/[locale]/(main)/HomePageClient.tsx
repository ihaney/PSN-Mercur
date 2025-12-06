'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/psn/Hero'
import ProductCard from '@/components/psn/ProductCard'
import LoadingSpinner from '@/components/psn/LoadingSpinner'
import type { Product } from '@/types/product'
import type { HttpTypes } from '@medusajs/types'

// Import Mercur sections (server components - will be rendered in page.tsx)
import { BannerSection } from '@/components/sections'
import { BlogSection } from '@/components/sections'

// Lazy load non-critical components
const QuickLookMetrics = dynamic(() => import('@/components/psn/QuickLookMetrics'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
})

const DataQualitySection = dynamic(() => import('@/components/psn/DataQualitySection'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
})

const RecentlyViewedProducts = dynamic(() => import('@/components/psn/RecentlyViewedProducts'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
})

interface HomePageClientProps {
  initialProducts: (Product | HttpTypes.StoreProduct)[]
  locale: string
}

export default function HomePageClient({ initialProducts, locale }: HomePageClientProps) {
  const [products] = useState(initialProducts)

  return (
    <div>
      <Hero />
      
      {/* Featured Products Section */}
      {products.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 dark:text-gray-100 light:text-gray-900">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products
                .filter((p) => 'brand' in p && 'size' in p && 'price' in p && 'originalPrice' in p)
                .map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product as Product} 
                    priority={index < 4}
                    index={index}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <BannerSection />

      {/* PSN-specific sections */}
      <QuickLookMetrics />
      <DataQualitySection />
      <RecentlyViewedProducts />

      {/* Blog Section (only renders if enabled and has content) */}
      <BlogSection />
    </div>
  )
}
