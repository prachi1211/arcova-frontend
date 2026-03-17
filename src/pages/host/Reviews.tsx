import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyReviews, useRespondToReview } from '@/hooks/useReviews';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { formatDate } from '@/lib/utils';

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-gold-500 fill-gold-500' : 'text-warm-300'}
        />
      ))}
    </div>
  );
}

function InitialsAvatar({ name }: { name?: string }) {
  const initials = (name ?? 'G')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full bg-navy-950 flex items-center justify-center shrink-0">
      <span className="text-gold-400 text-sm font-semibold">{initials}</span>
    </div>
  );
}

export default function Reviews() {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const { data: properties } = useProperties();
  const { data: reviewsData, isLoading } = usePropertyReviews(selectedPropertyId);
  const { mutateAsync: respondToReview } = useRespondToReview();

  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<Record<string, string>>({});

  const reviews = reviewsData?.results ?? [];

  // Compute rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmitResponse = async (reviewId: string) => {
    const text = responseText[reviewId] ?? '';
    if (!text.trim()) return;
    setSubmitLoading(reviewId);
    setSubmitError((prev) => ({ ...prev, [reviewId]: '' }));
    try {
      await respondToReview({ id: reviewId, response: text });
      setRespondingTo(null);
      setResponseText((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (err: unknown) {
      setSubmitError((prev) => ({
        ...prev,
        [reviewId]: err instanceof Error ? err.message : 'Failed to submit response.',
      }));
    } finally {
      setSubmitLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Guest Reviews" description="View and respond to guest feedback." />

      {/* Property selector */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5 mb-6">
        <label className="block text-sm font-medium text-navy-950 mb-2">Property</label>
        <select
          value={selectedPropertyId}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          className="w-full max-w-sm h-11 rounded-xl border border-warm-200 bg-white px-4 text-sm text-navy-950 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15"
        >
          <option value="">Select a property</option>
          {properties?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {!selectedPropertyId ? (
        <div className="text-center py-16 text-warm-500 text-sm">Select a property to view its reviews.</div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Once guests review this property, you'll be able to respond here."
        />
      ) : (
        <>
          {/* Ratings summary */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5 mb-6">
            <div className="flex items-start gap-8">
              <div className="text-center shrink-0">
                <p className="text-5xl font-bold text-navy-950">{avgRating.toFixed(1)}</p>
                <StarRating rating={Math.round(avgRating)} />
                <p className="text-xs text-warm-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingCounts.map(({ rating, count }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-xs text-warm-500 w-3 shrink-0">{rating}</span>
                    <div className="flex-1 bg-warm-100 rounded-full h-2">
                      <div
                        className="bg-gold-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-warm-500 w-5 shrink-0 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review cards */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <InitialsAvatar name={review.traveller?.fullName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-navy-950">
                          {review.traveller?.fullName ?? 'Guest'}
                        </p>
                        <p className="text-xs text-warm-400">{formatDate(review.createdAt)}</p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-warm-700 mt-2 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>

                {/* Existing host response */}
                {review.hostResponse && (
                  <div className="mt-4 ml-[52px] pl-4 border-l-2 border-gold-300">
                    <p className="text-xs font-semibold text-gold-700 mb-1">Your response</p>
                    <p className="text-sm text-warm-700">{review.hostResponse}</p>
                  </div>
                )}

                {/* Response form */}
                {!review.hostResponse && (
                  <div className="mt-4 pt-4 border-t border-warm-100">
                    {respondingTo === review.id ? (
                      <div className="space-y-2">
                        {submitError[review.id] && (
                          <p className="text-xs text-red-600">{submitError[review.id]}</p>
                        )}
                        <textarea
                          rows={3}
                          value={responseText[review.id] ?? ''}
                          onChange={(e) => setResponseText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                          placeholder="Write a thoughtful response…"
                          className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setRespondingTo(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-warm-700 border border-warm-200 hover:border-warm-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitResponse(review.id)}
                            disabled={submitLoading === review.id || !(responseText[review.id] ?? '').trim()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold transition-colors disabled:opacity-60"
                          >
                            Submit Response
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(review.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gold-600 hover:text-gold-500 transition-colors"
                      >
                        <MessageSquare size={13} /> Respond to this review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
