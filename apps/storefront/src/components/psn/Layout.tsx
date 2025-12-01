'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function Layout({ children, noPadding = false }: LayoutProps) {
  const pathname = usePathname();
  // Remove locale prefix for home page check
  const pathWithoutLocale = pathname?.replace(/^\/[^/]+/, '') || '';
  const isHomePage = pathWithoutLocale === '' || pathWithoutLocale === '/';

  if (noPadding) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
      {!isHomePage && (
        <div className="py-4">
          <Breadcrumbs />
        </div>
      )}
      {children}
    </div>
  );
}

