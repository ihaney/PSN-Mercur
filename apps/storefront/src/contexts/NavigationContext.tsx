'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface Breadcrumb {
  title: string;
  path: string;
}

interface NavigationContextType {
  breadcrumbs: Breadcrumb[];
  addBreadcrumb: (title: string, path: string) => void;
  resetBreadcrumbs: () => void;
  clearBreadcrumbs: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname
  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0] || 'en';
    const newBreadcrumbs: Breadcrumb[] = [];

    // Skip locale segment
    const pathSegments = segments.slice(1);

    pathSegments.forEach((segment, index) => {
      const path = `/${locale}/${pathSegments.slice(0, index + 1).join('/')}`;
      const title = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      newBreadcrumbs.push({ title, path });
    });

    setBreadcrumbs(newBreadcrumbs);
  }, [pathname]);

  const addBreadcrumb = useCallback((title: string, path: string) => {
    setBreadcrumbs(prev => {
      // Avoid duplicates
      if (prev.some(b => b.path === path)) {
        return prev;
      }
      return [...prev, { title, path }];
    });
  }, []);

  const resetBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  return (
    <NavigationContext.Provider value={{ breadcrumbs, addBreadcrumb, resetBreadcrumbs, clearBreadcrumbs }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Helper functions
export function isMainPage(pathname: string): boolean {
  const pathWithoutLocale = pathname?.replace(/^\/[^/]+/, '') || '';
  return pathWithoutLocale === '' || pathWithoutLocale === '/';
}

export function getMainPageTitle(locale: string = 'en'): string {
  return 'Home';
}

