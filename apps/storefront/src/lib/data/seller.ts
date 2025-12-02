import { SellerProps } from "@/types/seller"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"

// Re-export public function for backward compatibility
export { getSellerByHandle } from "./seller-public"

export const listSellers = async ({
  pageParam = 0,
  limit = 50,
  filters,
}: {
  pageParam?: number
  limit?: number
  filters?: {
    search?: string
    selectedCountries?: string[]
    selectedCategories?: string[]
  }
}): Promise<{
  sellers: SellerProps[]
  count: number
  nextPage: number | null
}> => {
  // Dynamically import to avoid bundling server-only code
  const { getAuthHeaders } = await import("./cookies")
  const headers = await getAuthHeaders()
  const offset = pageParam * limit

  try {
    const response = await sdk.client.fetch<{
      sellers: SellerProps[]
      count: number
    }>(`/store/sellers`, {
      method: "GET",
      query: {
        limit,
        offset,
        search: filters?.search,
        country_code: filters?.selectedCountries?.[0],
        // Add other filters as needed
      },
      headers,
      cache: "no-cache",
    })

    const nextPage = response.count > offset + limit ? pageParam + 1 : null

    return {
      sellers: response.sellers || [],
      count: response.count || 0,
      nextPage,
    }
  } catch (error) {
    console.error("Error listing sellers:", error)
    return {
      sellers: [],
      count: 0,
      nextPage: null,
    }
  }
}