import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Calendar, Heart, MessageSquare, Star, DollarSign } from 'lucide-react'

export function DashboardHome() {
  const { t } = useTranslation()
  const { profile } = useAuth()

  const stats = profile?.role === 'owner' || profile?.role === 'agent'
    ? [
      { icon: Building2, label: 'Total Properties', value: '12' },
      { icon: Calendar, label: 'Active Bookings', value: '5' },
      { icon: DollarSign, label: 'Monthly Earnings', value: 'RWF 850,000' },
      { icon: Star, label: 'Average Rating', value: '4.8' },
    ]
    : [
      { icon: Calendar, label: 'Active Bookings', value: '2' },
      { icon: Heart, label: 'Saved Properties', value: '8' },
      { icon: MessageSquare, label: 'Unread Messages', value: '3' },
      { icon: Star, label: 'Reviews Given', value: '4' },
    ]

  const recentActivity = [
    { action: 'Booking confirmed for 2BR Apartment in Kicukiro', time: '2 hours ago' },
    { action: 'New message from property owner', time: '5 hours ago' },
    { action: 'Property "Modern Villa in Musanze" was approved', time: '1 day ago' },
    { action: 'Review received for 3BR House in Kimihurura', time: '2 days ago' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('welcome')}, {profile?.full_name || 'User'}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/50">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('recent_activity') || 'Recent Activity'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.action}</p>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
