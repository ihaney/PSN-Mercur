'use client'

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface ProductReviewsListProps {
  productId: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  images: string[] | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user_profiles: {
    full_name: string;
  } | null;
}

export default function ProductReviewsList({ productId }: ProductReviewsListProps) {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['product-reviews', productId, sortBy, filterRating],
    queryFn: async () => {
      let query = supabase
        .from('product_reviews')
        .select('*, user_profiles(full_name)')
        .eq('product_id', productId)
        .eq('status', 'approved');

      if (filterRating) {
        query = query.eq('rating', filterRating);
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'helpful') {
        query = query.order('helpful_count', { ascending: false });
      } else if (sortBy === 'rating_high') {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === 'rating_low') {
        query = query.order('rating', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    }
  });

  const { data: reviewStats } = useQuery({
    queryKey: ['product-review-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_product_review_stats', { p_product_id: productId });

      if (error) throw error;
      return data;
    }
  });

  const voteHelpfulMutation = useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      const { data: { user } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: existingError } = await supabase
        .from('review_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (!existingError) {
        toast.error('You have already voted on this review');
        return;
      }

      const { error } = await // TODO: Replace with Medusa SDK call;

      if (error) throw error;

      const increment = isHelpful ? 1 : 0;
      await supabase.rpc('increment_review_helpful_count', {
        p_review_id: reviewId,
        p_increment: increment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('Thank you for your feedback!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit vote');
    }
  });

  const reportReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { data: { user } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await // TODO: Replace with Medusa SDK call;

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review reported. We will review it shortly.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to report review');
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-[#F4A024] text-[#F4A024]' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const averageRating = reviewStats?.average_rating || 0;
  const totalReviews = reviewStats?.total_reviews || 0;
  const ratingDistribution = reviewStats?.rating_distribution || {};

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-sm text-gray-400 mt-1">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <button
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={`text-sm text-gray-400 hover:text-white transition-colors ${
                      filterRating === rating ? 'text-[#F4A024]' : ''
                    }`}
                  >
                    {rating} star
                  </button>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F4A024]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-300">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#F4A024]"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating_high">Highest Rating</option>
          <option value="rating_low">Lowest Rating</option>
        </select>

        {filterRating && (
          <button
            onClick={() => setFilterRating(null)}
            className="text-sm text-[#F4A024] hover:text-[#F4A024]/80"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-1">{review.title}</h4>
                  <p className="text-sm text-gray-400">
                    By {review.user_profiles?.full_name || 'Anonymous'} on {formatDate(review.created_at)}
                  </p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed mb-4">{review.content}</p>

              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => voteHelpfulMutation.mutate({ reviewId: review.id, isHelpful: true })}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful_count})
                </button>
                <button
                  onClick={() => voteHelpfulMutation.mutate({ reviewId: review.id, isHelpful: false })}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Not Helpful
                </button>
                <button
                  onClick={() => reportReviewMutation.mutate(review.id)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors ml-auto"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {filterRating
                ? `No ${filterRating}-star reviews yet`
                : 'No reviews yet. Be the first to review this product!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
