'use client'

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import LazyImage from './LazyImage';

interface CountryListItem {
  Country_ID: string;
  Country_Title: string;
  Country_Image: string | null;
  Country_About?: string;
  product_count: number;
  supplier_count: number;
  latitude?: number;
  longitude?: number;
}

interface CountryCardProps {
  country: CountryListItem;
  priority?: boolean;
  index?: number;
}

export default function CountryCard({ country, priority = false, index = 0 }: CountryCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const handleClick = () => {
    // Track analytics
    analytics.trackEvent('country_click', {
      props: {
        country_id: country.Country_ID,
        country_name: country.Country_Title,
        view_mode: 'list'
      }
    });

    router.push(`/${locale}/country-search?country=${country.Country_ID}&mode=products`);
  };

  return (
    <div
      onClick={handleClick}
      className="dark:bg-gray-800/50 bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 cursor-pointer dark:hover:bg-gray-700/50 hover:bg-gray-50 transition-all border dark:border-gray-700/50 border-gray-200 shadow-md hover:shadow-xl"
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <LazyImage
          src={country.Country_Image || `https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=100&h=100&fit=crop`}
          alt={country.Country_Title}
          width={64}
          height={64}
          sizes="64px"
          priority={priority}
          className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-xl dark:bg-gray-700/30 bg-gray-100 p-2 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold dark:text-gray-100 text-gray-900 mb-1 truncate">
            {country.Country_Title}
          </h2>
          <div className="text-xs sm:text-sm text-[#F4A024] font-medium">
            {country.product_count.toLocaleString()} {country.product_count === 1 ? 'product' : 'products'}
          </div>
        </div>
      </div>

      {country.Country_About && (
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600 line-clamp-2">
            {country.Country_About}
          </p>
        </div>
      )}


      <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t dark:border-gray-700/50 border-gray-300">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="dark:text-gray-400 text-gray-600">Products:</span>
          <span className="text-[#F4A024] font-medium">
            {country.product_count.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="dark:text-gray-400 text-gray-600">Total Suppliers:</span>
          <span className="dark:text-gray-300 text-gray-900 font-medium">
            {country.supplier_count.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}