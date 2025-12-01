import { verifySupabaseConnection, testFetchSupplier } from "@/lib/data/verify-supabase"
import { NextRequest, NextResponse } from "next/server"

/**
 * API route to verify Supabase connection and schema
 * GET /api/verify-supabase - Test connection
 * GET /api/verify-supabase?supplierId=xxx - Test fetching specific supplier
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const supplierId = searchParams.get("supplierId")

  try {
    if (supplierId) {
      const result = await testFetchSupplier(supplierId)
      return NextResponse.json(result, { status: result.found ? 200 : 404 })
    } else {
      const result = await verifySupabaseConnection()
      return NextResponse.json(result, { status: result.connected ? 200 : 500 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

