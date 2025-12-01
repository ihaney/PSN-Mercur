import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProductPageClient from "./ProductPageClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true,
  }).then(({ response }) => response.products[0])

  return generateProductMetadata(prod)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  // Fetch product using Mercur's logic
  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true,
  }).then(({ response }) => response.products[0])

  if (!prod) {
    notFound()
  }

  if (prod.seller?.store_status === "SUSPENDED") {
    notFound()
  }

  // Get user and wishlist (Mercur's logic)
  const user = await retrieveCustomer()
  let wishlist: any[] = []
  if (user) {
    try {
      const response = await getUserWishlists()
      wishlist = response.wishlists || []
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      // Continue with empty wishlist
    }
  }

  return (
    <main className="container">
      <ProductPageClient 
        product={prod} 
        locale={locale}
        user={user}
        wishlist={wishlist}
      />
    </main>
  )
}
