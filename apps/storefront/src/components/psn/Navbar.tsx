'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Menu, ChevronDown, X, Bookmark, CircleUser as UserCircle, MessageSquare, Building2, Shield, Languages, ShoppingCart, LayoutGrid } from 'lucide-react';
// TODO: Migrate analytics to Medusa-compatible solution
// import { analytics } from '@/lib/analytics';
import SearchModal from '@/components/psn/SearchModal';
import AuthModal from '@/components/psn/AuthModal';
import GoogleTranslateWidget from '@/components/psn/GoogleTranslateWidget';
import NotificationCenter from '@/components/psn/NotificationCenter';
// TODO: Migrate these hooks to use Medusa SDK
// import { useSavedItems } from '@/hooks/useSavedItems';
// import { useSavedSuppliers } from '@/hooks/useSavedSuppliers';
// import { useConversations } from '@/hooks/useConversations';
import { useCartContext } from '@/components/providers';
// TODO: Migrate admin auth to Medusa
// import { useAdminAuth } from '@/hooks/useAdminAuth';
// TODO: Migrate language context
// import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
// TODO: Migrate breadcrumb tracking
// import { useBreadcrumbTracking } from '@/hooks/useBreadcrumbTracking';
import toast from 'react-hot-toast';
// TODO: Migrate isomorphic helpers
// import { isBrowser } from '@/lib/isomorphic-helpers';
import { getCurrentUser, removeAuthToken } from '@/lib/data/user-actions';
import { sdk } from '@/lib/config';

interface Category {
  Category_ID: string;
  Category_Name: string;
}

// TODO: Remove this when language context is migrated
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

