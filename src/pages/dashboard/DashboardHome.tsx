import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsSkeleton } from '@/components/ui/loading'
import { Building2, Calendar, Heart, MessageSquare, Star, DollarSign, Users, TrendingUp, Activity, UserCheck, Settings, FileText, AlertTriangle, Globe, Eye, Zap, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalUsers: number
  totalProperties: number
  totalBookings: number
  totalRevenue: number
  pendingProperties: number
  openComplaints: number
  totalViews: number
}

const CARD_STYLES: Record<string, string> = {
  users: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800',
  properties: 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-800',
  bookings: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800',
  views: 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:ring-cyan-800',
  revenue: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800',
  pending: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-800',
  complaints: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800',
}

export function DashboardHome() {
  const { t } = useTranslation()
  const { profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [profiles, properties, bookings, complaints, payments] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('properties').select('id, status, views_count', { count: 'exact', head: false }),
          supabase.from('bookings').select('id', { count: 'exact', head: true }),
          supabase.from('complaints').select('id', { count: 'exact', head: false }).eq('status', 'open'),
          supabase.from('payments').select('amount').eq('status', 'completed'),
        ])
        const totalProperties = properties.count || 0
        const pendingProps = (properties.data as Array<{ status: string; views_count: number }> | null)?.filter(p => p.status === 'pending_approval').length || 0
        const totalViews = (properties.data as Array<{ status: string; views_count: number }> | null)?.reduce((s, p) => s + (p.views_count || 0), 0) || 0
        const totalRevenue = (payments.data as Array<{ amount: number }> | null)?.reduce((s, p) => s + (p.amount || 0), 0) || 0

        setStats({
          totalUsers: profiles.count || 0,
          totalProperties,
          totalBookings: bookings.count || 0,
          totalRevenue,
          pendingProperties: pendingProps,
          openComplaints: complaints.count || 0,
          totalViews,
        })
      } catch {
        setStats({ totalUsers: 0, totalProperties: 0, totalBookings: 0, totalRevenue: 0, pendingProperties: 0, openComplaints: 0, totalViews: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <StatsSkeleton />
      </div>
    )
  }

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  const isOwner = profile?.role === 'owner' || profile?.role === 'agent'

  const adminCards = [
    { icon: Users, label: t('total_users'), value: stats?.totalUsers ?? 0, style: CARD_STYLES.users },
    { icon: Building2, label: t('total_properties'), value: stats?.totalProperties ?? 0, style: CARD_STYLES.properties },
    { icon: Calendar, label: t('total_bookings'), value: stats?.totalBookings ?? 0, style: CARD_STYLES.bookings },
    { icon: Eye, label: t('total_views'), value: (stats?.totalViews ?? 0).toLocaleString(), style: CARD_STYLES.views },
    { icon: DollarSign, label: `${t('total_revenue')} (${t('rwf')})`, value: (stats?.totalRevenue ?? 0).toLocaleString(), style: CARD_STYLES.revenue },
    { icon: AlertTriangle, label: t('pending_properties'), value: stats?.pendingProperties ?? 0, style: CARD_STYLES.pending },
    { icon: MessageSquare, label: t('open_complaints'), value: stats?.openComplaints ?? 0, style: CARD_STYLES.complaints },
  ]

  const ownerCards = [
    { icon: Building2, label: t('total_properties'), value: stats?.totalProperties ?? 0, style: CARD_STYLES.properties },
    { icon: Calendar, label: t('active_bookings'), value: t('zero'), style: CARD_STYLES.bookings },
    { icon: DollarSign, label: t('monthly_earnings'), value: t('rwf_zero'), style: CARD_STYLES.revenue },
    { icon: Star, label: t('average_rating'), value: t('zero'), style: CARD_STYLES.views },
  ]

  const tenantCards = [
    { icon: Calendar, label: t('active_bookings'), value: t('zero'), style: CARD_STYLES.bookings },
    { icon: Heart, label: t('saved_properties'), value: t('zero'), style: CARD_STYLES.views },
    { icon: MessageSquare, label: t('unread_messages'), value: t('zero'), style: CARD_STYLES.complaints },
    { icon: Star, label: t('reviews_given'), value: t('zero'), style: CARD_STYLES.pending },
  ]

  const statCards = isAdmin ? adminCards : isOwner ? ownerCards : tenantCards

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isAdmin ? t('admin_dashboard') : t('dashboard')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('welcome')}, {profile?.full_name || t('user')}!
          </p>
        </div>
        {isAdmin && (
          <Link to="/dashboard/activity-logs" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <Activity className="h-4 w-4" />
            {t('view_activity_logs')}
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map(stat => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1 ${stat.style}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions for all roles */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-amber-500" />
              {t('quick_actions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {isAdmin && (
                <Link to="/dashboard/users" className="flex flex-col items-center gap-2 rounded-lg bg-blue-50 p-4 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">
                  <Users className="h-6 w-6" /> {t('users')}
                </Link>
              )}
              {(isAdmin || isOwner) && (
                <Link to="/dashboard/properties" className="flex flex-col items-center gap-2 rounded-lg bg-purple-50 p-4 text-sm font-medium text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40">
                  <Building2 className="h-6 w-6" /> {(isAdmin ? t('properties') : t('my_properties'))}
                </Link>
              )}
              {isOwner && (
                <Link to="/dashboard/properties/add" className="flex flex-col items-center gap-2 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40">
                  <Plus className="h-6 w-6" /> {t('add_property')}
                </Link>
              )}
              <Link to="/dashboard/bookings" className="flex flex-col items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40">
                <Calendar className="h-6 w-6" /> {t('my_bookings')}
              </Link>
              {isAdmin && (
                <>
                  <Link to="/dashboard/settings" className="flex flex-col items-center gap-2 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40">
                    <Globe className="h-6 w-6" /> {t('cms')}
                  </Link>
                  <Link to="/dashboard/settings" className="flex flex-col items-center gap-2 rounded-lg bg-orange-50 p-4 text-sm font-medium text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40">
                    <Settings className="h-6 w-6" /> {t('settings')}
                  </Link>
                  <Link to="/dashboard/reports" className="flex flex-col items-center gap-2 rounded-lg bg-yellow-50 p-4 text-sm font-medium text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40">
                    <FileText className="h-6 w-6" /> {t('reports')}
                  </Link>
                  <Link to="/dashboard/complaints" className="flex flex-col items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">
                    <AlertTriangle className="h-6 w-6" /> {t('complaints')}
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
          {/* Platform Overview */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                {t('platform_overview')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: t('total_users'), value: stats?.totalUsers ?? 0 },
                  { label: t('total_properties'), value: stats?.totalProperties ?? 0 },
                  { label: t('pending_approval'), value: stats?.pendingProperties ?? 0 },
                  { label: t('total_bookings'), value: stats?.totalBookings ?? 0 },
                  { label: t('total_views'), value: (stats?.totalViews ?? 0).toLocaleString() },
                  { label: t('open_complaints'), value: stats?.openComplaints ?? 0 },
                  { label: `${t('total_revenue')} (${t('rwf')})`, value: (stats?.totalRevenue ?? 0).toLocaleString() },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </div>
  )
}
