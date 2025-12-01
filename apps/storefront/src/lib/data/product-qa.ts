"use server"

import { sdk } from "../config"
import { getAuthHeaders, getCacheTag, getCacheOptions } from "./cookies"
import { revalidateTag, revalidatePath } from "next/cache"

// Types
export interface ProductQuestion {
  id: string
  product_id: string
  question: string
  asked_by: string
  upvote_count: number
  created_at: string
  is_featured: boolean
  user_profiles?: {
    display_name: string
  }
  product_answers?: ProductAnswer[]
}

export interface ProductAnswer {
  id: string
  question_id: string
  answer: string
  answered_by: string
  upvote_count: number
  created_at: string
  is_supplier_answer: boolean
  is_verified_purchaser: boolean
  is_best_answer: boolean
  user_profiles?: {
    display_name: string
  }
}

export interface QuestionFilters {
  productId?: string
  supplierId?: string
  sortBy?: 'popular' | 'recent' | 'unanswered'
  searchQuery?: string
  limit?: number
}

// Fetch questions
export async function getProductQuestions(filters: QuestionFilters) {
  const headers = await getAuthHeaders()
  const cacheTag = await getCacheTag("product-qa")
  
  try {
    // TODO: Replace with actual Medusa endpoint when backend is ready
    // For now, return empty array as placeholder
    // When backend is ready, uncomment and use:
    /*
    const response = await sdk.client.fetch<{
      questions: ProductQuestion[]
      total: number
    }>(`/store/product-questions`, {
      method: "GET",
      query: {
        product_id: filters.productId,
        supplier_id: filters.supplierId,
        sort_by: filters.sortBy || 'popular',
        search: filters.searchQuery,
        limit: filters.limit || 50,
      },
      headers,
      ...(await getCacheOptions("product-qa")),
    })

    return response
    */
    
    // Placeholder until backend endpoints are created
    return { questions: [], total: 0 }
  } catch (error) {
    console.error('Error fetching product questions:', error)
    return { questions: [], total: 0 }
  }
}

// Ask a question
export async function askQuestion(productId: string, question: string) {
  const headers = await getAuthHeaders()
  
  if (!headers?.authorization) {
    throw new Error('Authentication required')
  }

  try {
    // TODO: Replace with actual Medusa endpoint when backend is ready
    // When backend is ready, uncomment and use:
    /*
    const response = await sdk.client.fetch<{ question: ProductQuestion }>(
      `/store/product-questions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: productId,
          question,
        }),
      }
    )

    await revalidateTag(await getCacheTag("product-qa"))
    await revalidatePath(`/products/${productId}`)

    return response.question
    */
    
    // Placeholder until backend endpoints are created
    throw new Error('Q&A feature is not yet available. Backend endpoints need to be implemented.')
  } catch (error) {
    console.error('Error asking question:', error)
    throw error
  }
}

// Answer a question
export async function answerQuestion(
  questionId: string,
  answer: string,
  options?: {
    isSupplierAnswer?: boolean
    isVerifiedPurchaser?: boolean
  }
) {
  const headers = await getAuthHeaders()
  
  if (!headers?.authorization) {
    throw new Error('Authentication required')
  }

  try {
    // TODO: Replace with actual Medusa endpoint when backend is ready
    // When backend is ready, uncomment and use:
    /*
    const response = await sdk.client.fetch<{ answer: ProductAnswer }>(
      `/store/product-questions/${questionId}/answers`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          answer,
          is_supplier_answer: options?.isSupplierAnswer || false,
          is_verified_purchaser: options?.isVerifiedPurchaser || false,
        }),
      }
    )

    await revalidateTag(await getCacheTag("product-qa"))
    await revalidatePath(`/products/*`)

    return response.answer
    */
    
    // Placeholder until backend endpoints are created
    throw new Error('Q&A feature is not yet available. Backend endpoints need to be implemented.')
  } catch (error) {
    console.error('Error answering question:', error)
    throw error
  }
}

// Upvote question
export async function upvoteQuestion(questionId: string) {
  const headers = await getAuthHeaders()
  
  if (!headers?.authorization) {
    throw new Error('Authentication required')
  }

  try {
    // TODO: Replace with actual Medusa endpoint when backend is ready
    // When backend is ready, uncomment and use:
    /*
    await sdk.client.fetch(
      `/store/product-questions/${questionId}/upvote`,
      {
        method: "POST",
        headers,
      }
    )

    await revalidateTag(await getCacheTag("product-qa"))
    */
    
    // Placeholder until backend endpoints are created
    throw new Error('Q&A feature is not yet available. Backend endpoints need to be implemented.')
  } catch (error) {
    console.error('Error upvoting question:', error)
    throw error
  }
}

// Upvote answer
export async function upvoteAnswer(questionId: string, answerId: string) {
  const headers = await getAuthHeaders()
  
  if (!headers?.authorization) {
    throw new Error('Authentication required')
  }

  try {
    // TODO: Replace with actual Medusa endpoint when backend is ready
    // When backend is ready, uncomment and use:
    /*
    await sdk.client.fetch(
      `/store/product-questions/${questionId}/answers/${answerId}/upvote`,
      {
        method: "POST",
        headers,
      }
    )

    await revalidateTag(await getCacheTag("product-qa"))
    */
    
    // Placeholder until backend endpoints are created
    throw new Error('Q&A feature is not yet available. Backend endpoints need to be implemented.')
  } catch (error) {
    console.error('Error upvoting answer:', error)
    throw error
  }
}

// Mark best answer
export async function markBestAnswer(questionId: string, answerId: string) {
  const headers = await getAuthHeaders()
  
  if (!headers?.authorization) {
    throw new Error('Authentication required')
  }

  try {
    // TODO: Replace with actual Medusa endpoint when backend is ready
    // When backend is ready, uncomment and use:
    /*
    await sdk.client.fetch(
      `/store/product-questions/${questionId}/answers/${answerId}/mark-best`,
      {
        method: "POST",
        headers,
      }
    )

    await revalidateTag(await getCacheTag("product-qa"))
    */
    
    // Placeholder until backend endpoints are created
    throw new Error('Q&A feature is not yet available. Backend endpoints need to be implemented.')
  } catch (error) {
    console.error('Error marking best answer:', error)
    throw error
  }
}

