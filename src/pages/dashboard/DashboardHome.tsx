import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsSkeleton } from '@/components/ui/loading'
import { Building2, Calendar, Heart, MessageSquare, Star, DollarSign, Users, TrendingUp, Activity, UserCheck, Settings, FileText, AlertTriangle, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalUsers: number
  totalProperties: number
  totalBookings: number
  totalRevenue: number
  pendingProperties: number
  openComplaints: number
}

export function DashboardHome() {
  const { t } = useTranslation()
  const { profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [profiles, properties, bookings, complaints] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('properties').select('id, status', { count: 'exact', head: false }),
          supabase.from('bookings').select('id', { count: 'exact', head: true }),
          supabase.from('complaints').select('id', { count: 'exact', head: false }).eq('status', 'open'),
        ])
        const totalProperties = properties.count || 0
        const pendingProps = properties.data
          ? (await supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval')).count || 0
          : 0

        setStats({
          totalUsers: profiles.count || 0,
          totalProperties,
          totalBookings: bookings.count || 0,
          totalRevenue: 0,
          pendingProperties: pendingProps,
          openComplaints: complaints.count || 0,
        })
      } catch {
        setStats({
          totalUsers: 0, totalProperties: 0, totalBookings: 0,
          totalRevenue: 0, pendingProperties: 0, openComplaints: 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (authLoading || loading) {
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

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  const isOwner = profile?.role === 'owner' || profile?.role === 'agent'

  const statCards = isAdmin
    ? [
        { icon: Users, label: 'Total Users', value: stats?.totalUsers ?? 0, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50' },
        { icon: Building2, label: 'Total Properties', value: stats?.totalProperties ?? 0, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50' },
        { icon: Calendar, label: 'Total Bookings', value: stats?.totalBookings ?? 0, color: 'bg-green-100 text-green-600 dark:bg-green-900/50' },
        { icon: DollarSign, label: 'Revenue (RWF)', value: stats?.totalRevenue?.toLocaleString() ?? '0', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50' },
        { icon: AlertTriangle, label: 'Pending Properties', value: stats?.pendingProperties ?? 0, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50' },
        { icon: MessageSquare, label: 'Open Complaints', value: stats?.openComplaints ?? 0, color: 'bg-red-100 text-red-600 dark:bg-red-900/50' },
      ]
    : isOwner
    ? [
        { icon: Building2, label: t('total_properties'), value: stats?.totalProperties ?? 0, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50' },
        { icon: Calendar, label: t('active_bookings'), value: '0', color: 'bg-green-100 text-green-600 dark:bg-green-900/50' },
        { icon: DollarSign, label: t('monthly_earnings'), value: 'RWF 0', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50' },
        { icon: Star, label: t('average_rating'), value: '0', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50' },
      ]
    : [
        { icon: Calendar, label: t('active_bookings'), value: '0', color: 'bg-green-100 text-green-600 dark:bg-green-900/50' },
        { icon: Heart, label: t('saved_properties'), value: '0', color: 'bg-red-100 text-red-600 dark:bg-red-900/50' },
        { icon: MessageSquare, label: t('unread_messages'), value: '0', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50' },
        { icon: Star, label: t('reviews_given'), value: '0', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50' },
      ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isAdmin ? 'Admin Dashboard' : t('dashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('welcome')}, {profile?.full_name || t('user')}!
          </p>
        </div>
        {isAdmin && (
          <Link to="/dashboard/activity-logs" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <Activity className="h-4 w-4" />
            View Activity Logs
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
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

      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary-600" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/dashboard/users" className="flex flex-col items-center gap-2 rounded-lg bg-blue-50 p-4 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">
                  <Users className="h-6 w-6" /> Users
                </Link>
                <Link to="/dashboard/properties" className="flex flex-col items-center gap-2 rounded-lg bg-purple-50 p-4 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40">
                  <Building2 className="h-6 w-6" /> Properties
                </Link>
                <Link to="/dashboard/cms" className="flex flex-col items-center gap-2 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40">
                  <Globe className="h-6 w-6" /> CMS
                </Link>
                <Link to="/dashboard/settings" className="flex flex-col items-center gap-2 rounded-lg bg-orange-50 p-4 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40">
                  <Settings className="h-6 w-6" /> Settings
                </Link>
                <Link to="/dashboard/reports" className="flex flex-col items-center gap-2 rounded-lg bg-yellow-50 p-4 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40">
                  <FileText className="h-6 w-6" /> Reports
                </Link>
                <Link to="/dashboard/complaints" className="flex flex-col items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">
                  <AlertTriangle className="h-6 w-6" /> Complaints
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" /> Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats?.totalUsers ?? 0}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Properties</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats?.totalProperties ?? 0}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats?.pendingProperties ?? 0}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats?.totalBookings ?? 0}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Open Complaints</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats?.openComplaints ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">RWF {stats?.totalRevenue?.toLocaleString() ?? '0'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
