import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"

interface BannerConfig {
  tag?: string
  title: string
  description: string
  image: string
  imageAlt: string
  ctaText: string
  ctaLink: string
}

const defaultBanner: BannerConfig = {
  tag: "#FEATURED",
  title: "Discover Latin American Suppliers",
  description: "Connect with trusted suppliers across Latin America. Quality products, competitive prices, reliable partners.",
  image: "/images/banner-section/latin-america-b2b.jpg",
  imageAlt: "Latin American B2B Marketplace",
  ctaText: "EXPLORE SUPPLIERS",
  ctaLink: "/sellers"
}

export const BannerSection = ({ config = defaultBanner }: { config?: BannerConfig }) => {
  return (
    <section className="bg-tertiary container text-tertiary">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
        <div className="py-6 px-6 flex flex-col h-full justify-between border border-secondary rounded-sm">
          <div className="mb-8 lg:mb-48">
            {config.tag && (
              <span className="text-sm inline-block px-4 py-1 border border-secondary rounded-sm">
                {config.tag}
              </span>
            )}
            <h2 className="display-sm">
              {config.title}
            </h2>
            <p className="text-lg text-tertiary max-w-lg">
              {config.description}
            </p>
          </div>
          <LocalizedClientLink href={config.ctaLink}>
            <Button size="large" className="w-fit bg-secondary/10">
              {config.ctaText}
            </Button>
          </LocalizedClientLink>
        </div>
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full flex justify-end rounded-sm">
          <Image
            loading="lazy"
            fetchPriority="high"
            src={config.image}
            alt={config.imageAlt}
            width={700}
            height={600}
            className="object-cover object-top rounded-sm"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  )
}
