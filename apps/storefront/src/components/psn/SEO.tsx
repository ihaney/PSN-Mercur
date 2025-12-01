'use client'

import { Helmet } from 'react-helmet-async';
import { isBrowser } from '@/lib/isomorphic-helpers';

interface CustomMetaTag {
  name?: string;
  property?: string;
  content: string;
  type?: 'meta' | 'link' | 'script';
}

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robotsMeta?: string;
  structuredData?: Record<string, any>;
  customMetaTags?: CustomMetaTag[];
}

export default function SEO({
  title,
  description = "Discover authentic Latin American products and connect with trusted suppliers. Paisán bridges the gap between Latin American suppliers and global markets.",
  keywords = "Latin American products, wholesale, suppliers, marketplace, Mexico, Colombia, Brazil, import, export, B2B",
  image = "https://paisan.net/social-preview.jpg",
  url = isBrowser ? window.location.href : 'https://paisan.net',
  type = "website",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  robotsMeta = "index, follow",
  structuredData,
  customMetaTags = []
}: SEOProps) {
  const fullTitle = `${title} | Paisán`;
  const finalOgTitle = ogTitle || fullTitle;
  const finalOgDescription = ogDescription || description;
  const finalOgImage = ogImage || image;
  const finalTwitterTitle = twitterTitle || fullTitle;
  const finalTwitterDescription = twitterDescription || description;
  const finalTwitterImage = twitterImage || image;
  const finalCanonicalUrl = canonicalUrl || url;

  return (
    <Helmet>
      {/* Language and Translation Meta Tags */}
      <html lang="en" />
      <meta httpEquiv="Content-Language" content="en" />

      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {robotsMeta && <meta name="robots" content={robotsMeta} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={finalTwitterTitle} />
      <meta property="twitter:description" content={finalTwitterDescription} />
      <meta property="twitter:image" content={finalTwitterImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Custom Meta Tags */}
      {customMetaTags.map((tag, index) => {
        if (tag.type === 'link') {
          return <link key={index} rel={tag.name} href={tag.content} />;
        } else if (tag.type === 'script') {
          return <script key={index}>{tag.content}</script>;
        } else {
          if (tag.property) {
            return <meta key={index} property={tag.property} content={tag.content} />;
          } else if (tag.name) {
            return <meta key={index} name={tag.name} content={tag.content} />;
          }
          return null;
        }
      })}
    </Helmet>
  );
}