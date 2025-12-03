'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { useAnswerQuestion, useCheckUserType } from '@/hooks/useProductQA'

interface AnswerQuestionFormProps {
  questionId: string
  productId: string
  supplierId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function AnswerQuestionForm({
  questionId,
  productId,
  supplierId,
  onSuccess,
  onCancel,
}: AnswerQuestionFormProps) {
  const [answer, setAnswer] = useState('')

  const { data: userType } = useCheckUserType(supplierId, productId)
  const answerMutation = useAnswerQuestion()

  const answererType: 'buyer' | 'supplier' = (userType?.type as 'buyer' | 'supplier') || 'buyer'
  const isVerifiedPurchaser = (userType && 'isVerifiedPurchaser' in userType) ? (userType.isVerifiedPurchaser as boolean) : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (answer.length < 10 || answer.length > 1000) {
      return
    }

    answerMutation.mutate(
      {
        questionId,
        answer,
        isSupplierAnswer: answererType === 'supplier',
        isVerifiedPurchaser,
      },
      {
        onSuccess: () => {
          setAnswer('')
          onSuccess?.()
        },
      }
    )
  }

  return (
    <div className="border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg p-4 bg-gray-800/30 dark:bg-gray-800/30 light:bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#F4A024]" />
          <h4 className="font-medium dark:text-gray-100 light:text-gray-900">
            Your Answer
          </h4>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Share your knowledge or experience with this product..."
          className="w-full px-4 py-2 bg-gray-700/50 dark:bg-gray-700/50 light:bg-white border border-gray-600 dark:border-gray-600 light:border-gray-300 rounded-lg dark:text-white light:text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent resize-none"
          rows={4}
          minLength={10}
          maxLength={1000}
          required
        />
        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
          {answer.length}/1000 characters (minimum 10)
        </p>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-600 dark:border-gray-600 light:border-gray-300 rounded-lg dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-200 transition-colors"
              disabled={answerMutation.isPending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={answerMutation.isPending || answer.length < 10}
            className="px-4 py-2 text-sm bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {answerMutation.isPending ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </form>
    </div>
  )
}

