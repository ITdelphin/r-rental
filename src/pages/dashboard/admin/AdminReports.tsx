import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Calendar, DollarSign, TrendingUp, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'

interface ReportStats {
    totalUsers: number
    totalProperties: number
    totalBookings: number
    totalRevenue: number
    newUsersThisMonth: number
    newPropertiesThisMonth: number
}

type Period = '7d' | '30d' | '90d' | '1y'

const PERIODS: Period[] = ['7d', '30d', '90d', '1y']

const CARD_STYLES: Record<string, string> = {
  users: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800',
  properties: 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-800',
  bookings: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800',
  revenue: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800',
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-3">
      {data.map(item => {
        const pct = (item.value / max) * 100
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AdminReports() {
    const { t } = useTranslation()
    const [stats, setStats] = useState<ReportStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<Period>('30d')

    const fetchStats = useCallback(async () => {
        setLoading(true)
        try {
            const now = new Date()
            let startDate: Date
            switch (period) {
                case '7d': startDate = new Date(now.getTime() - 7 * 86400000); break
                case '30d': startDate = new Date(now.getTime() - 30 * 86400000); break
                case '90d': startDate = new Date(now.getTime() - 90 * 86400000); break
                case '1y': startDate = new Date(now.getTime() - 365 * 86400000); break
                default: startDate = new Date(now.getTime() - 30 * 86400000)
            }
            const [usersRes, propsRes, bookingsRes, revenueRes, newUsersRes, newPropsRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('properties').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('property:properties(price)').not('status', 'eq', 'cancelled'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
                supabase.from('properties').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
            ])
            const revenueData = ((revenueRes as { data: { property: { price: number } | null }[] | null }).data || [])
            const totalRevenue = revenueData.reduce((sum, b) => sum + (b.property?.price || 0), 0)
            setStats({
                totalUsers: usersRes.count ?? 0,
                totalProperties: propsRes.count ?? 0,
                totalBookings: bookingsRes.count ?? 0,
                totalRevenue,
                newUsersThisMonth: newUsersRes.count ?? 0,
                newPropertiesThisMonth: newPropsRes.count ?? 0,
            })
        } catch {
            setStats(null)
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const statCards = stats ? [
        { icon: Users, label: t('total_users'), value: stats.totalUsers.toLocaleString(), style: CARD_STYLES.users, change: `+${stats.newUsersThisMonth}` },
        { icon: Building2, label: t('total_properties'), value: stats.totalProperties.toLocaleString(), style: CARD_STYLES.properties, change: `+${stats.newPropertiesThisMonth}` },
        { icon: Calendar, label: t('total_bookings'), value: stats.totalBookings.toLocaleString(), style: CARD_STYLES.bookings },
        { icon: DollarSign, label: t('total_revenue'), value: `${(stats.totalRevenue / 1000).toFixed(1)}K ${t('rwf')}`, style: CARD_STYLES.revenue },
    ] : []

    const chartData = stats ? [
        { label: t('total_users'), value: stats.totalUsers, color: 'bg-blue-500' },
        { label: t('total_properties'), value: stats.totalProperties, color: 'bg-purple-500' },
        { label: t('total_bookings'), value: stats.totalBookings, color: 'bg-emerald-500' },
        { label: t('total_revenue'), value: Math.round(stats.totalRevenue / 1000), color: 'bg-amber-500' },
    ] : []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('reports')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('view_platform_statistics')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                        {PERIODS.map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${period === p ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                {p === '7d' ? t('7_days') : p === '30d' ? t('30_days') : p === '90d' ? t('90_days') : t('1_year')}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchStats}><RefreshCw className="h-4 w-4" /></Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Card key={i}><CardContent className="p-6"><TableSkeleton rows={2} /></CardContent></Card>)}
                </div>
            ) : !stats ? (
                <Card><CardContent className="py-12 text-center text-gray-500">{t('failed_to_load_reports')}</CardContent></Card>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map(card => (
                            <Card key={card.label}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className={`rounded-lg p-3 ring-1 ${card.style}`}>
                                            <card.icon className="h-6 w-6" />
                                        </div>
                                        {card.change && (
                                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                {card.change}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Growth Chart */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
                                    <TrendingUp className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('growth_trends')}</h3>
                                    <p className="text-sm text-gray-500">{t('growth_trends_description')}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <BarChart data={chartData} />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
