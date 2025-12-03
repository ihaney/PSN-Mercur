'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Mail, MessageSquare, Building2, CheckCircle, Package, Share2, MapPin, Bookmark } from 'lucide-react'
import ProductCard from '@/components/psn/ProductCard'
import MessageButton from '@/components/psn/MessageButton'
import ShareSupplierModal from '@/components/psn/ShareSupplierModal'
import { useSavedSuppliers } from '@/hooks/useSavedSuppliers'
import toast from 'react-hot-toast'
import type { SupplierWithMetadata } from '@/lib/data/suppliers'
import LazyImage from '@/components/psn/LazyImage'
import ComplianceBadgeStrip from '@/components/psn/ComplianceBadgeStrip'

interface SupplierPageClientProps {
  supplier: SupplierWithMetadata
  initialProducts: any[]
  locale: string
}

export default function SupplierPageClient({ supplier, initialProducts, locale }: SupplierPageClientProps) {
  const router = useRouter()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'supplier' | 'products' | 'contact'>('supplier')
  const { data: savedSuppliers = [], toggleSavedSupplier } = useSavedSuppliers()

  const isSaved = savedSuppliers.some(s => s.id === supplier?.id)

  const handleToggleSaved = async () => {
    try {
      await toggleSavedSupplier({
        id: supplier.id,
        name: supplier.name || '',
        handle: supplier.handle || supplier.id,
        description: supplier.description || '',
        photo: supplier.photo || '',
        tax_id: supplier.tax_id || '',
        created_at: supplier.created_at || new Date().toISOString(),
        website: supplier.metadata?.website || '',
        email: supplier.email || '',
        location: supplier.metadata?.address_line || '',
        whatsapp: supplier.metadata?.whatsapp || '',
        country: supplier.metadata?.country_name || '',
        city: supplier.metadata?.city_name || '',
        sourceId: supplier.metadata?.source_id || '',
      })
      toast.success(isSaved ? 'Supplier removed from saved suppliers' : 'Supplier saved successfully')
    } catch (error) {
      console.error('Error toggling saved supplier:', error)
      toast.error('Failed to save supplier')
    }
  }

  const supplierUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `/${locale}/sellers/${supplier.handle || supplier.id}`

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Supplier Header */}
      <div className="bg-gray-800 rounded-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <LazyImage
            src={supplier?.photo || supplier?.metadata?.logo || '/placeholder.png'}
            alt={supplier?.name || 'Supplier'}
            width={96}
            height={96}
            className="w-24 h-24 object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 96px"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{supplier?.name}</h1>
              {supplier?.store_status === 'ACTIVE' && (
                <CheckCircle className="w-6 h-6 text-[#F4A024]" />
              )}
            </div>
            <p className="text-gray-400 mb-4">
              {supplier?.description || supplier?.metadata?.ai_business_summary || 'No description available'}
            </p>
            <div className="flex items-center gap-4">
              {supplier?.metadata?.website && (
                <a
                  href={supplier.metadata.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#F4A024] hover:text-[#ff8800]"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              <MessageButton 
                sellerId={supplier?.id} 
                sellerName={supplier?.name}
              />
              <button
                onClick={handleToggleSaved}
                className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                  isSaved
                    ? 'bg-[#F4A024] text-white border-[#F4A024]'
                    : 'border-gray-300 hover:border-[#F4A024] text-white'
                }`}
              >
                <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 text-[#F4A024] hover:text-[#ff8800]"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('supplier')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'supplier'
              ? 'text-[#F4A024] border-b-2 border-[#F4A024]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Supplier Info
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'products'
              ? 'text-[#F4A024] border-b-2 border-[#F4A024]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Products ({initialProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'contact'
              ? 'text-[#F4A024] border-b-2 border-[#F4A024]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Contact
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'supplier' && (
        <div className="space-y-6">
          {supplier?.metadata?.ai_business_summary && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Business Summary</h2>
              <p className="text-gray-300">{supplier.metadata.ai_business_summary}</p>
            </div>
          )}
          {supplier?.metadata?.industries_supported && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Industries Supported</h2>
              <p className="text-gray-300">
                {Array.isArray(supplier.metadata.industries_supported) 
                  ? supplier.metadata.industries_supported.join(', ')
                  : supplier.metadata.industries_supported}
              </p>
            </div>
          )}
          {supplier?.metadata?.certifications && supplier.metadata.certifications.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Compliance & Certifications</h2>
              <ComplianceBadgeStrip 
                badges={supplier.metadata.certifications.map((cert: string) => ({
                  type: 'certified' as const,
                  label: cert
                }))}
                className="mb-4"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {initialProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product}
                priority={index < 4}
                index={index}
              />
            ))}
          </div>
          {initialProducts.length === 0 && (
            <p className="text-center text-gray-400 py-12">No products available</p>
          )}
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
          <div className="space-y-4">
            {supplier?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#F4A024]" />
                <a href={`mailto:${supplier.email}`} className="text-white hover:text-[#F4A024]">
                  {supplier.email}
                </a>
              </div>
            )}
            {supplier?.metadata?.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#F4A024]" />
                <a 
                  href={supplier.metadata.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#F4A024]"
                >
                  {supplier.metadata.website}
                </a>
              </div>
            )}
            {supplier?.metadata?.address_line && (
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#F4A024]" />
                <span className="text-white">{supplier.metadata.address_line}</span>
              </div>
            )}
            {supplier?.metadata?.country_name && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#F4A024]" />
                <span className="text-white">
                  {supplier.metadata.city_name ? `${supplier.metadata.city_name}, ` : ''}
                  {supplier.metadata.country_name}
                </span>
              </div>
            )}
            {supplier?.metadata?.whatsapp && (
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#F4A024]" />
                <a 
                  href={`https://wa.me/${supplier.metadata.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#F4A024]"
                >
                  {supplier.metadata.whatsapp}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareSupplierModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          supplierName={supplier?.name || 'Supplier'}
          supplierUrl={supplierUrl}
        />
      )}
    </div>
  )
}

