import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { getSupplierWithMetadata } from "@/lib/data/suppliers"
import { listProducts } from "@/lib/data/products"
import SupplierPageClient from "./SupplierPageClient"
import { notFound } from "next/navigation"

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  // Get supplier with extended metadata (Medusa + Supabase)
  const supplier = await getSupplierWithMetadata(handle)

  if (!supplier) {
    notFound()
  }

  // Get region for product fetching
  const region = await getRegion(locale)

  // Fetch products for this supplier
  let products: any[] = []
  if (region && supplier.id) {
    try {
      const { response } = await listProducts({
        pageParam: 1,
        countryCode: locale,
        queryParams: {
          limit: 50,
        },
        // Filter by seller_id if supported by Medusa API
      })

      // Filter products by seller ID
      products = response.products.filter(
        (product) => product.seller?.id === supplier.id
      )
    } catch (error) {
      console.error('Error fetching supplier products:', error)
      // Continue with empty products array
    }
  }

  return (
    <main className="container">
      <SupplierPageClient 
        supplier={supplier}
        initialProducts={products}
        locale={locale}
      />
    </main>
  )
}
