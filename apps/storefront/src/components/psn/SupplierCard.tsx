'use client'

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, MapPin, Bookmark, CheckCircle, Tag, Package } from 'lucide-react';
// TODO: Migrate analytics to Medusa-compatible solution
// import { analytics } from '@/lib/analytics';
// TODO: Migrate utility functions
// import { createSupplierUrl } from '@/lib/helpers/urlHelpers';
// TODO: Migrate these hooks to use Medusa SDK
// import { useSavedSuppliers } from '@/hooks/useSavedSuppliers';
// import { useBreadcrumbTracking } from '@/hooks/useBreadcrumbTracking';
// import { useSupplierCompliance } from '@/hooks/useSupplierCompliance';
import toast from 'react-hot-toast';
// TODO: Migrate these components or create equivalents
// import { LazyImage } from '@/components/psn/atoms/LazyImage/LazyImage';
// import ComplianceBadgeStrip from '@/components/psn/compliance/ComplianceBadgeStrip';
// import { SUPPLIER_CARD_SIZES } from '@/lib/imageOptimization';
import { getCurrentUser } from '@/lib/data/cookies';

interface Supplier {
  // Mercur format fields
  id?: string;
  name?: string;
  description?: string;
  photo?: string;
  handle?: string;
  email?: string;
  store_status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  metadata?: {
    country_name?: string;
    city_name?: string;
    website?: string;
    whatsapp?: string;
    category?: string;
    [key: string]: any;
  };
  // Legacy fields for backward compatibility
  Supplier_ID?: string;
  Supplier_Title?: string;
  Supplier_Description?: string;
  ai_business_summary?: string;
  Supplier_Country_Name?: string;
  country_image?: string;
  Supplier_City_Name?: string;
  Supplier_Location?: string;
  Supplier_Source_ID?: string;
  Supplier_Website?: string;
  Supplier_Email?: string;
  Supplier_Whatsapp?: string;
  product_keywords?: string;
  Supplier_Logo?: string;
  profile_picture_url?: string;
  is_verified?: boolean;
  Supplier_Category?: string;
  product_count?: number;
}

interface SupplierCardProps {
  supplier: Supplier;
  allSourcesMap?: Record<string, string>;
  priority?: boolean;
  index?: number;
}

// TODO: Remove this when utility is migrated
const createSupplierUrl = (name: string, id: string): string => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `/sellers/${slug}-${id}`;
};

