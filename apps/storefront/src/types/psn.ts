/**
 * PSN-specific Types
 * Type definitions for Paisán marketplace features
 * These extend Mercur's base types with PSN-specific fields
 */

import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "./seller"
import { Product as MercurProduct } from "./product"

// Product type extending Mercur's format with PSN-specific metadata
export type Product = MercurProduct & {
  seller?: SellerProps
  metadata?: {
    moq?: string
    source_id?: string
    source_name?: string
    city_name?: string
    country_name?: string
    [key: string]: any
  }
  // PSN-specific fields
  Product_ID?: string
  Product_Title?: string
  Product_Price?: string
  Product_Image_URL?: string
  Product_URL?: string
  Product_MOQ?: string
  Product_Country_Name?: string
  Product_Category_Name?: string
  Supplier_Title?: string
  Product_Source_Name?: string
  Supplier_ID?: string
  countryImage?: string
}

// Supplier type using Mercur's Seller format
export type Supplier = SellerProps & {
  // PSN-specific fields for backward compatibility
  Supplier_ID?: string
  Supplier_Title?: string
  Supplier_Description?: string
  ai_business_summary?: string
  Supplier_Country_Name?: string
  country_image?: string
  Supplier_City_Name?: string
  Supplier_Location?: string
  Supplier_Source_ID?: string
  Supplier_Website?: string
  website?: string
  Supplier_Email?: string
  Supplier_Whatsapp?: string
  whatsapp?: string
  location?: string
  country?: string
  city?: string
  sourceId?: string
  product_keywords?: string
  Supplier_Logo?: string
  profile_picture_url?: string
  is_verified?: boolean
  Supplier_Category?: string
  product_count?: number
}

export interface Category {
  Category_ID: string
  Category_Name: string
  Category_Description?: string | null
  Category_Image?: string | null
  parent_category_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Country {
  Country_ID: string
  Country_Title: string
  Country_About?: string | null
  Country_Image?: string | null
  latitude?: number | null
  longitude?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Source {
  Source_ID: string
  Source_Title: string
  Source_About?: string | null
  Source_Image?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CartItem {
  id: string
  cart_id: string
  variant_id: string
  seller_id: string
  quantity: number
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
  product?: Product
}

export interface Cart {
  id: string
  user_id?: string | null
  session_id?: string | null
  created_at: string
  updated_at: string
  items?: CartItem[]
}

export interface Order {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  status: 'pending_confirmation' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'disputed'
  subtotal: number
  shipping_cost: number
  tax_amount: number
  total_amount: number
  currency: string
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  payment_method?: string | null
  shipping_address: Address
  billing_address?: Address | null
  buyer_notes?: string | null
  tracking_number?: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string
  product_snapshot: ProductSnapshot
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface ProductSnapshot {
  id: string
  title: string
  price: string
  thumbnail?: string | null
  moq?: string | null
  seller_name?: string | null
}

export interface Address {
  company: string
  contact_name: string
  street: string
  city: string
  state?: string | null
  zip_code?: string | null
  country: string
}

export interface UserProfile {
  id: string
  auth_id: string
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  phone?: string | null
  website?: string | null
  bio?: string | null
  profile_picture_url?: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  notification_type: string
  title: string
  message: string
  is_read: boolean
  read_at?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

