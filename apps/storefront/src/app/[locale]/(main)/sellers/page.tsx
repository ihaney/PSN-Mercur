import { Metadata } from "next"
import { headers } from "next/headers"
import { Suspense } from "react"
import { listSuppliersWithMetadata } from "@/lib/data/suppliers"
import SuppliersPageClient from "./SuppliersPageClient"
import LoadingSpinner from "@/components/psn/LoadingSpinner"
import { toHreflang } from "@/lib/helpers/hreflang"

export const revalidate = 3600 // 1 hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const canonical = `${baseUrl}/${locale}/sellers`

  const title = "Suppliers - Paisán"
  const description = "Browse all suppliers from Latin America. Connect with trusted suppliers and source quality products."

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

export default async function SuppliersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const search = await searchParams
  
  // Build filters from searchParams
  const filters = {
    selectedCategories: search.category
      ? (Array.isArray(search.category) ? search.category : [search.category]).map(String)
      : undefined,
    selectedCountries: search.country
      ? (Array.isArray(search.country) ? search.country : [search.country]).map(String)
      : undefined,
    search: search.query as string | undefined,
  }

  // Fetch initial data server-side
  const { suppliers, count } = await listSuppliersWithMetadata({
    limit: 50,
    offset: 0,
    search: filters.search,
    country: filters.selectedCountries?.[0],
    category: filters.selectedCategories?.[0],
  })

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuppliersPageClient 
        initialSuppliers={suppliers}
        initialCount={count}
        locale={locale}
        initialFilters={filters}
      />
    </Suspense>
  )
}

