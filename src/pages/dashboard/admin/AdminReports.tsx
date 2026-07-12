import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Users, Building2, Calendar, DollarSign, TrendingUp, RefreshCw } from 'lucide-react'
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

            const finalStats: ReportStats = {
                totalUsers: usersRes.count ?? 0,
                totalProperties: propsRes.count ?? 0,
                totalBookings: bookingsRes.count ?? 0,
                totalRevenue,
                newUsersThisMonth: newUsersRes.count ?? 0,
                newPropertiesThisMonth: newPropsRes.count ?? 0,
            }
            setStats(finalStats)
        } catch {
            setStats(null)
        } finally {
            setLoading(false)
        }
    }

    const statCards = stats ? [
        { icon: Users, label: t('total_users'), value: stats.totalUsers.toLocaleString(), color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50', sub: `${t('new_this_period')}: +${stats.newUsersThisMonth}` },
        { icon: Building2, label: t('total_properties'), value: stats.totalProperties.toLocaleString(), color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50', sub: `${t('new_this_period')}: +${stats.newPropertiesThisMonth}` },
        { icon: Calendar, label: t('total_bookings'), value: stats.totalBookings.toLocaleString(), color: 'bg-green-100 text-green-600 dark:bg-green-900/50' },
        { icon: DollarSign, label: t('total_revenue'), value: `${(stats.totalRevenue / 1000).toFixed(1)}K ${t('rwf')}`, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50' },
    ] : []

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('reports')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('view_platform_statistics')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                        {(['7d', '30d', '90d', '1y'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map(card => (
                            <Card key={card.label}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className={`rounded-lg p-3 ${card.color}`}>
                                            <card.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                                    {card.sub && <p className="mt-1 text-xs text-green-600">{card.sub}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
                                    <TrendingUp className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('growth_trends')}</h3>
                                    <p className="text-sm text-gray-500">{t('growth_trends_description')}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 dark:border-gray-600">
                                <div className="text-center">
                                    <BarChart3 className="mx-auto h-8 w-8 text-gray-300" />
                                    <p className="mt-2 text-sm text-gray-500">{t('chart_coming_soon')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
