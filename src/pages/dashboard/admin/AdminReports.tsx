import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Calendar, DollarSign, TrendingUp, RefreshCw, Download } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

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

function buildDailyBuckets(items: { created_at: string }[], days: number): { date: string; count: number }[] {
    const buckets: Record<string, number> = {}
    const now = Date.now()
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000)
        const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        buckets[key] = 0
    }
    items.forEach(item => {
        const d = new Date(item.created_at)
        const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        if (key in buckets) buckets[key]++
    })
    return Object.entries(buckets).map(([date, count]) => ({ date, count }))
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const rows = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
}

export function AdminReports() {
    const { t } = useTranslation()
    const [stats, setStats] = useState<ReportStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<Period>('30d')
    const [userTrend, setUserTrend] = useState<{ date: string; count: number }[]>([])
    const [bookingTrend, setBookingTrend] = useState<{ date: string; count: number }[]>([])
    const [revenueTrend, setRevenueTrend] = useState<{ date: string; amount: number }[]>([])
    const [roleBreakdown, setRoleBreakdown] = useState<{ role: string; count: number }[]>([])

    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365

    const fetchStats = useCallback(async () => {
        setLoading(true)
        try {
            const startDate = new Date(Date.now() - days * 86400000).toISOString()

            const [usersRes, propsRes, bookingsRes, paymentsRes, newUsersRes, newPropsRes,
                allUsersRes, allBookingsRes, allPaymentsRes] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('properties').select('*', { count: 'exact', head: true }),
                    supabase.from('bookings').select('*', { count: 'exact', head: true }),
                    supabase.from('payments').select('amount').eq('status', 'completed'),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
                    supabase.from('properties').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
                    supabase.from('profiles').select('created_at, role').gte('created_at', startDate),
                    supabase.from('bookings').select('created_at').gte('created_at', startDate),
                    supabase.from('payments').select('created_at, amount').eq('status', 'completed').gte('created_at', startDate),
                ])

            const totalRevenue = ((paymentsRes.data || []) as { amount: number }[]).reduce((s, p) => s + Number(p.amount), 0)

            setStats({
                totalUsers: usersRes.count ?? 0,
                totalProperties: propsRes.count ?? 0,
                totalBookings: bookingsRes.count ?? 0,
                totalRevenue,
                newUsersThisMonth: newUsersRes.count ?? 0,
                newPropertiesThisMonth: newPropsRes.count ?? 0,
            })

            // Trend charts
            const bucketDays = days > 30 ? Math.round(days / 12) : 1
            const usersData = (allUsersRes.data || []) as { created_at: string }[]
            const bookingsData = (allBookingsRes.data || []) as { created_at: string }[]
            const paymentsData = (allPaymentsRes.data || []) as { created_at: string; amount: number }[]

            setUserTrend(buildDailyBuckets(usersData, Math.min(days, 30)))
            setBookingTrend(buildDailyBuckets(bookingsData, Math.min(days, 30)))

            // Revenue trend
            const revBuckets: Record<string, number> = {}
            paymentsData.forEach(p => {
                const key = new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                revBuckets[key] = (revBuckets[key] || 0) + Number(p.amount)
            })
            setRevenueTrend(Object.entries(revBuckets).slice(-14).map(([date, amount]) => ({ date, amount })))

            // Role breakdown
            const roleCounts: Record<string, number> = {}
            usersData.forEach((u: any) => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1 })
            setRoleBreakdown(Object.entries(roleCounts).map(([role, count]) => ({ role, count })))

        } catch {
            setStats(null)
        } finally {
            setLoading(false)
        }
    }, [days])

    useEffect(() => { fetchStats() }, [fetchStats])

    const statCards = stats ? [
        { icon: Users, label: t('total_users'), value: stats.totalUsers.toLocaleString(), style: CARD_STYLES.users, change: `+${stats.newUsersThisMonth}` },
        { icon: Building2, label: t('total_properties'), value: stats.totalProperties.toLocaleString(), style: CARD_STYLES.properties, change: `+${stats.newPropertiesThisMonth}` },
        { icon: Calendar, label: t('total_bookings'), value: stats.totalBookings.toLocaleString(), style: CARD_STYLES.bookings },
        { icon: DollarSign, label: t('total_revenue'), value: `${(stats.totalRevenue / 1000).toFixed(1)}K RWF`, style: CARD_STYLES.revenue },
    ] : []

    const handleExport = () => {
        exportCSV([
            { metric: 'Total Users', value: stats?.totalUsers },
            { metric: 'Total Properties', value: stats?.totalProperties },
            { metric: 'Total Bookings', value: stats?.totalBookings },
            { metric: 'Total Revenue (RWF)', value: stats?.totalRevenue },
            { metric: `New Users (${period})`, value: stats?.newUsersThisMonth },
            { metric: `New Properties (${period})`, value: stats?.newPropertiesThisMonth },
        ] as any, `platform-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`)
    }

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
                                {p === '7d' ? '7d' : p === '30d' ? '30d' : p === '90d' ? '90d' : '1y'}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> CSV</Button>
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
                                                {card.change} {t('new')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* User signups trend */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="h-4 w-4 text-blue-500" /> New User Signups
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={userTrend}>
                                        <defs>
                                            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#userGrad)" name="Users" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="h-4 w-4 text-emerald-500" /> Bookings Over Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={bookingTrend}>
                                        <defs>
                                            <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#bookGrad)" name="Bookings" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue & Role breakdown */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <DollarSign className="h-4 w-4 text-amber-500" /> Revenue (RWF)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {revenueTrend.length === 0 ? (
                                    <div className="flex h-48 items-center justify-center text-gray-400 text-sm">No revenue data for this period</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={revenueTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                                            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} RWF`, 'Revenue']} />
                                            <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4 text-purple-500" /> New Users by Role
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {roleBreakdown.length === 0 ? (
                                    <div className="flex h-48 items-center justify-center text-gray-400 text-sm">No data for this period</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={roleBreakdown} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                                            <YAxis type="category" dataKey="role" tick={{ fontSize: 11 }} width={80} />
                                            <Tooltip />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#8b5cf6" name="Users" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
