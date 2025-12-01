/**
 * URL helper utilities for creating SEO-friendly URLs
 */

/**
 * Converts a string to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Creates a supplier URL with slug and ID
 * Format: /sellers/{slug}-{id}
 */
export function createSupplierUrl(supplierTitle: string, supplierId: string): string {
  const slug = slugify(supplierTitle);
  return `/sellers/${slug}-${supplierId}`;
}

/**
 * Extracts supplier ID from URL parameters
 */
export function getSupplierIdFromParams(params: { slug?: string; sellerId?: string; supplierId?: string }): string | null {
  return params.sellerId || params.supplierId || null;
}

