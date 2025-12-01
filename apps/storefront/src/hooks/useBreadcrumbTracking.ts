'use client'

import { analytics } from '@/lib/analytics';

/**
 * Hook for breadcrumb and navigation tracking
 * Uses analytics service
 */
export function useBreadcrumbTracking() {
  const trackNavigation = (path: string, name: string) => {
    analytics.trackEvent('navigation_click', {
      props: { nav_type: 'menu', item_name: name, path },
    });
  };

  const trackProductNavigation = (productId: string, productName: string) => {
    analytics.trackEvent('product_click', {
      props: { product_id: productId, product_name: productName },
    });
  };

  const trackSupplierNavigation = (supplierId: string, supplierName: string, slug: string) => {
    analytics.trackEvent('supplier_click', {
      props: { supplier_id: supplierId, supplier_name: supplierName, slug },
    });
  };

  const trackCategoryNavigation = (categoryId: string, categoryName: string) => {
    analytics.trackEvent('category_click', {
      props: { category_id: categoryId, category_name: categoryName },
    });
  };

  return {
    trackNavigation,
    trackProductNavigation,
    trackSupplierNavigation,
    trackCategoryNavigation,
  };
}

