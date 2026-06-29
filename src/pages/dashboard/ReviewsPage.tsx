import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockReviews = [
  { id: '1', property: 'Modern Apartment in Kicukiro', rating: 5, comment: 'Great apartment, highly recommended!', user: 'Alice M.', date: 'Dec 10, 2024' },
  { id: '2', property: 'Villa in Musanze', rating: 4, comment: 'Beautiful location and spacious rooms.', user: 'Bob K.', date: 'Dec 5, 2024' },
  { id: '3', property: 'Studio in Kimihurura', rating: 3, comment: 'Good value for money, but needs some repairs.', user: 'Carol U.', date: 'Nov 28, 2024' },
]

export function ReviewsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('reviews')}</h1>
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{review.property}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">{review.user} - {review.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">{t('edit')}</Button>
                  <Button variant="ghost" size="sm" className="text-red-500">{t('delete')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
