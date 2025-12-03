'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SupplierCard from '@/components/psn/SupplierCard'
import LoadingSpinner from '@/components/psn/LoadingSpinner'
import { listSuppliersWithMetadata, type SupplierWithMetadata } from '@/lib/data/suppliers'

interface SuppliersPageClientProps {
  initialSuppliers: SupplierWithMetadata[]
  initialCount: number
  locale: string
  initialFilters: {
    selectedCategories?: string[]
    selectedCountries?: string[]
    search?: string
  }
}

export default function SuppliersPageClient({
  initialSuppliers,
  initialCount,
  locale,
  initialFilters,
}: SuppliersPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialSuppliers.length < initialCount)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Infinite scroll - loadMore function defined first
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const filters = {
        selectedCategories: searchParams.get('category')?.split(',') || undefined,
        selectedCountries: searchParams.get('country')?.split(',') || undefined,
        search: searchParams.get('query') || undefined,
      }

      const result = await listSuppliersWithMetadata({
        limit: 50,
        offset: (page + 1) * 50,
        search: filters.search,
        country: filters.selectedCountries?.[0],
        category: filters.selectedCategories?.[0],
      })

      if (result.suppliers.length > 0) {
        setSuppliers(prev => [...prev, ...result.suppliers])
        setPage(prev => prev + 1)
        setHasMore(result.nextPage !== null)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more suppliers:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, searchParams])

  // Then handleIntersection
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
      <h1 className="text-4xl font-bold mb-8 dark:text-gray-100 light:text-gray-900">Suppliers</h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">{count} suppliers found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier, index) => (
          <SupplierCard 
            key={supplier.id || index} 
            supplier={supplier} 
            priority={index < 6}
            index={index}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-20 flex items-center justify-center">
        {isLoading && <LoadingSpinner />}
      </div>

      {!hasMore && suppliers.length > 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No more suppliers to load</p>
      )}
    </div>
  )
}