export default function SupplierCard({ supplier, allSourcesMap, priority = false, index = 0 }: SupplierCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  // TODO: Uncomment when hooks are migrated
  // const { data: savedSuppliers = [], toggleSavedSupplier } = useSavedSuppliers();
  const savedSuppliers: any[] = [];
  const toggleSavedSupplier = async (supplierData: any) => {
    // TODO: Implement with Medusa SDK
    console.log('Toggle saved supplier:', supplierData);
  };
  // TODO: Uncomment when breadcrumb tracking is migrated
  // const { trackSupplierNavigation } = useBreadcrumbTracking();
  const trackSupplierNavigation = (id: string, name: string, slug: string) => {
    // TODO: Implement with Medusa analytics
    console.log('Supplier navigation:', id, name, slug);
  };
  const supplierId = supplier.id || supplier.Supplier_ID || '';
  const supplierName = supplier.name || supplier.Supplier_Title || '';
  // TODO: Uncomment when compliance hook is migrated
  // const { certifications } = useSupplierCompliance(supplierId);
  const certifications: any[] = [];
  const [logoError, setLogoError] = useState(false);
  const isSaved = savedSuppliers.some(item => item.id === supplierId);

  const handleClick = () => {
    const supplierHandle = supplier.handle || supplierId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = supplierName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Track breadcrumb navigation
    trackSupplierNavigation(supplierId, supplierName, slug);

    // TODO: Track analytics with Medusa-compatible solution
    // analytics.trackEvent('supplier_click', {
    //   props: {
    //     seller_id: supplierId,
    //     seller_name: supplierName,
    //     supplier_id: supplierId,
    //     supplier_name: supplierName,
    //     supplier_country: supplier.metadata?.country_name || supplier.Supplier_Country_Name || 'Unknown'
    //   }
    // });

    router.push(`/${locale}${createSupplierUrl(supplierName, supplierId)}`);
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        toast.error('Please log in to save suppliers');
        return;
      }
      
      const supplierData = {
        id: supplierId,
        name: supplierName,
        description: supplier.description || supplier.Supplier_Description || '',
        website: supplier.metadata?.website || supplier.Supplier_Website || '',
        email: supplier.email || supplier.Supplier_Email || '',
        location: supplier.metadata?.address_line || supplier.Supplier_Location || '',
        whatsapp: supplier.metadata?.whatsapp || supplier.Supplier_Whatsapp || '',
        country: supplier.metadata?.country_name || supplier.Supplier_Country_Name || 'Unknown',
        city: supplier.metadata?.city_name || supplier.Supplier_City_Name || '',
        sourceId: supplier.Supplier_Source_ID || ''
      };
      
      await toggleSavedSupplier(supplierData);
      toast.success(isSaved ? 'Supplier removed from saved suppliers' : 'Supplier saved successfully');
      
      // TODO: Track analytics
      // analytics.trackEvent(isSaved ? 'supplier_unsaved' : 'supplier_saved', {
      //   props: {
      //     seller_id: supplierId,
      //     seller_name: supplierName,
      //     supplier_id: supplierId,
      //     supplier_name: supplierName
      //   }
      // });
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error('Failed to save supplier. Please try again.');
    }
  };

  return (
    <div className="group relative">
      <div
        className="hover-cell cursor-pointer bg-themed-card backdrop-blur-sm rounded-xl p-6 border-themed shadow-themed"
        onClick={handleClick}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {(supplier.photo || supplier.profile_picture_url) && !logoError ? (
              <img
                src={supplier.photo || supplier.profile_picture_url || '/placeholder.png'}
                alt={`${supplierName} profile`}
                className="w-12 h-12 object-cover rounded-full dark:bg-white light:bg-white p-0.5 border-2 dark:border-gray-700/50 light:border-gray-300"
                onError={() => setLogoError(true)}
              />
            ) : (supplier.Supplier_Logo || supplier.photo) && !logoError ? (
              <img
                src={supplier.Supplier_Logo || supplier.photo || '/placeholder.png'}
                alt={`${supplierName} logo`}
                className="w-12 h-12 object-contain rounded-xl bg-white p-1 border-2 dark:border-gray-700/50 light:border-gray-300"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-12 h-12 dark:bg-[#F4A024]/10 light:bg-[#F4A024]/20 rounded-full flex items-center justify-center dark:group-hover:bg-[#F4A024]/20 light:group-hover:bg-[#F4A024]/30 transition-colors border-2 dark:border-[#F4A024]/20 light:border-[#F4A024]/30">
                <Building2 className="w-6 h-6 text-[#F4A024]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-2 group-hover:text-[#F4A024] transition-colors">
              {supplierName}
              {(supplier.store_status === 'ACTIVE' || supplier.is_verified) && (
                <span className="inline-flex items-center gap-1 ml-2">
                  <CheckCircle className="w-4 h-4 text-[#F4A024]" />
                  <span className="text-[#F4A024] text-xs font-medium">Verified</span>
                </span>
              )}
            </h3>

            {(supplier.ai_business_summary || supplier.description || supplier.Supplier_Description) && (
              <p className="dark:text-gray-300 light:text-gray-700 text-sm mb-3 line-clamp-2 leading-relaxed">
                {supplier.ai_business_summary || supplier.description || supplier.Supplier_Description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-sm dark:text-gray-400 light:text-gray-600 mb-3">
              {(supplier.metadata?.category || supplier.Supplier_Category) && (
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{supplier.metadata?.category || supplier.Supplier_Category}</span>
                </div>
              )}
              {(supplier.metadata?.country_name || supplier.Supplier_Country_Name) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {supplier.country_image && (
                    <img
                      src={supplier.country_image}
                      alt={`${supplier.metadata?.country_name || supplier.Supplier_Country_Name} flag`}
                      className="w-4 h-4 rounded object-cover"
                    />
                  )}
                  <span>{supplier.metadata?.country_name || supplier.Supplier_Country_Name}</span>
                </div>
              )}
              {supplier.product_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{supplier.product_count} {supplier.product_count === 1 ? 'product' : 'products'}</span>
                </div>
              )}
            </div>

            {/* TODO: Uncomment when ComplianceBadgeStrip is migrated */}
            {/* {certifications.length > 0 && (
              <ComplianceBadgeStrip
                badges={certifications}
                maxVisible={3}
                size="small"
              />
            )} */}
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveClick}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-20 ${
          isSaved
            ? 'dark:bg-[#F4A024]/20 light:bg-[#F4A024]/20 text-[#F4A024] border-2 border-[#F4A024]'
            : 'dark:bg-gray-800/90 light:bg-white/90 dark:text-gray-300 light:text-gray-600 hover:text-[#F4A024] dark:hover:bg-gray-700 light:hover:bg-gray-100 border-2 dark:border-gray-600 light:border-gray-300'
        }`}
        aria-label={isSaved ? 'Remove from saved suppliers' : 'Save supplier'}
      >
        <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

