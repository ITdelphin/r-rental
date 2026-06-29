import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const mockBookings = [
  { id: '1', property: 'Modern Apartment in Kicukiro', status: 'approved', date: '2024-12-15', amount: 'RWF 250,000' },
  { id: '2', property: 'Villa in Musanze', status: 'pending', date: '2024-12-20', amount: 'RWF 500,000' },
  { id: '3', property: 'Studio in Kimihurura', status: 'completed', date: '2024-11-01', amount: 'RWF 150,000' },
]

const statusColors = { pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'secondary', completed: 'default' } as const

export function TenantBookings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_bookings')}</h1>
      {mockBookings.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
          <p className="mt-2 text-sm text-gray-500">Start by browsing properties and booking one you like.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><Home className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{booking.property}</h3>
                    <p className="text-sm text-gray-500">{booking.date}</p>
                    <p className="text-sm font-medium text-primary-600 mt-1">{booking.amount}</p>
                  </div>
                </div>
                <Badge variant={statusColors[booking.status as keyof typeof statusColors] || 'default'}>{booking.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
