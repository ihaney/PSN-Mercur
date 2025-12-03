'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Share2, Bookmark } from 'lucide-react'
import ShareModal from '@/components/psn/ShareModal'
import ImageGallery, { GalleryImage } from '@/components/psn/ImageGallery'
import ProductCard from '@/components/psn/ProductCard'
import LoadingSpinner from '@/components/psn/LoadingSpinner'
import { formatPrice } from '@/lib/helpers/priceFormatter'
import toast from 'react-hot-toast'
import { addToCart } from '@/lib/data/cart' // Mercur's add to cart
import { useCartContext } from '@/components/providers' // Mercur's cart context
import { listProducts } from '@/lib/data/products' // Mercur's product fetching
import { getProductPrice } from '@/lib/helpers/get-product-price' // Mercur's price helper
import { ProductVariants } from '@/components/molecules' // Mercur's variant selector
import useGetAllSearchParams from '@/hooks/useGetAllSearchParams'
import { useWishlistToggle } from '@/hooks/useWishlistToggle'
import type { HttpTypes } from '@medusajs/types'
import type { SellerProps } from '@/types/seller'
import type { Product } from '@/types/product'

// Lazy load components
const FreightHelper = lazy(() => import('@/components/psn/FreightHelper'))

// ProductQASection component
const ProductQASection = lazy(() => import('@/components/psn/ProductQASection').then(mod => ({ default: mod.ProductQASection })))

type ProductWithSeller = HttpTypes.StoreProduct & { seller?: SellerProps }

interface ProductPageClientProps {
  product: ProductWithSeller
  locale: string
  user: HttpTypes.StoreCustomer | null
  wishlist?: any[]
}

// Helper to convert variant options to keymap (from Mercur's ProductDetailsHeader)
const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce(
    (
      acc: Record<string, string>,
      varopt: HttpTypes.StoreProductOptionValue
    ) => {
      acc[varopt.option?.title.toLowerCase() || ""] = varopt.value
      return acc
    },
    {}
  ) || {}
}

