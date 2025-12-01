import { SellerProps } from "@/types/seller"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"

export const getSellerByHandle = async (handle: string) => {
  return sdk.client
    .fetch<{ seller: SellerProps }>(`/store/seller/${handle}`, {
      query: {
        fields:
          "+created_at,+email,+reviews.seller.name,+reviews.rating,+reviews.customer_note,+reviews.seller_note,+reviews.created_at,+reviews.updated_at,+reviews.customer.first_name,+reviews.customer.last_name",
      },
      cache: "no-cache",
    })
    .then(({ seller }) => {
      const response = {
        ...seller,
        reviews:
          seller.reviews
            ?.filter((item) => item !== null)
            .sort((a, b) => b.created_at.localeCompare(a.created_at)) ?? [],
      }

      return response as SellerProps
    })
    .catch(() => [])
}

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
