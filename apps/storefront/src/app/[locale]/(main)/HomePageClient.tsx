'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/psn/Hero'
import ProductCard from '@/components/psn/ProductCard'
import LoadingSpinner from '@/components/psn/LoadingSpinner'
import type { Product } from '@/types/product'
import type { HttpTypes } from '@medusajs/types'

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
                .filter((p): p is Product => 'brand' in p && 'size' in p && 'price' in p)
                .map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    priority={index < 4}
                    index={index}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Lazy loaded sections */}
      <div className="container mx-auto px-4 py-8">
        <QuickLookMetrics />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <DataQualitySection />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <RecentlyViewedProducts />
      </div>
    </div>
  )
}

