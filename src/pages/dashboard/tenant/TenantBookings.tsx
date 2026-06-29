import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Calendar, Home, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface Booking {
  id: string
  property: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  date: string
  amount: string
}

const mockBookings: Booking[] = [
  { id: '1', property: 'Modern Apartment in Kicukiro', status: 'approved', date: '2024-12-15', amount: 'RWF 250,000' },
  { id: '2', property: 'Villa in Musanze', status: 'pending', date: '2024-12-20', amount: 'RWF 500,000' },
  { id: '3', property: 'Studio in Kimihurura', status: 'completed', date: '2024-11-01', amount: 'RWF 150,000' },
]

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'secondary' | 'default'; icon: typeof Clock }> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
  cancelled: { label: 'Cancelled', variant: 'secondary', icon: XCircle },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle },
}

export function TenantBookings() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setBookings(mockBookings)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_bookings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_bookings')}</p>
        </div>
        <Link to="/properties">
          <Button variant="outline" size="sm"><Home className="h-4 w-4" /> {t('browse_properties')}</Button>
        </Link>
      </div>

      {loading ? (
        <ListSkeleton items={3} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('no_bookings_yet')}
          description={t('no_bookings_description')}
          actionLabel={t('browse_properties')}
          onAction={() => window.location.href = '/properties'}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status] || statusConfig.pending
            const StatusIcon = config.icon
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/50 shrink-0">
                        <Home className="h-6 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{booking.property}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {booking.date}</span>
                          <span className="font-medium text-primary-600">{booking.amount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge variant={config.variant} className="flex items-center gap-1 capitalize">
                        <StatusIcon className="h-3 w-3" /> {t(config.label.toLowerCase())}
                      </Badge>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
