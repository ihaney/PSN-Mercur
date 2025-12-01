'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProductQuestions,
  askQuestion,
  answerQuestion,
  upvoteQuestion,
  upvoteAnswer,
  markBestAnswer,
  type QuestionFilters,
  type ProductQuestion,
} from '@/lib/data/product-qa'
import { toast } from '@/lib/helpers/toast'

// Fetch questions
export function useProductQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: ['productQuestions', filters],
    queryFn: () => getProductQuestions(filters),
    enabled: !!(filters.productId || filters.supplierId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

// Ask question mutation
export function useAskQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, question }: { productId: string; question: string }) =>
      askQuestion(productId, question),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productQuestions'] })
      toast.success({ title: 'Question submitted!' })
    },
    onError: (error: any) => {
      toast.error({ title: error.message || 'Failed to submit question' })
    },
  })
}

// Answer question mutation
export function useAnswerQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      questionId,
      answer,
      isSupplierAnswer,
      isVerifiedPurchaser,
    }: {
      questionId: string
      answer: string
      isSupplierAnswer?: boolean
      isVerifiedPurchaser?: boolean
    }) =>
      answerQuestion(questionId, answer, {
        isSupplierAnswer,
        isVerifiedPurchaser,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productQuestions'] })
      toast.success({ title: 'Answer submitted!' })
    },
    onError: (error: any) => {
      toast.error({ title: error.message || 'Failed to submit answer' })
    },
  })
}

// Upvote question mutation
export function useUpvoteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questionId: string) => upvoteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productQuestions'] })
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to upvote question' })
    },
  })
}

// Upvote answer mutation
export function useUpvoteAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, answerId }: { questionId: string; answerId: string }) =>
      upvoteAnswer(questionId, answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productQuestions'] })
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to upvote answer' })
    },
  })
}

// Mark best answer mutation
export function useMarkBestAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, answerId }: { questionId: string; answerId: string }) =>
      markBestAnswer(questionId, answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productQuestions'] })
      toast.success({ title: 'Marked as best answer' })
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to mark best answer' })
    },
  })
}

// Check user type (supplier/buyer) - placeholder for now
export function useCheckUserType(supplierId?: string, productId?: string) {
  return useQuery({
    queryKey: ['userType', supplierId, productId],
    queryFn: async () => {
      // TODO: Implement user type check via Medusa
      // For now, return placeholder
      return { type: 'buyer' as const }
    },
    enabled: !!(supplierId || productId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

