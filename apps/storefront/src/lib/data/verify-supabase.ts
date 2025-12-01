"use server"

import { createServerSupabaseClient } from "../lib/supabase-server"

/**
 * Verify Supabase connection and table schema
 * This is a utility function to help debug Supabase integration
 */
export async function verifySupabaseConnection() {
  const results = {
    connected: false,
    tableExists: false,
    sampleRecord: null as any,
    error: null as string | null,
    fields: [] as string[],
  }

  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      results.error = "Supabase client is null. Check environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      return results
    }

    results.connected = true

    // Try to query the Suppliers table
    const { data, error, count } = await supabase
      .from('Suppliers')
      .select('*', { count: 'exact' })
      .limit(1)

    if (error) {
      results.error = `Supabase query error: ${error.message}`
      
      // Check if it's a table not found error
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        results.error += "\n\nPossible issues:\n" +
          "1. Table name might be different (check if it's 'suppliers' lowercase or another name)\n" +
          "2. Table might not exist in your Supabase database\n" +
          "3. RLS (Row Level Security) policies might be blocking access"
      }
      
      return results
    }

    results.tableExists = true

    if (data && data.length > 0) {
      results.sampleRecord = data[0]
      results.fields = Object.keys(data[0])
    }

    return results
  } catch (error: any) {
    results.error = `Unexpected error: ${error.message}`
    return results
  }
}

/**
 * Test fetching a specific supplier by ID
 */
export async function testFetchSupplier(supplierId: string) {
  const results = {
    found: false,
    data: null as any,
    error: null as string | null,
  }

  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      results.error = "Supabase client is null"
      return results
    }

    // Try different field name variations
    const queries = [
      supabase.from('Suppliers').select('*').eq('Supplier_ID', supplierId).maybeSingle(),
      supabase.from('Suppliers').select('*').eq('supplier_id', supplierId).maybeSingle(),
      supabase.from('Suppliers').select('*').eq('id', supplierId).maybeSingle(),
    ]

    for (const query of queries) {
      const { data, error } = await query
      
      if (!error && data) {
        results.found = true
        results.data = data
        return results
      }
    }

    results.error = "Supplier not found with any ID field variation"
    return results
  } catch (error: any) {
    results.error = `Error: ${error.message}`
    return results
  }
}