export default function Navbar() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  // TODO: Uncomment when hooks are migrated
  // const { data: savedItems = [] } = useSavedItems();
  // const { data: savedSuppliers = [] } = useSavedSuppliers();
  // const { data: conversations = [] } = useConversations();
  const savedItems: any[] = [];
  const savedSuppliers: any[] = [];
  const conversations: any[] = [];
  const { cart } = useCartContext();
  const cartItemCount = cart?.items?.length || 0;
  // TODO: Uncomment when admin auth is migrated
  // const { isAdmin: isAdminUser, loading: adminLoading } = useAdminAuth(false);
  const isAdminUser = false;
  const adminLoading = false;
  // TODO: Uncomment when language context is migrated
  // const { preferredLanguage, setPreferredLanguage } = useLanguage();
  const [preferredLanguage, setPreferredLanguage] = useState('en');
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
  const [user, setUser] = useState<any>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  const queryClient = useQueryClient();
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    // TODO: Replace with Medusa auth
    async function checkUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    checkUser();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        // TODO: Replace with Medusa SDK call
        // const response = await sdk.store.productCategory.list();
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

  useEffect(() => {
    async function fetchPendingClaimsCount() {
      if (isAdminUser) {
        try {
          // TODO: Replace with Medusa SDK call for claim requests
          // const response = await sdk.client.fetch('/admin/claim-requests', {
          //   method: 'GET',
          //   query: { status: 'pending_review' }
          // });
          // setPendingClaimsCount(response.count || 0);
          setPendingClaimsCount(0);
        } catch (error) {
          console.error('Error fetching pending claims:', error);
        }
      }
    }
    fetchPendingClaimsCount();
  }, [isAdminUser]);

  const handleSignOut = async () => {
    try {
      // TODO: Replace with Medusa logout
      // await sdk.auth.logout();
      // Remove auth token
      await removeAuthToken();
      setUser(null);
      router.push('/');
      // TODO: Track analytics with Medusa-compatible solution
      // analytics.trackEvent('sign_out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleIconClick = (feature: string) => {
    if (!user) {
      toast.error('Please log in to use this feature');
      router.push('/join');
    }
  };

  const trackAnalyticsNavigation = (type: string, name: string) => {
    // TODO: Implement with Medusa analytics
    // analytics.trackEvent('navigation_click', {
    //   props: { nav_type: type, item_name: name },
    // });

    // Prefetch data based on navigation type
    if (type === 'category' && name) {
      // TODO: Prefetch products for this category using Medusa SDK
      queryClient.prefetchQuery({
        queryKey: ['searchResults', { category: name }],
        queryFn: async () => {
          // const response = await sdk.store.product.list({
          //   query: { category_id: name },
          //   limit: 20
          // });
          // return response.products;
          return [];
        }
      });
    } else if (type === 'menu' && name === 'products') {
      // TODO: Prefetch featured products using Medusa SDK
      queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: async () => {
          // const response = await sdk.store.product.list({ limit: 20 });
          // return response.products;
          return [];
        }
      });
    } else if (type === 'menu' && name === 'suppliers') {
      // TODO: Prefetch suppliers list using Medusa SDK
      queryClient.prefetchQuery({
        queryKey: ['suppliers', 0, 100],
        queryFn: async () => {
          // const response = await sdk.store.seller.list({ limit: 100 });
          // return response.sellers;
          return [];
        }
      });
    }
  };

  const handleMouseEnter = (dropdown: string) => {
    if (isBrowser && window.innerWidth >= 768) {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
        setDropdownTimeout(null);
      }
      setActiveDropdown(dropdown);
    }
  };

  const handleMouseLeave = () => {
    if (isBrowser && window.innerWidth >= 768) {
      const timeout = setTimeout(() => {
        setActiveDropdown(null);
      }, 300);
      setDropdownTimeout(timeout);
    }
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setDropdownTimeout(timeout);
  };

  const toggleMobileDropdown = (dropdown: string) =>
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <nav className="sticky top-0 w-full z-40 glow-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 notranslate"
                onClick={() => trackAnalyticsNavigation('logo', 'home')}
                translate="no"
              >
                <h1 className="text-3xl font-bold text-[#F4A024] paisan-text notranslate" translate="no">Paisán</h1>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('discover')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className={`flex items-center dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 px-3 py-2 rounded-md transition-colors ${
                    activeDropdown === 'discover' ? 'dark:bg-gray-700/50 light:bg-gray-200/50' : 'dark:hover:bg-gray-700/30 light:hover:bg-gray-200/30'
                  }`}>
                    Discover
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {activeDropdown === 'discover' && (
                    <div
                      className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          href="/suppliers"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('/suppliers', 'Suppliers');
                          }}
                        >
                          Suppliers
                        </Link>
                        <Link
                          href="/countries"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('/countries', 'Countries');
                          }}
                        >
                          Countries
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('categories')}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href="/categories"
                    className={`flex items-center dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 px-3 py-2 rounded-md transition-colors ${
                      activeDropdown === 'categories' ? 'dark:bg-gray-700/50 light:bg-gray-200/50' : 'dark:hover:bg-gray-700/30 light:hover:bg-gray-200/30'
                    }`}
                    onClick={() => trackNavigation('/categories', 'Categories')}
                  >
                    Categories
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Link>

                  {activeDropdown === 'categories' && (
                    <div
                      className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          href="/categories"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700 font-medium border-b border-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackNavigation('/categories', 'Categories');
                          }}
                        >
                          View All Categories
                        </Link>
                        {categories.slice(0, 8).map((category) => (
                          <Link
                            key={category.Category_ID}
                            href={`/category-search?category=${category.Category_ID}&mode=products`}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                            onClick={() => {
                              closeMobileMenu();
                              trackCategoryNavigation(category.Category_ID, category.Category_Name);
                            }}
                          >
                            {category.Category_Name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('tools')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className={`flex items-center dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 px-3 py-2 rounded-md transition-colors ${
                    activeDropdown === 'tools' ? 'dark:bg-gray-700/50 light:bg-gray-200/50' : 'dark:hover:bg-gray-700/30 light:hover:bg-gray-200/30'
                  }`}>
                    Tools
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>

                  {activeDropdown === 'tools' && (
                    <div
                      className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          href="/tools/ask"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackAnalyticsNavigation('tools', 'ask');
                          }}
                        >
                          Ask Research Assistant
                        </Link>
                        <Link
                          href="/tools/rfq-template"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackAnalyticsNavigation('tools', 'rfq-template');
                          }}
                        >
                          RFQ Template
                        </Link>
                        <Link
                          href="/tools/freight-tariff-helper"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackAnalyticsNavigation('tools', 'freight-tariff-helper');
                          }}
                        >
                          Freight & Tariff Helper
                        </Link>
                        <Link
                          href="/compliance"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackAnalyticsNavigation('tools', 'compliance');
                          }}
                        >
                          Compliance Guide
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('about')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className={`flex items-center dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 px-3 py-2 rounded-md transition-colors ${
                    activeDropdown === 'about' ? 'dark:bg-gray-700/50 light:bg-gray-200/50' : 'dark:hover:bg-gray-700/30 light:hover:bg-gray-200/30'
                  }`}>
                    About
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {activeDropdown === 'about' && (
                    <div
                      className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          href="/about"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackAnalyticsNavigation('menu', 'about');
                          }}
                        >
                          About Us
                        </Link>
                        <Link
                          href="/contact"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          onClick={() => {
                            closeMobileMenu();
                            trackAnalyticsNavigation('menu', 'contact');
                          }}
                        >
                          Contact
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  // TODO: Track analytics
                  // analytics.trackEvent('search_open');
                }}
                className="icon-glow p-2 rounded-full relative group"
                aria-label="Search"
                data-tour="search-button"
              >
                <Search className="w-5 h-5 dark:text-gray-300 light:text-gray-700" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-900 light:bg-white text-white dark:text-white light:text-gray-900 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Search
                </span>
              </button>

              {/* Notification Center */}
              {user && (
                <NotificationCenter />
              )}

              {/* Language Selector */}
              <div
                className="relative hidden md:block"
                onMouseEnter={() => handleMouseEnter('language')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'language' ? null : 'language')}
                  className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group notranslate"
                  aria-label="Select Language"
                  translate="no"
                >
                  <Languages className="w-5 h-5" />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-lg z-50 notranslate" translate="no">
                    Language
                  </span>
                </button>
                {activeDropdown === 'language' && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 notranslate"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                    translate="no"
                  >
                    <div className="py-1">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={async () => {
                            try {
                              setPreferredLanguage(lang.code);
                              setActiveDropdown(null);
                              // TODO: Track analytics
                              // analytics.trackEvent('language_change', {
                              //   props: { language: lang.code, language_name: lang.name }
                              // });
                            } catch (error) {
                              console.error('Error changing language:', error);
                              toast.error('Failed to change language');
                            }
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors notranslate ${
                            preferredLanguage === lang.code
                              ? 'text-[#F4A024] bg-gray-700 font-medium'
                              : 'text-gray-300 hover:text-[#F4A024] hover:bg-gray-700'
                          }`}
                          translate="no"
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user ? (
                <>
                  {isAdminUser && (
                    <div
                      className="relative"
                      onMouseEnter={() => handleMouseEnter('admin')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === 'admin' ? null : 'admin')}
                        className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group"
                      >
                        <Shield className="w-5 h-5 text-[#F4A024]" />
                        {pendingClaimsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {pendingClaimsCount}
                          </span>
                        )}
                        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-lg z-50">
                          Admin Panel
                        </span>
                      </button>
                      {activeDropdown === 'admin' && (
                        <div
                          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                          onMouseEnter={handleDropdownMouseEnter}
                          onMouseLeave={handleDropdownMouseLeave}
                        >
                          <div className="py-1">
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700 font-medium border-b border-gray-700"
                              onClick={() => {
                                setActiveDropdown(null);
                                trackAnalyticsNavigation('admin', 'dashboard');
                              }}
                            >
                              Dashboard
                            </Link>
                            <Link
                              href="/admin/claim-reviews"
                              className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                              onClick={() => {
                                setActiveDropdown(null);
                                trackAnalyticsNavigation('admin', 'claim-reviews');
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span>Claim Reviews</span>
                                {pendingClaimsCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                    {pendingClaimsCount}
                                  </span>
                                )}
                              </div>
                            </Link>
                            {/* Additional admin links can be added here */}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter('user')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                      className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-lg z-50">
                        Account
                      </span>
                    </button>
                    {activeDropdown === 'user' && (
                      <div
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                            onClick={() => {
                              setActiveDropdown(null);
                              trackAnalyticsNavigation('profile', 'view-profile');
                            }}
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setActiveDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/messages"
                    className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group"
                    aria-label="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {conversations.some(c => (c.unread_count || 0) > 0) && (
                      <span className="absolute -top-1 -right-1 bg-[#F4A024] text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {conversations.reduce((total, c) => total + (c.unread_count || 0), 0)}
                      </span>
                    )}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-lg z-50">
                      Messages
                    </span>
                  </Link>

                  <Link
                    href="/cart"
                    className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#F4A024] text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-lg z-50">
                      Cart
                    </span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group"
                    aria-label="Dashboard"
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-lg z-50">
                      Dashboard
                    </span>
                  </Link>

                  <Link
                    href="/saved-items"
                    className="dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full relative group"
                    aria-label="Saved Items"
                  >
                    <Bookmark className="w-5 h-5" fill={savedItems.length > 0 ? 'currentColor' : 'none'} />
                    {savedItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#F4A024] text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {savedItems.length}
                      </span>
                    )}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 shadow-lg z-50">
                      Saved Items
                    </span>
                  </Link>
                </>
              ) : (
                <div className="flex dark:bg-black light:bg-white border dark:border-gray-300 light:border-gray-300 rounded-lg overflow-hidden hover:border-[#F4A024] transition-colors text-sm">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-2 py-1 dark:text-gray-300 light:text-gray-700 hover:text-[#F4A024] dark:hover:bg-gray-800 light:hover:bg-gray-100 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/join"
                    className="px-2 py-1 dark:text-gray-300 light:text-gray-700 hover:text-[#F4A024] dark:hover:bg-gray-800 light:hover:bg-gray-100 transition-colors font-medium border-l dark:border-gray-300 light:border-gray-300 hover:border-[#F4A024]"
                    onClick={() => {
                      // TODO: Track analytics
                      // analytics.trackEvent('signup_button_clicked');
                    }}
                  >
                    Join
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden dark:text-gray-300 light:text-gray-700 dark:hover:text-gray-100 light:hover:text-gray-900 p-2 rounded-full"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - simplified version */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 dark:bg-gray-800 light:bg-white z-40 max-h-[80vh] overflow-y-auto shadow-md rounded-b-lg border-t dark:border-gray-700 light:border-gray-200">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* Mobile menu items - can be expanded later */}
              <Link
                href="/suppliers"
                className="block px-3 py-2 dark:text-gray-300 light:text-gray-700 hover:text-[#F4A024]"
                onClick={closeMobileMenu}
              >
                Suppliers
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 dark:text-gray-300 light:text-gray-700 hover:text-[#F4A024]"
                onClick={closeMobileMenu}
              >
                Categories
              </Link>
            </div>
          </div>
        )}
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <GoogleTranslateWidget targetLanguage={preferredLanguage} />
    </>
  );
}

