'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// TODO: Migrate to Medusa SDK for categories
// import { sdk } from '@/lib/config';
import EmailSubscriptionForm from '@/components/psn/EmailSubscriptionForm';
import DataReportModal from '@/components/psn/DataReportModal';
// TODO: Migrate breadcrumb tracking
// import { useBreadcrumbTracking } from '@/hooks/useBreadcrumbTracking';

interface Category {
  Category_ID: string;
  Category_Name: string;
}

export default function Footer() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [categories, setCategories] = useState<Category[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  // TODO: Uncomment when breadcrumb tracking is migrated
  // const { trackNavigation, trackCategoryNavigation } = useBreadcrumbTracking();
  const trackNavigation = (path: string, name: string) => {
    // TODO: Implement with Medusa analytics
    console.log('Navigation:', path, name);
  };
  const trackCategoryNavigation = (id: string, name: string) => {
    // TODO: Implement with Medusa analytics
    console.log('Category navigation:', id, name);
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        // TODO: Replace with Medusa SDK call
        // const response = await sdk.store.productCategory.list({ limit: 8 });
        // if (response.categories) {
        //   setCategories(response.categories.map(cat => ({
        //     Category_ID: cat.id,
        //     Category_Name: cat.name
        //   })));
        // }
        // Temporary: empty categories until Medusa integration
        setCategories([]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const handleLinkClick = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-16">
      <div className="border-t-2 border-[#F4A024]/30 my-0"></div>
      <div className="card-glow-no-hover">
        <div className="py-8">
          <EmailSubscriptionForm />
        </div>
        <div className="border-t-2 border-[#F4A024]/30 mx-4 sm:mx-6 lg:mx-8"></div>
        <div className="py-8">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-12">
              {/* Logo and Tagline */}
              <div className="md:col-span-1 flex flex-col">
                <Link
                  href={`/${locale}`}
                  className="flex items-center gap-2"
                  onClick={handleLinkClick}
                >
                  <h1 className="text-4xl font-bold text-[#F4A024] paisan-text" translate="no">Paisán</h1>
                </Link>
                <p className="text-xl dark:text-gray-300 light:text-gray-800 font-medium mt-1">A Trusted Sourcing Tool</p>
              </div>

              {/* Discover Column */}
              <div>
                <h3 className="text-xl font-semibold dark:text-gray-100 light:text-gray-900 mb-6">Discover</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`/${locale}/sellers`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={() => {
                        handleLinkClick();
                        trackNavigation('/suppliers', 'Suppliers');
                      }}
                    >
                      Suppliers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/countries`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={() => {
                        handleLinkClick();
                        trackNavigation('/countries', 'Countries');
                      }}
                    >
                      Countries
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Categories Column */}
              <div>
                <h3 className="text-xl font-semibold dark:text-gray-100 light:text-gray-900 mb-6">Categories</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`/${locale}/categories`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-colors font-medium"
                      onClick={() => {
                        handleLinkClick();
                        trackNavigation('/categories', 'Categories');
                      }}
                    >
                      View All Categories
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.Category_ID}>
                      <Link
                        href={`/${locale}/category-search?category=${category.Category_ID}&mode=products`}
                        className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                        onClick={() => {
                          handleLinkClick();
                          trackCategoryNavigation(category.Category_ID, category.Category_Name);
                        }}
                      >
                        {category.Category_Name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools Column */}
              <div>
                <h3 className="text-xl font-semibold dark:text-gray-100 light:text-gray-900 mb-6">Tools</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`/${locale}/tools/ask`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      Ask Research Assistant
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/tools/rfq-template`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      RFQ Template
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/tools/freight-tariff-helper`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      Freight & Tariff Helper
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/compliance`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      Compliance Guide
                    </Link>
                  </li>
                </ul>
              </div>

              {/* About Column */}
              <div>
                <h3 className="text-xl font-semibold dark:text-gray-100 light:text-gray-900 mb-6">About</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`/${locale}/about`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/policies`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      Policies
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setIsReportModalOpen(true);
                        handleLinkClick();
                      }}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)] text-left"
                    >
                      Report
                    </button>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/contact`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Join Column */}
              <div>
                <h3 className="text-xl font-semibold dark:text-gray-100 light:text-gray-900 mb-6">Join</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`/${locale}/join-supplier`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      Join as a Supplier
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${locale}/join-member`}
                      className="dark:text-gray-400 light:text-gray-700 hover:text-[#F4A024] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(244,160,36,0.5)]"
                      onClick={handleLinkClick}
                    >
                      Join as a User
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DataReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        pageType="directory"
        contextData={{
          url: typeof window !== 'undefined' ? window.location.href : ''
        }}
      />
    </footer>
  );
}

