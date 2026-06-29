import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Notification {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Property Approved', body: 'Your property "Modern Apartment in Kicukiro" has been approved.', time: '2 hours ago', read: false, type: 'success' },
  { id: '2', title: 'Booking Received', body: 'New booking request for "Villa in Musanze".', time: '5 hours ago', read: false, type: 'info' },
  { id: '3', title: 'New Message', body: 'Alice sent you a message about "Studio in Kimihurura".', time: '1 day ago', read: true, type: 'info' },
  { id: '4', title: 'Payment Completed', body: 'Payment of RWF 250,000 received for "Apartment in Kicukiro".', time: '2 days ago', read: true, type: 'success' },
  { id: '5', title: 'Maintenance Request', body: 'Maintenance request #1234 has been marked as urgent.', time: '3 days ago', read: true, type: 'warning' },
]

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const typeColors = {
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/30',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/30',
}

export function NotificationsPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('notifications')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} ${t('unread_notifications')}` : t('all_caught_up')}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> {t('mark_all_read')}
          </Button>
        )}
      </div>

      {loading ? (
        <ListSkeleton items={5} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t('no_notifications')}
          description={t('no_notifications_description')}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const TypeIcon = typeIcons[notif.type]
            const typeColor = typeColors[notif.type]
            return (
              <Card
                key={notif.id}
                className={`transition-colors ${
                  notif.read
                    ? ''
                    : 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/10'
                }`}
              >
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColor}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{notif.title}</h3>
                        {!notif.read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{notif.body}</p>
                      <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
