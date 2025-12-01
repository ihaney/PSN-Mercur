"use server"

import { sdk } from "../config"
import { createServerSupabaseClient } from "../lib/supabase-server"
import { getSellerByHandle } from "./seller" // Mercur's existing function
import { listSellers } from "./seller" // Use existing listSellers if available, or create new
import type { SellerProps } from "@/types/seller"

// Extended supplier metadata from Supabase
export interface SupplierMetadata {
  ai_business_summary?: string
  certifications?: string[]
  compliance_status?: string
  years_in_business?: number
  employee_count?: string
  industries_supported?: string[]
  [key: string]: any
}

// Extended supplier type combining Medusa seller with Supabase metadata
export interface SupplierWithMetadata extends SellerProps {
  metadata?: SellerProps['metadata'] & SupplierMetadata
}

/**
 * Get supplier with extended metadata from Supabase
 * Combines Medusa seller data with Supabase extended fields
 */
export async function getSupplierWithMetadata(handle: string): Promise<SupplierWithMetadata | null> {
  try {
    // 1. Get core seller data from Medusa
    const seller = await getSellerByHandle(handle)
    
    if (!seller) return null
    
    // 2. Get extended metadata from Supabase (if available)
    const supabase = await createServerSupabaseClient()
    let extendedMetadata: SupplierMetadata | null = null
    
    if (supabase) {
      try {
        // Try to match by seller ID or handle
        // Try multiple field name variations for compatibility
        let data: any = null
        let error: any = null

        // Try Supplier_ID first (most common in PSN schema)
        const query1 = supabase
          .from('Suppliers')
          .select('*')
          .eq('Supplier_ID', seller.id)
          .maybeSingle()
        
        const result1 = await query1
        if (!result1.error && result1.data) {
          data = result1.data
        } else {
          // Try alternative field names
          const query2 = supabase
            .from('Suppliers')
            .select('*')
            .or(`Supplier_ID.eq.${seller.id},id.eq.${seller.id},supplier_id.eq.${seller.id},handle.eq.${handle}`)
            .maybeSingle()
          
          const result2 = await query2
          data = result2.data
          error = result2.error
        }
        
        if (!error && data) {
          extendedMetadata = {
            ai_business_summary: data.ai_business_summary || data.Supplier_Description,
            certifications: data.certifications || [],
            compliance_status: data.compliance_status,
            years_in_business: data.years_in_business,
            employee_count: data.employee_count,
            industries_supported: data.industries_supported || data.ai_industries_supported,
            // Additional fields from Supabase
            website: data.Supplier_Website || data.website,
            whatsapp: data.Supplier_Whatsapp || data.whatsapp,
            address_line: data.Supplier_Location || data.address_line,
            country_name: data.Supplier_Country_Name || data.country_name,
            city_name: data.Supplier_City_Name || data.city_name,
            category: data.Supplier_Category || data.category,
            logo: data.Supplier_Logo || data.logo,
            source_id: data.Supplier_Source_ID || data.source_id,
            // Map other fields as needed
          }
        } else if (error) {
          // Log error but don't fail - continue with Medusa data only
          console.warn('Supabase query error (non-fatal):', error.message)
        }
      } catch (supabaseError) {
        // If Supabase fails, continue with just Medusa data
        console.warn('Error fetching Supabase metadata:', supabaseError)
      }
    }
    
    // 3. Merge data
    return {
      ...seller,
      metadata: {
        ...seller.metadata,
        ...extendedMetadata,
      }
    } as SupplierWithMetadata
  } catch (error) {
    console.error('Error fetching supplier with metadata:', error)
    return null
  }
}

/**
 * List suppliers with extended metadata
 * Uses Medusa for core data, optionally enriches with Supabase
 */
export async function listSuppliersWithMetadata(filters: {
  search?: string
  country?: string
  category?: string
  limit?: number
  offset?: number
}): Promise<{
  suppliers: SupplierWithMetadata[]
  count: number
  nextPage: number | null
}> {
  try {
    // Get sellers from Medusa using existing function
    const result = await listSellers({
      pageParam: Math.floor((filters.offset || 0) / (filters.limit || 50)),
      limit: filters.limit || 50,
      filters: {
        search: filters.search,
        selectedCountries: filters.country ? [filters.country] : undefined,
        selectedCategories: filters.category ? [filters.category] : undefined,
      },
    })

    // Optionally enrich with Supabase metadata
    const supabase = await createServerSupabaseClient()
    let enrichedSuppliers = result.sellers

    if (supabase && result.sellers.length > 0) {
      try {
        // Get extended metadata for sellers in batch
        const sellerIds = result.sellers.map(s => s.id).filter(Boolean)
        
        if (sellerIds.length > 0) {
          const { data: supabaseData } = await supabase
            .from('Suppliers')
            .select('*')
            .in('Supplier_ID', sellerIds)
          
          // Create a map of extended metadata by seller ID
          const metadataMap = new Map<string, SupplierMetadata>()
          if (supabaseData) {
            supabaseData.forEach((item: any) => {
              const supplierId = item.Supplier_ID || item.supplier_id || item.id
              if (supplierId) {
                metadataMap.set(supplierId, {
                  ai_business_summary: item.ai_business_summary || item.Supplier_Description,
                  certifications: item.certifications || [],
                  compliance_status: item.compliance_status,
                  years_in_business: item.years_in_business,
                  employee_count: item.employee_count,
                  industries_supported: item.industries_supported || item.ai_industries_supported,
                  // Additional fields
                  website: item.Supplier_Website || item.website,
                  whatsapp: item.Supplier_Whatsapp || item.whatsapp,
                  address_line: item.Supplier_Location || item.address_line,
                  country_name: item.Supplier_Country_Name || item.country_name,
                  city_name: item.Supplier_City_Name || item.city_name,
                  category: item.Supplier_Category || item.category,
                  logo: item.Supplier_Logo || item.logo,
                  source_id: item.Supplier_Source_ID || item.source_id,
                })
              }
            })
          }

          // Merge metadata into sellers
          enrichedSuppliers = result.sellers.map(seller => ({
            ...seller,
            metadata: {
              ...seller.metadata,
              ...metadataMap.get(seller.id),
            }
          })) as SupplierWithMetadata[]
        }
      } catch (supabaseError) {
        // If Supabase fails, continue with just Medusa data
        console.warn('Error enriching suppliers with Supabase metadata:', supabaseError)
      }
    }

    return {
      suppliers: enrichedSuppliers as SupplierWithMetadata[],
      count: result.count,
      nextPage: result.nextPage,
    }
  } catch (error) {
    console.error('Error listing suppliers with metadata:', error)
    return {
      suppliers: [],
      count: 0,
      nextPage: null,
    }
  }
}

