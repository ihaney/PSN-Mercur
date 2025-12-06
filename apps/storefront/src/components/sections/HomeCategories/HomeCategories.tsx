import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"
import { listCategories } from "@/lib/data/categories"

export const HomeCategories = async ({ heading }: { heading: string }) => {
  try {
    // Fetch categories from Medusa
    const { categories } = await listCategories({
      query: { limit: 20 },
      headingCategories: []
    })

    // Transform to match CategoryCard format
    const displayCategories = categories
      .filter(cat => cat.handle && cat.name)
      .slice(0, 8) // Limit to 8 for carousel
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        handle: cat.handle
      }))

    if (displayCategories.length === 0) {
      return null // Don't render if no categories
    }

    return (
      <section className="bg-primary py-8 w-full">
        <div className="mb-6">
          <h2 className="heading-lg text-primary uppercase">{heading}</h2>
        </div>
        <Carousel
          items={displayCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        />
      </section>
    )
  } catch (error) {
    console.error('Error fetching categories:', error)
    return null // Fail silently
  }
}
