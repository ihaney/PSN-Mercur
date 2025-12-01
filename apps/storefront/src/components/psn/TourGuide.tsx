'use client'

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import { createSupplierUrl } from '@/lib/helpers/urlHelpers';
import { isBrowser } from '@/lib/isomorphic-helpers';
import { listProducts } from '@/lib/data/products';

interface TourStep {
  path: string;
  element: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourData {
  productId: string;
  sellerId: string; // Changed from supplierId
  sellerName: string; // Changed from supplierTitle
}

export default function TourGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return isBrowser ? localStorage.getItem('tourDismissed') === 'true' : false;
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [tourData, setTourData] = useState<TourData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Fetch a sample product and its supplier for the tour
  const fetchTourData = async () => {
    setIsLoading(true);
    try {
      // Fetch a product with seller information using Medusa SDK
      const { response } = await listProducts({
        pageParam: 1,
        countryCode: locale,
        queryParams: {
          limit: 1,
        },
      });

      if (response.products.length > 0) {
        const product = response.products[0];

        // Only proceed if product has a seller
        if (product.seller?.id && product.seller?.name) {
          const tourData: TourData = {
            productId: product.id,
            sellerId: product.seller.id,
            sellerName: product.seller.name,
          };
          setTourData(tourData);
          setIsLoading(false);
          return tourData;
        }
      }

      // Fallback: return null if no suitable product found
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error('Error fetching tour data:', error);
      setIsLoading(false);
      return null;
    }
  };

  const getTourSteps = (data: TourData | null): TourStep[] => {
    const productPath = data
      ? `/${locale}/products/${data.productId}`
      : `/${locale}/products`;

    const sellerPath = data
      ? createSupplierUrl(data.sellerId, locale)
      : `/${locale}/suppliers`;

    return [
      {
        path: `/${locale}`,
        element: '',
        title: 'Take a Tour',
        description: 'Learn how to navigate and find our products',
        position: 'bottom',
      },
      {
        path: `/${locale}`,
        element: '[data-tour="search-button"]',
        title: 'Search Products',
        description:
          'Search for products across all categories and suppliers. Try searching for specific products or browse by category.',
        position: 'bottom',
      },
      {
        path: productPath,
        element: '',
        title: 'Product Details',
        description: data
          ? `View details for products like this one and see pricing, specifications, and seller information.`
          : 'View product details, pricing, and seller information.',
        position: 'top',
      },
      {
        path: sellerPath,
        element: '',
        title: 'Supplier Profile',
        description: data
          ? `Learn more about suppliers like ${data.sellerName} and their product catalogs.`
          : 'View supplier profiles and their product catalogs.',
        position: 'top',
      },
      {
        path: `/${locale}/categories`,
        element: '[data-tour="categories-grid"]',
        title: 'Product Categories',
        description:
          'Browse products by category to find exactly what you\'re looking for.',
        position: 'top',
      },
      {
        path: `/${locale}/suppliers`,
        element: '[data-tour="suppliers-list"]',
        title: 'Supplier Directory',
        description: 'Explore our directory of verified Latin American suppliers.',
        position: 'top',
      },
    ];
  };

  // Fetch tour data on mount if not dismissed
  useEffect(() => {
    if (!isDismissed && !tourData && !isLoading) {
      fetchTourData();
    }
  }, [isDismissed, tourData, isLoading]);

  useEffect(() => {
    if (isVisible) {
      const steps = getTourSteps(tourData);
      const step = steps[currentStep];

      if (step.element) {
        const element = document.querySelector(step.element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('tour-highlight');
        }
      }

      return () => {
        document.querySelectorAll('.tour-highlight').forEach((el) => {
          el.classList.remove('tour-highlight');
        });
      };
    }
  }, [currentStep, isVisible, tourData]);

  const startTour = async () => {
    // Fetch tour data if not already loaded
    if (!tourData) {
      const data = await fetchTourData();
      setTourData(data);
    }
    setIsVisible(true);
    setCurrentStep(0);
    router.push(`/${locale}`);
    analytics.trackEvent('tour_started');
  };

  const nextStep = () => {
    const steps = getTourSteps(tourData);
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      router.push(`/${locale}${steps[nextStep].path}`);
      analytics.trackEvent('tour_step_viewed', {
        props: { step: nextStep + 1, total_steps: steps.length }
      });
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    const steps = getTourSteps(tourData);
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      router.push(`/${locale}${steps[prevStep].path}`);
    }
  };

  const endTour = () => {
    setIsVisible(false);
    setCurrentStep(0);
    setTourData(null);
    analytics.trackEvent('tour_completed');
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
  };

  const dismissTour = () => {
    setIsDismissed(true);
    if (isBrowser) {
      localStorage.setItem('tourDismissed', 'true');
    }
    analytics.trackEvent('tour_dismissed');
  };

  if (isDismissed) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={startTour}
          className="bg-[#F4A024] text-gray-900 px-4 py-2 rounded-full shadow-lg hover:bg-[#F4A024]/90 transition-colors"
        >
          Take a Tour
        </button>
        <button
          onClick={dismissTour}
          className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss tour button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const steps = getTourSteps(tourData);
  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <button
          onClick={endTour}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">{step.title}</h3>
          <p className="text-gray-300">{step.description}</p>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {Array.from({ length: steps.length }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-[#F4A024]' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={nextStep}
                className="bg-[#F4A024] text-gray-900 px-4 py-2 rounded-md hover:bg-[#F4A024]/90 transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}