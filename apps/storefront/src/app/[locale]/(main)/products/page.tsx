import { Metadata } from "next"
import { headers } from "next/headers"
import { Suspense } from "react"
import { listProducts } from "@/lib/data/products" // Mercur's data fetching
import { getRegion } from "@/lib/data/regions"
import { toHreflang } from "@/lib/helpers/hreflang"
import ProductsPageClient from "./ProductsPageClient"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"

export const revalidate = 1800 // 30 minutes

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { locale } = await params
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const canonical = `${baseUrl}/${locale}/products`

  const title = "Products - Paisán"
  const description = "Browse all products from Latin American suppliers. Find quality products with detailed specifications, MOQ, and pricing."

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical,
      languages: {
        [toHreflang(locale)]: canonical,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || "Paisán"}`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Paisán",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const search = await searchParams

  // Get region for product fetching
  const region = await getRegion(locale)
  
  // Build filters from searchParams (keep Mercur's filter structure)
  const filters = {
    category_id: typeof search.category === 'string' ? search.category : undefined,
    collection_id: typeof search.collection === 'string' ? search.collection : undefined,
    seller_id: typeof search.seller === 'string' ? search.seller : undefined,
    search: typeof search.query === 'string' ? search.query : undefined,
  }

  // Fetch products using Mercur's data fetching
  let featuredProducts: any[] = []
  let count = 0
  
  if (region) {
    try {
      const { response } = await listProducts({
        pageParam: 1,
        countryCode: locale,
        queryParams: {
          limit: 24,
        },
        category_id: filters.category_id,
        collection_id: filters.collection_id,
      })

      featuredProducts = response.products
      count = response.count
    } catch (error) {
      console.error('Error fetching products:', error)
      // Continue with empty array if fetch fails
    }
  }

  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductsPageClient 
        initialProducts={featuredProducts}
        initialCount={count}
        locale={locale}
        initialFilters={filters}
      />
    </Suspense>
  )
}