export default function ProductPageClient({ 
  product, 
  locale,
  user,
  wishlist = []
}: ProductPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { onAddToCart, cart } = useCartContext() // Mercur's cart context
  const { allSearchParams } = useGetAllSearchParams()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<ProductWithSeller[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  // Wishlist toggle hook
  const { isInWishlist, toggle: toggleWishlist, isLoading: isWishlistLoading } = useWishlistToggle({
    productId: product.id,
    wishlist,
    user,
  })

  // Get product price using Mercur's helper
  const { cheapestVariant, cheapestPrice } = getProductPrice({
    product,
  })

  // Check if product has any valid prices in current region
  const hasAnyPrice = cheapestPrice !== null && cheapestVariant !== null

  // Set default variant selection (from Mercur's logic)
  const selectedVariant = hasAnyPrice
    ? {
        ...optionsAsKeymap(cheapestVariant?.options ?? null),
        ...allSearchParams,
      }
    : allSearchParams

  // Get selected variant id (from Mercur's logic)
  const variantId =
    product.variants?.find(({ options }: { options: any }) =>
      options?.every((option: any) =>
        selectedVariant[option.option?.title.toLowerCase() || ""]?.includes(
          option.value
        )
      )
    )?.id || cheapestVariant?.id || product.variants?.[0]?.id || ""

  // Get variant price
  const { variantPrice } = getProductPrice({
    product,
    variantId,
  })

  const variantStock =
    product.variants?.find(({ id }) => id === variantId)?.inventory_quantity ||
    0

  const variantHasPrice = !!product.variants?.find(({ id }) => id === variantId)
    ?.calculated_price

  const isVariantStockMaxLimitReached =
    (cart?.items?.find((item) => item.variant_id === variantId)?.quantity ??
      0) >= variantStock

  // Wishlist state is now managed by useWishlistToggle hook

  // Fetch related products
  useEffect(() => {
    async function fetchRelated() {
      const categoryId = product?.collection_id || product?.categories?.[0]?.id
      if (categoryId) {
        try {
          const { response } = await listProducts({
            pageParam: 1,
            countryCode: locale,
            queryParams: {
              limit: 4,
            },
            category_id: categoryId,
          })
          // Filter out current product
          const related = response.products.filter(
            (p) => p.id !== product.id
          )
          setRelatedProducts(related.slice(0, 4))
        } catch (error) {
          console.error('Error fetching related products:', error)
        }
      }
    }
    fetchRelated()
  }, [product?.collection_id, product?.categories, product.id, locale])

  // Handle add to cart using Mercur's logic
  const handleAddToCart = async () => {
    if (!variantId || !hasAnyPrice) {
      toast.error('Please select a variant')
      return
    }

    setIsAdding(true)

    try {
      const variant = product.variants?.find((v) => v.id === variantId)
      if (!variant) {
        toast.error('Variant not found')
        return
      }

      const subtotal = +(variantPrice?.calculated_price_without_tax_number || 0)
      const total = +(variantPrice?.calculated_price_number || 0)

      const storeCartLineItem = {
        thumbnail: product.thumbnail || "",
        product_title: product.title,
        quantity: quantity,
        subtotal,
        total,
        tax_total: total - subtotal,
        variant_id: variantId,
        product_id: product.id,
        variant: variant,
      }

      // Use Mercur's cart context for optimistic update
      if (!isVariantStockMaxLimitReached) {
        onAddToCart(storeCartLineItem, variantPrice?.currency_code || "usd")
      }

      // Use Mercur's addToCart server action
      await addToCart({
        variantId: variantId,
        quantity: quantity,
        countryCode: locale,
      })

      toast.success('Added to cart')
    } catch (error) {
      toast.error('Failed to add to cart')
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Handle wishlist toggle
  const handleToggleWishlist = async () => {
    await toggleWishlist()
  }

  // Convert product images to gallery format
  const galleryImages: GalleryImage[] = product.images?.map((img, idx) => ({
    id: img.id || `img-${idx}`,
    url: img.url || '',
    displayOrder: idx,
    isPrimary: idx === 0,
  })) || []

  // If no images, use thumbnail
  if (galleryImages.length === 0 && product.thumbnail) {
    galleryImages.push({
      id: 'thumbnail',
      url: product.thumbnail,
      displayOrder: 0,
      isPrimary: true,
    })
  }

  const productTitle = product.title || 'Product'
  const productDescription = product.description || ''
  const productPrice = variantPrice?.calculated_price || cheapestPrice?.calculated_price || '0'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images - PSN ImageGallery */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <ImageGallery 
              images={galleryImages} 
              productName={productTitle}
            />
          </Suspense>
        </div>

        {/* Product Info - PSN Layout */}
        <div>
          <h1 className="text-4xl font-bold mb-4 dark:text-gray-100 light:text-gray-900">
            {productTitle}
          </h1>
          
          <div className="mb-6">
            {hasAnyPrice && variantPrice ? (
              <>
                <p className="text-3xl font-semibold text-[#F4A024] mb-2">
                  {variantPrice.calculated_price}
                </p>
                {variantPrice.calculated_price_number !==
                  variantPrice.original_price_number && (
                  <p className="text-lg text-gray-500 line-through">
                    {variantPrice.original_price}
                  </p>
                )}
              </>
            ) : (
              <p className="text-lg text-gray-500">
                Not available in your region
              </p>
            )}
            {(() => {
              const moq = product.metadata?.moq;
              return moq ? (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  MOQ: {String(moq)}
                </p>
              ) : null;
            })()}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {productDescription}
            </p>
          </div>

          {/* Variant Selection - Use Mercur's ProductVariants */}
          {hasAnyPrice && product.options && product.options.length > 0 && (
            <div className="mb-6">
              <ProductVariants 
                product={product} 
                selectedVariant={selectedVariant}
              />
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max={variantStock || undefined}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="border rounded-lg px-3 py-2 w-24 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            {variantStock > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {variantStock} available
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !variantStock || !variantHasPrice || !hasAnyPrice || isVariantStockMaxLimitReached}
              className="px-6 py-3 bg-[#F4A024] text-white rounded-lg hover:bg-[#ff8800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding 
                ? 'Adding...' 
                : !hasAnyPrice
                ? 'NOT AVAILABLE IN YOUR REGION'
                : variantStock && variantHasPrice
                ? 'ADD TO CART'
                : 'OUT OF STOCK'}
            </button>
            <button
              onClick={handleToggleWishlist}
              disabled={isWishlistLoading}
              className={`px-6 py-3 border rounded-lg transition-colors disabled:opacity-50 ${
                isInWishlist
                  ? 'bg-[#F4A024] text-white border-[#F4A024]'
                  : 'border-gray-300 dark:border-gray-700 hover:border-[#F4A024]'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-[#F4A024] transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6 dark:border-gray-700">
            <h3 className="font-semibold mb-4 dark:text-gray-100 light:text-gray-900">
              Product Details
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Category</dt>
                <dd className="dark:text-gray-100 light:text-gray-900">
                  {product.categories?.[0]?.name || product.collection?.title || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Country</dt>
                <dd className="dark:text-gray-100 light:text-gray-900">
                  {(product as any).regions?.[0]?.name || product.metadata?.country || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Seller</dt>
                <dd className="dark:text-gray-100 light:text-gray-900">
                  {product.seller?.name || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 dark:text-gray-100 light:text-gray-900">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts
              .filter((p) => 'brand' in p && 'size' in p && 'price' in p && 'originalPrice' in p)
              .map((relatedProduct) => (
                <ProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct as unknown as Product}
                />
              ))}
          </div>
        </section>
      )}

      {/* Lazy loaded sections */}
      <Suspense fallback={<LoadingSpinner />}>
        <FreightHelper 
          productId={product.id}
          productPrice={String(variantPrice || product.variants?.[0]?.calculated_price?.calculated_amount || 0)}
          productCategory={product.collection?.handle || product.categories?.[0]?.handle || ''}
          productMOQ={String(product.metadata?.moq || '1')}
          productCountry={typeof product.metadata?.country === 'string' ? product.metadata.country : ''}
        />
        <ProductQASection 
          productId={product.id} 
          supplierId={product.seller?.id}
        />
      </Suspense>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        productName={productTitle}
      />
    </div>
  )
}

