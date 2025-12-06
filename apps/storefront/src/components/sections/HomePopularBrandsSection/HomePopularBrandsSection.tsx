import { Brand } from '@/types/brands';
import { BrandCard } from '@/components/organisms';
import { Carousel } from '@/components/cells';
import { listProducts } from '@/lib/data/products';

export async function HomePopularBrandsSection() {
  try {
    // Fetch products to extract brands
    const { response } = await listProducts({
      pageParam: 1,
      queryParams: {
        limit: 50, // Get more products to extract brands
      },
    })

    // Extract unique brands from products
    const brandMap = new Map<string, { name: string; count: number }>()
    
    response.products.forEach(product => {
      const brandName = product.metadata?.brand || 
                       product.metadata?.Brand || 
                       (typeof product.title === 'string' ? product.title.split(' ')[0] : undefined) // Fallback to first word of title
      
      if (brandName && typeof brandName === 'string' && brandName.length > 0) {
        const existing = brandMap.get(brandName) || { name: brandName, count: 0 }
        brandMap.set(brandName, { ...existing, count: existing.count + 1 })
      }
    })

    // Get top 4-6 brands by product count
    const brands = Array.from(brandMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((brand, index) => ({
        id: index + 1,
        name: brand.name,
        logo: `/images/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}.svg`, // Placeholder path
        href: `/products?brand=${encodeURIComponent(brand.name)}`,
      }))

    if (brands.length === 0) {
      return null // Don't render if no brands
    }

    return (
      <section className='bg-action px-4 py-8 md:px-6 lg:px-8 w-full'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='heading-lg text-tertiary'>
            POPULAR BRANDS
          </h2>
        </div>
        <Carousel
          variant='dark'
          items={brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        />
      </section>
    );
  } catch (error) {
    console.error('Error fetching brands:', error)
    return null // Fail silently
  }
}
