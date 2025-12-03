'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Factory, Zap, Shirt, Package } from 'lucide-react'
import ProductCard from '@/components/psn/ProductCard'
import StandardFilters from '@/components/psn/StandardFilters'
import LoadingSpinner from '@/components/psn/LoadingSpinner'
import { listProducts } from '@/lib/data/products' // Mercur's data fetching
import type { HttpTypes } from '@medusajs/types'
import type { SellerProps } from '@/types/seller'
import type { Product } from '@/types/product'

type ProductWithSeller = HttpTypes.StoreProduct & { seller?: SellerProps }

interface ProductsPageClientProps {
  initialProducts: ProductWithSeller[]
  initialCount: number
  locale: string
  initialFilters?: {
    category_id?: string
    collection_id?: string
    seller_id?: string
    search?: string
  }
}

export default function ProductsPageClient({
  initialProducts,
  initialCount,
  locale,
  initialFilters,
}: ProductsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialProducts.length < initialCount)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Featured categories (PSN design)
  const featuredCategories = [
    {
      id: 'industrial-tools',
      name: 'Industrial Tools & Equipment',
      icon: <Factory className="w-12 h-12 text-[#F4A024]" />,
      description: 'Professional tools and industrial equipment'
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: <Zap className="w-12 h-12 text-[#F4A024]" />,
      description: 'Electronic components and devices'
    },
    {
      id: 'apparel-textiles',
      name: 'Apparel & Textiles',
      icon: <Shirt className="w-12 h-12 text-[#F4A024]" />,
      description: 'Clothing and textile products'
    },
    {
      id: 'logistics-packaging',
      name: 'Logistics & Packaging',
      icon: <Package className="w-12 h-12 text-[#F4A024]" />,
      description: 'Packaging and logistics solutions'
    },
  ]

  // Infinite scroll handler
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      // Use Mercur's listProducts - it handles region internally via countryCode
      const { response } = await listProducts({
        pageParam: page + 1,
        countryCode: locale,
        queryParams: {
          limit: 24,
        },
        category_id: initialFilters?.category_id,
        collection_id: initialFilters?.collection_id,
      })

      if (response.products.length > 0) {
        setProducts(prev => {
          const newProducts = [...prev, ...response.products]
          // Check if there are more products to load
          setHasMore(newProducts.length < response.count)
          return newProducts
        })
        setPage(prev => prev + 1)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more products:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, locale, initialFilters?.category_id, initialFilters?.collection_id])

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting && hasMore && !isLoading) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '400px'
    })

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [handleIntersection])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 dark:text-gray-100 light:text-gray-900">
        Products
      </h1>

      {/* Featured Categories (PSN design) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100 light:text-gray-900">
          Featured Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category) => (
            <div
              key={category.id}
              className="p-6 border rounded-lg hover:border-[#F4A024] transition-colors cursor-pointer"
              onClick={() => router.push(`/${locale}/categories/${category.id}`)}
            >
              {category.icon}
              <h3 className="text-xl font-semibold mt-4 dark:text-gray-100 light:text-gray-900">
                {category.name}
              </h3>
              <p className="text-gray-500 mt-2">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filters (PSN StandardFilters) - Simplified for now */}
      <div className="mb-8">
        {/* TODO: Implement full StandardFilters with proper state management */}
        <StandardFilters
          filters={{
            categories: { title: 'Categories', options: [], selected: [] },
            suppliers: { title: 'Suppliers', options: [], selected: [] },
            countries: { title: 'Countries', options: [], selected: [] },
          }}
          onFilterChange={() => {}}
          sortBy="created_at"
          setSortBy={() => {}}
          sortOrder="desc"
          setSortOrder={() => {}}
          activeDropdown={null}
          setActiveDropdown={() => {}}
        />
      </div>

      {/* Products Grid (PSN ProductCard) */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {count} products found
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => 'brand' in p && 'size' in p && 'price' in p)
              .map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product as unknown as Product}
                  priority={index < 4}
                  index={index}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No products found
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-20 flex items-center justify-center">
          {isLoading && <LoadingSpinner />}
        </div>

        {!hasMore && products.length > 0 && (
          <p className="text-center text-gray-500 mt-8">
            No more products to load
          </p>
        )}
      </section>
    </div>
  )
}

