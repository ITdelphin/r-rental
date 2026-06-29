import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCheck } from 'lucide-react'

const mockNotifications = [
  { id: '1', title: 'Property Approved', body: 'Your property "Modern Apartment in Kicukiro" has been approved.', time: '2 hours ago', read: false },
  { id: '2', title: 'Booking Received', body: 'New booking request for "Villa in Musanze".', time: '5 hours ago', read: false },
  { id: '3', title: 'New Message', body: 'Alice sent you a message about "Studio in Kimihurura".', time: '1 day ago', read: true },
  { id: '4', title: 'Payment Completed', body: 'Payment of RWF 250,000 received for "Apartment in Kicukiro".', time: '2 days ago', read: true },
]

export function NotificationsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('notifications')}</h1>
        <Button variant="ghost" size="sm"><CheckCheck className="h-4 w-4" /> Mark all as read</Button>
      </div>
      {mockNotifications.length === 0 ? (
        <div className="py-20 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold">No notifications</h3>
          <p className="mt-2 text-sm text-gray-500">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockNotifications.map((notif) => (
            <Card key={notif.id} className={notif.read ? '' : 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/10'}>
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${notif.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-primary-100 text-primary-600'}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{notif.title}</h3>
                    <p className="text-sm text-gray-500">{notif.body}</p>
                    <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                  </div>
                </div>
                {!notif.read && <div className="h-2 w-2 rounded-full bg-primary-600" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
