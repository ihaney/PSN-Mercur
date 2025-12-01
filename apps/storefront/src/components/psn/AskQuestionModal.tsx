'use client'

import { useState } from 'react'
import { X, HelpCircle } from 'lucide-react'
import { useAskQuestion } from '@/hooks/useProductQA'
import { retrieveCustomer } from '@/lib/data/customer'
import { toast } from '@/lib/helpers/toast'

interface AskQuestionModalProps {
  productId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AskQuestionModal({
  productId,
  isOpen,
  onClose,
  onSuccess,
}: AskQuestionModalProps) {
  const [question, setQuestion] = useState('')
  const askQuestionMutation = useAskQuestion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (question.length < 10 || question.length > 500) {
      toast.error({ title: 'Question must be between 10 and 500 characters' })
      return
    }

    // Check if user is logged in
    try {
      const user = await retrieveCustomer()
      if (!user) {
        toast.error({ title: 'You must be logged in to ask a question' })
        return
      }

      askQuestionMutation.mutate(
        {
          productId,
          question,
        },
        {
          onSuccess: () => {
            setQuestion('')
            onSuccess?.()
          },
        }
      )
    } catch (error) {
      console.error('Error checking user:', error)
      toast.error({ title: 'You must be logged in to ask a question' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 dark:bg-gray-800 light:bg-white rounded-lg max-w-lg w-full border border-white/20 dark:border-white/20 light:border-gray-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 dark:border-gray-700 light:border-gray-300">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#F4A024]" />
            <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900">
              Ask a Question
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2"
            >
              Your Question <span className="text-red-500">*</span>
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What materials is this product made from? Does it come in other colors?"
              className="w-full px-4 py-2 bg-gray-700/50 dark:bg-gray-700/50 light:bg-gray-100 border border-gray-600 dark:border-gray-600 light:border-gray-300 rounded-lg dark:text-white light:text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent resize-none"
              rows={4}
              minLength={10}
              maxLength={500}
              required
            />
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
              {question.length}/500 characters (minimum 10)
            </p>
          </div>

          <div className="bg-[#F4A024]/10 border border-[#F4A024]/30 rounded-lg p-4">
            <p className="text-sm text-[#F4A024] mb-2 font-medium">
              Tips for asking questions:
            </p>
            <ul className="text-sm dark:text-gray-300 light:text-gray-700 space-y-1 list-disc list-inside">
              <li>Be specific and clear about what you want to know</li>
              <li>Check existing Q&A to see if your question was already asked</li>
              <li>Avoid asking for personal contact information</li>
              <li>Questions will be moderated before publishing</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 dark:border-gray-600 light:border-gray-300 rounded-lg dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-200 transition-colors"
              disabled={askQuestionMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={askQuestionMutation.isPending || question.length < 10}
              className="px-6 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {askQuestionMutation.isPending ? 'Submitting...' : 'Submit Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

