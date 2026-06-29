import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsSkeleton } from '@/components/ui/loading'
import { Building2, Calendar, Heart, MessageSquare, Star, DollarSign, Users, TrendingUp, Activity } from 'lucide-react'

export function DashboardHome() {
  const { t } = useTranslation()
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard')}</h1>
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <StatsSkeleton />
      </div>
    )
  }

  const isOwner = profile?.role === 'owner' || profile?.role === 'agent'

  const stats = isOwner
    ? [
        { icon: Building2, label: t('total_properties'), value: '12', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50' },
        { icon: Calendar, label: t('active_bookings'), value: '5', color: 'bg-green-100 text-green-600 dark:bg-green-900/50' },
        { icon: DollarSign, label: t('monthly_earnings'), value: 'RWF 850,000', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50' },
        { icon: Star, label: t('average_rating'), value: '4.8', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50' },
      ]
    : [
        { icon: Calendar, label: t('active_bookings'), value: '2', color: 'bg-green-100 text-green-600 dark:bg-green-900/50' },
        { icon: Heart, label: t('saved_properties'), value: '8', color: 'bg-red-100 text-red-600 dark:bg-red-900/50' },
        { icon: MessageSquare, label: t('unread_messages'), value: '3', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50' },
        { icon: Star, label: t('reviews_given'), value: '4', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50' },
      ]

  const recentActivity = [
    { action: t('booking_confirmed_activity'), time: '2 hours ago', icon: Calendar },
    { action: t('new_message_activity'), time: '5 hours ago', icon: MessageSquare },
    { action: t('property_approved_activity'), time: '1 day ago', icon: Building2 },
    { action: t('review_received_activity'), time: '2 days ago', icon: Star },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('welcome')}, {profile?.full_name || t('user')}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> {t('recent_activity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 dark:border-gray-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <item.icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.action}</p>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> {t('quick_actions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {isOwner ? (
                <>
                  <QuickActionCard icon={Building2} label={t('add_property')} color="blue" />
                  <QuickActionCard icon={Calendar} label={t('view_bookings')} color="green" />
                  <QuickActionCard icon={DollarSign} label={t('view_earnings')} color="purple" />
                  <QuickActionCard icon={MessageSquare} label={t('view_messages')} color="orange" />
                </>
              ) : (
                <>
                  <QuickActionCard icon={Building2} label={t('browse_properties')} color="blue" />
                  <QuickActionCard icon={Calendar} label={t('my_bookings')} color="green" />
                  <QuickActionCard icon={Heart} label={t('my_favorites')} color="red" />
                  <QuickActionCard icon={MessageSquare} label={t('messages')} color="orange" />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickActionCard({ icon: Icon, label, color }: { icon: typeof Building2; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40',
  }
  return (
    <button className={`flex flex-col items-center gap-2 rounded-lg p-4 text-sm font-medium transition-colors cursor-pointer ${colorMap[color]}`}>
      <Icon className="h-6 w-6" />
      {label}
    </button>
  )
}
