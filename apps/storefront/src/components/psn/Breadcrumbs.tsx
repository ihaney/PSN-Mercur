'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '@/app/[locale]/(main)/layout';

interface BreadcrumbsProps {
  currentPageTitle?: string;
  hideCurrentPageTitle?: boolean;
  locale?: string;
}

export default function Breadcrumbs({ currentPageTitle, hideCurrentPageTitle = false, locale }: BreadcrumbsProps) {
  const { breadcrumbs } = useNavigation();
  const pathname = usePathname();

  // Extract locale from pathname if not provided
  const detectedLocale = locale || (pathname?.split('/')[1] || 'en');

  // Helper to normalize paths with locale
  const normalizePath = (path: string) => {
    // If path doesn't start with locale, add it
    if (path && !path.startsWith(`/${detectedLocale}`)) {
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `/${detectedLocale}${cleanPath ? `/${cleanPath}` : ''}`;
    }
    return path || `/${detectedLocale}`;
  };

  if (breadcrumbs.length === 0) {
    return (
      <div className="mb-8">
        {!hideCurrentPageTitle && currentPageTitle && (
          <h1 className="text-3xl font-bold dark:text-gray-100 light:text-gray-900">{currentPageTitle}</h1>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <nav className="flex items-center text-sm mb-3 flex-wrap gap-y-1" aria-label="Breadcrumb">
        <Link
          href={`/${detectedLocale}`}
          className="flex items-center text-[#F4A024] hover:text-[#F4A024]/80 font-medium transition-colors"
          aria-label="Home"
        >
          <Home className="w-4 h-4" />
        </Link>

        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb.path}-${index}`}>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            {index === breadcrumbs.length - 1 ? (
              <span className="dark:text-gray-300 light:text-gray-700 font-medium truncate max-w-xs sm:max-w-sm md:max-w-md">
                {crumb.title}
              </span>
            ) : (
              <Link
                href={normalizePath(crumb.path)}
                className="text-[#F4A024] hover:text-[#F4A024]/80 font-medium transition-colors truncate max-w-xs sm:max-w-sm"
              >
                {crumb.title}
              </Link>
            )}
          </React.Fragment>
        ))}

        {currentPageTitle && currentPageTitle !== breadcrumbs[breadcrumbs.length - 1]?.title && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="dark:text-gray-300 light:text-gray-700 font-medium truncate max-w-xs sm:max-w-sm md:max-w-md">
              {currentPageTitle}
            </span>
          </>
        )}
      </nav>

      {!hideCurrentPageTitle && currentPageTitle && (
        <h1 className="text-3xl font-bold dark:text-gray-100 light:text-gray-900">{currentPageTitle}</h1>
      )}
    </div>
  );
}

