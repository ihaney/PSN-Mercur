'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, ThumbsUp, CheckCircle2, Award, Search } from 'lucide-react'
import { AskQuestionModal } from './AskQuestionModal'
import { AnswerQuestionForm } from './AnswerQuestionForm'
import LoadingSpinner from './LoadingSpinner'
import {
  useProductQuestions,
  useUpvoteQuestion,
  useUpvoteAnswer,
  useMarkBestAnswer,
  useCheckUserType,
} from '@/hooks/useProductQA'
import { retrieveCustomer } from '@/lib/data/customer'
import { toast } from '@/lib/helpers/toast'

interface ProductQASectionProps {
  productId: string
  supplierId?: string
}

export function ProductQASection({ productId, supplierId }: ProductQASectionProps) {
  const [isAskModalOpen, setIsAskModalOpen] = useState(false)
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'unanswered'>('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const { data, isLoading } = useProductQuestions({
    productId,
    supplierId,
    sortBy,
    searchQuery: searchQuery.length > 2 ? searchQuery : undefined,
    limit: 50,
  })

  const upvoteQuestion = useUpvoteQuestion()
  const upvoteAnswer = useUpvoteAnswer()
  const markBestAnswer = useMarkBestAnswer()
  const { data: userType } = useCheckUserType(supplierId, productId)

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await retrieveCustomer()
        setCurrentUserId(user?.id || null)
      } catch (error) {
        console.error('Error fetching user:', error)
      setCurrentUserId(null)
      }
    }
    fetchUser()
  }, [])

  const questions = data?.questions || []

  const handleUpvoteQuestion = async (questionId: string) => {
    if (!currentUserId) {
      toast.error({ title: 'Please log in to vote' })
      return
    }
    upvoteQuestion.mutate(questionId)
  }

  const handleUpvoteAnswer = async (answerId: string, questionId: string) => {
    if (!currentUserId) {
      toast.error({ title: 'Please log in to vote' })
      return
    }
    upvoteAnswer.mutate({ answerId, questionId })
  }

  const handleMarkBestAnswer = async (answerId: string, questionId: string) => {
    if (!currentUserId) {
      toast.error({ title: 'Please log in to mark best answer' })
      return
    }
    markBestAnswer.mutate({ answerId, questionId })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-gray-100 light:text-gray-900">
          Questions & Answers ({data?.total || 0})
        </h2>
        <button
          onClick={() => setIsAskModalOpen(true)}
          className="px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium"
        >
          Ask a Question
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 dark:bg-gray-800/50 light:bg-gray-100 border border-gray-600 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-gray-100 light:text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#F4A024] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 whitespace-nowrap">
            Sort by:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                sortBy === 'popular'
                  ? 'bg-[#F4A024] text-gray-900 font-medium'
                  : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                sortBy === 'recent'
                  ? 'bg-[#F4A024] text-gray-900 font-medium'
                  : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('unanswered')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                sortBy === 'unanswered'
                  ? 'bg-[#F4A024] text-gray-900 font-medium'
                  : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300'
              }`}
            >
              Unanswered
            </button>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 dark:bg-gray-800/30 light:bg-gray-100 backdrop-blur-sm rounded-lg border border-gray-700 dark:border-gray-700 light:border-gray-300">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium dark:text-gray-100 light:text-gray-900 mb-2">
            No questions yet
          </h3>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-4">
            Be the first to ask about this product!
          </p>
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="px-6 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium"
          >
            Ask the First Question
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-gray-800/50 dark:bg-gray-800/50 light:bg-gray-50 backdrop-blur-sm border border-white/20 dark:border-white/20 light:border-gray-300 rounded-lg p-6"
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleUpvoteQuestion(question.id)}
                    className="flex flex-col items-center text-gray-400 hover:text-[#F4A024] transition-colors"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm font-medium">{question.upvote_count}</span>
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-2">
                        Q: {question.question}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                        <span>
                          Asked by {question.user_profiles?.display_name || 'Anonymous'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(question.created_at)}</span>
                        {question.is_featured && (
                          <>
                            <span>•</span>
                            <span className="text-[#F4A024] font-medium">Featured</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {question.product_answers && question.product_answers.length > 0 ? (
                    <div className="space-y-4 mt-4">
                      {question.product_answers.map((answer) => (
                        <div key={answer.id} className="pl-6 border-l-2 border-gray-700 dark:border-gray-700 light:border-gray-300">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium dark:text-gray-300 light:text-gray-700">
                                  A: {answer.answer}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                                <span>
                                  by {answer.user_profiles?.display_name || 'Anonymous'}
                                </span>

                                {answer.is_supplier_answer && (
                                  <span className="px-2 py-0.5 bg-[#F4A024]/20 text-[#F4A024] rounded text-xs font-medium">
                                    Supplier
                                  </span>
                                )}

                                {answer.is_verified_purchaser && (
                                  <span className="flex items-center gap-1 text-green-500">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span className="text-xs">Verified Buyer</span>
                                  </span>
                                )}

                                {answer.is_best_answer && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                    <Award className="w-3 h-3" />
                                    Best Answer
                                  </span>
                                )}

                                <span>•</span>
                                <span>{formatDate(answer.created_at)}</span>

                                <div className="flex items-center gap-2 ml-auto">
                                  {currentUserId === question.asked_by &&
                                    !answer.is_best_answer && (
                                      <button
                                        onClick={() =>
                                          handleMarkBestAnswer(answer.id, question.id)
                                        }
                                        className="flex items-center gap-1 px-2 py-1 text-xs text-[#F4A024] hover:text-[#F4A024]/80 border border-[#F4A024]/50 rounded hover:bg-[#F4A024]/10 transition-colors"
                                        title="Mark as best answer"
                                      >
                                        <Award className="w-3 h-3" />
                                        Mark Best
                                      </button>
                                    )}
                                  <button
                                    onClick={() => handleUpvoteAnswer(answer.id, question.id)}
                                    className="flex items-center gap-1 text-gray-400 hover:text-[#F4A024] transition-colors"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{answer.upvote_count}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-gray-800/30 dark:bg-gray-800/30 light:bg-gray-100 rounded-lg border border-gray-700 dark:border-gray-700 light:border-gray-300">
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mb-3">
                        No answers yet. Can you help?
                      </p>
                      <button
                        onClick={() => setAnsweringQuestionId(question.id)}
                        className="text-sm text-[#F4A024] hover:text-[#F4A024]/80 font-medium"
                      >
                        Answer this question
                      </button>
                    </div>
                  )}

                  {answeringQuestionId === question.id && (
                    <div className="mt-4">
                      <AnswerQuestionForm
                        questionId={question.id}
                        productId={productId}
                        supplierId={supplierId}
                        onSuccess={() => {
                          setAnsweringQuestionId(null)
                        }}
                        onCancel={() => setAnsweringQuestionId(null)}
                      />
                    </div>
                  )}

                  {!answeringQuestionId &&
                    question.product_answers &&
                    question.product_answers.length > 0 && (
                      <button
                        onClick={() => setAnsweringQuestionId(question.id)}
                        className="mt-3 text-sm text-[#F4A024] hover:text-[#F4A024]/80 font-medium"
                      >
                        Add another answer
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AskQuestionModal
        productId={productId}
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onSuccess={() => {
          setIsAskModalOpen(false)
        }}
      />
    </div>
  )
}

