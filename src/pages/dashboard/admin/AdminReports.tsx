import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Calendar, DollarSign, TrendingUp, RefreshCw, ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'
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

function GrowthChart({ data, period }: { data: { label: string; value: number; color: string }[]; period: Period }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-3">
      {data.map(item => {
        const pct = (item.value / max) * 100
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">{item.value.toLocaleString()}</span>
            </div>
            <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${item.color} transition-all duration-700 ease-out`}
                style={{ width: `${pct}%` }}
              />
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

    useEffect(() => {
        fetchStats()
    }, [period])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const now = new Date()
            const periodMap: Record<Period, Date> = {
                '7d': new Date(now.getTime() - 7 * 86400000),
                '30d': new Date(now.getTime() - 30 * 86400000),
                '90d': new Date(now.getTime() - 90 * 86400000),
                '1y': new Date(now.getTime() - 365 * 86400000),
            }
            const since = periodMap[period].toISOString()

            const [usersRes, propsRes, bookingsRes, revenueRes, newUsersRes, newPropsRes] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('properties').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('property:properties(price)').not('status', 'eq', 'cancelled'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', since),
                supabase.from('properties').select('*', { count: 'exact', head: true }).gte('created_at', since),
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
    }

    const statCards = stats ? [
        { icon: Users, label: t('total_users'), value: stats.totalUsers.toLocaleString(), gradient: 'from-blue-600 to-blue-700', change: `+${stats.newUsersThisMonth}` },
        { icon: Building2, label: t('total_properties'), value: stats.totalProperties.toLocaleString(), gradient: 'from-purple-600 to-purple-700', change: `+${stats.newPropertiesThisMonth}` },
        { icon: Calendar, label: t('total_bookings'), value: stats.totalBookings.toLocaleString(), gradient: 'from-emerald-600 to-emerald-700' },
        { icon: DollarSign, label: t('total_revenue'), value: `${(stats.totalRevenue / 1000).toFixed(1)}K ${t('rwf')}`, gradient: 'from-amber-500 to-orange-600' },
    ] : []

    const chartData = stats ? [
        { label: t('total_users'), value: stats.totalUsers, color: 'bg-blue-500' },
        { label: t('total_properties'), value: stats.totalProperties, color: 'bg-purple-500' },
        { label: t('total_bookings'), value: stats.totalBookings, color: 'bg-emerald-500' },
        { label: t('total_revenue'), value: Math.round(stats.totalRevenue / 1000), color: 'bg-amber-500' },
    ] : []

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{t('reports')}</h1>
                        <p className="mt-1.5 text-gray-300 text-sm">{t('view_platform_statistics')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur-sm">
                            {PERIODS.map(p => (
                                <button key={p} onClick={() => setPeriod(p)}
                                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                        period === p
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {p === '7d' ? t('7_days') : p === '30d' ? t('30_days') : p === '90d' ? t('90_days') : t('1_year')}
                                </button>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={fetchStats} className="bg-white/10 text-white hover:bg-white/20 border-0">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Card key={i} className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"><CardContent className="p-6"><TableSkeleton rows={2} /></CardContent></Card>)}
                </div>
            ) : !stats ? (
                <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <CardContent className="py-16 text-center text-gray-500">{t('failed_to_load_reports')}</CardContent>
                </Card>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map(card => (
                            <div key={card.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg shadow-black/10`}>
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
                                <div className="relative">
                                    <div className="flex items-start justify-between">
                                        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                                            <card.icon className="h-5 w-5 text-white" />
                                        </div>
                                        {card.change && (
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                                <ArrowUpRight className="h-3 w-3" />
                                                {card.change}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-4 text-2xl font-bold tracking-tight text-white">{card.value}</p>
                                    <p className="mt-0.5 text-xs font-medium text-white/70">{card.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Growth Chart */}
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{t('growth_trends')}</CardTitle>
                                    <p className="text-sm text-gray-500">{t('growth_trends_description')}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <GrowthChart data={chartData} period={period} />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
