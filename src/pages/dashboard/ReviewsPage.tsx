import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Star, MessageSquare, ThumbsUp, Flag } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Review } from '@/types'

export function ReviewsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<(Review & { property?: { title: string } })[]>([])

  const fetchReviews = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, property:properties(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setReviews((data || []) as unknown as (Review & { property?: { title: string } })[])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('reviews')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_reviews')}</p>
        </div>
        {!loading && reviews.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">{averageRating}</span>
            <span className="text-gray-500">({reviews.length} {t('reviews').toLowerCase()})</span>
          </div>
        )}
      </div>

      {loading ? (
        <ListSkeleton items={4} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('no_reviews_yet')}
          description={t('no_reviews_description')}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{review.property?.title || 'Unknown Property'}</h3>
                      <span className="text-xs text-gray-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 border-t pt-3 dark:border-gray-700">
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <ThumbsUp className="h-4 w-4" /> {t('helpful')}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Flag className="h-4 w-4" /> {t('report')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
