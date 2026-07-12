import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsSkeleton } from '@/components/ui/loading'
import { Building2, Calendar, MessageSquare, DollarSign, Users, TrendingUp, Activity, UserCheck, Settings, FileText, AlertTriangle, Globe, Eye, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
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

interface StatCard {
  icon: typeof Users
  label: string
  value: string | number
  gradient: string
  trend?: { value: number; positive: boolean }
  sub?: string
}

const GRADIENTS: Record<string, string> = {
  users: 'from-blue-600 to-blue-700',
  properties: 'from-purple-600 to-purple-700',
  bookings: 'from-emerald-600 to-emerald-700',
  views: 'from-cyan-600 to-cyan-700',
  revenue: 'from-amber-500 to-orange-600',
  pending: 'from-orange-500 to-red-600',
  complaints: 'from-red-500 to-rose-600',
}

const ICON_BG: Record<string, string> = {
  users: 'bg-blue-500/20 text-blue-200',
  properties: 'bg-purple-500/20 text-purple-200',
  bookings: 'bg-emerald-500/20 text-emerald-200',
  views: 'bg-cyan-500/20 text-cyan-200',
  revenue: 'bg-amber-500/20 text-amber-200',
  pending: 'bg-orange-500/20 text-orange-200',
  complaints: 'bg-red-500/20 text-red-200',
}

function StatCard({ icon: Icon, label, value, gradient, sub }: StatCard) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={`rounded-xl p-2.5 ${ICON_BG[gradient.split('-')[1]] || 'bg-white/10'} backdrop-blur-sm`}>
            <Icon className="h-5 w-5" />
          </div>
          {sub && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {sub}
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-white/70">{label}</p>
      </div>
    </div>
  )
}

function QuickAction({ to, icon: Icon, label, gradient }: { to: string; icon: typeof Users; label: string; gradient: string }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${gradient} p-4 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 group`}
    >
      <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white/90 transition-colors" />
    </Link>
  )
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
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <StatsSkeleton />
      </div>
    )
  }

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  const isOwner = profile?.role === 'owner' || profile?.role === 'agent'

  const adminCards: StatCard[] = [
    { icon: Users, label: t('total_users'), value: stats?.totalUsers ?? 0, gradient: GRADIENTS.users, sub: t('active') },
    { icon: Building2, label: t('total_properties'), value: stats?.totalProperties ?? 0, gradient: GRADIENTS.properties, sub: `${stats?.pendingProperties ?? 0} ${t('pending')}` },
    { icon: Calendar, label: t('total_bookings'), value: stats?.totalBookings ?? 0, gradient: GRADIENTS.bookings },
    { icon: Eye, label: t('total_views'), value: (stats?.totalViews ?? 0).toLocaleString(), gradient: GRADIENTS.views },
    { icon: DollarSign, label: `${t('total_revenue')} (${t('rwf')})`, value: (stats?.totalRevenue ?? 0).toLocaleString(), gradient: GRADIENTS.revenue },
    { icon: AlertTriangle, label: t('pending_properties'), value: stats?.pendingProperties ?? 0, gradient: GRADIENTS.pending },
    { icon: MessageSquare, label: t('open_complaints'), value: stats?.openComplaints ?? 0, gradient: GRADIENTS.complaints },
  ]

  const ownerCards: StatCard[] = [
    { icon: Building2, label: t('total_properties'), value: stats?.totalProperties ?? 0, gradient: GRADIENTS.properties },
    { icon: Calendar, label: t('active_bookings'), value: t('zero'), gradient: GRADIENTS.bookings },
    { icon: DollarSign, label: t('monthly_earnings'), value: t('rwf_zero'), gradient: GRADIENTS.revenue },
    { icon: TrendingUp, label: t('average_rating'), value: t('zero'), gradient: GRADIENTS.views },
  ]

  const tenantCards: StatCard[] = [
    { icon: Calendar, label: t('active_bookings'), value: t('zero'), gradient: GRADIENTS.bookings },
    { icon: Eye, label: t('saved_properties'), value: t('zero'), gradient: GRADIENTS.views },
    { icon: MessageSquare, label: t('unread_messages'), value: t('zero'), gradient: GRADIENTS.complaints },
    { icon: TrendingUp, label: t('reviews_given'), value: t('zero'), gradient: GRADIENTS.pending },
  ]

  const statCards = isAdmin ? adminCards : isOwner ? ownerCards : tenantCards

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {t('welcome_back')}, {profile?.full_name?.split(' ')[0] || t('user')}
              </h1>
              <p className="mt-1.5 text-gray-300 text-sm">
                {isAdmin ? t('admin_dashboard_description') : t('dashboard_description')}
              </p>
            </div>
            {isAdmin && (
              <Link to="/dashboard/activity-logs" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-all backdrop-blur-sm">
                <Activity className="h-4 w-4" />
                {t('view_activity_logs')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Admin Quick Actions + Overview */}
      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-amber-500" />
                {t('quick_actions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2.5">
                <QuickAction to="/dashboard/users" icon={Users} label={t('users')} gradient="from-blue-600 to-blue-700" />
                <QuickAction to="/dashboard/properties" icon={Building2} label={t('properties')} gradient="from-purple-600 to-purple-700" />
                <QuickAction to="/dashboard/settings" icon={Globe} label={t('cms')} gradient="from-emerald-600 to-emerald-700" />
                <QuickAction to="/dashboard/settings" icon={Settings} label={t('settings')} gradient="from-amber-500 to-orange-600" />
                <QuickAction to="/dashboard/reports" icon={FileText} label={t('reports')} gradient="from-cyan-600 to-cyan-700" />
                <QuickAction to="/dashboard/complaints" icon={AlertTriangle} label={t('complaints')} gradient="from-red-500 to-rose-600" />
              </div>
            </CardContent>
          </Card>

          {/* Platform Overview */}
          <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary-500" />
                {t('platform_overview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { label: t('total_users'), value: stats?.totalUsers ?? 0, color: 'bg-blue-500' },
                    { label: t('total_properties'), value: stats?.totalProperties ?? 0, color: 'bg-purple-500' },
                    { label: t('pending_approval'), value: stats?.pendingProperties ?? 0, color: 'bg-orange-500' },
                    { label: t('total_bookings'), value: stats?.totalBookings ?? 0, color: 'bg-emerald-500' },
                  ].map(item => {
                    const max = Math.max(stats?.totalUsers ?? 1, stats?.totalProperties ?? 1, stats?.totalBookings ?? 1, 1)
                    const pct = ((item.value as number) / max) * 100
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-4">
                  {[
                    { label: t('total_views'), value: stats?.totalViews?.toLocaleString() ?? '0', color: 'bg-cyan-500' },
                    { label: t('open_complaints'), value: stats?.openComplaints ?? 0, color: 'bg-red-500' },
                    { label: t('total_revenue'), value: `${t('rwf')} ${(stats?.totalRevenue ?? 0).toLocaleString()}`, color: 'bg-amber-500' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                    </div>
                  ))}
                  <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-4 border border-primary-200 dark:border-primary-800">
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{t('platform_health')}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                        <Activity className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{t('all_systems_operational')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
