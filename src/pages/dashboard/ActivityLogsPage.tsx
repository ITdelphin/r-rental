import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Activity, UserPlus, Building2, LogIn, Settings, Trash2, Shield, RefreshCw, Filter, Clock, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ActivityLog {
    id: string
    user_id: string
    action: string
    entity_type: string
    details: Record<string, unknown> | string | null
    created_at: string
    user?: { full_name: string; email: string; avatar_url?: string | null } | null
}

const ACTION_CONFIG: Record<string, { icon: typeof Activity; color: string; label: string }> = {
    login: { icon: LogIn, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800', label: 'login' },
    register: { icon: UserPlus, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800', label: 'register' },
    property_created: { icon: Building2, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-800', label: 'property_created' },
    property_updated: { icon: Building2, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800', label: 'property_updated' },
    property_deleted: { icon: Trash2, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800', label: 'property_deleted' },
    settings_changed: { icon: Settings, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800', label: 'settings_changed' },
    user_suspended: { icon: Shield, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800', label: 'user_suspended' },
    user_reinstated: { icon: UserCheck, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-800', label: 'user_reinstated' },
    user_verified: { icon: Shield, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800', label: 'user_verified' },
    role_changed: { icon: RefreshCw, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 ring-1 ring-cyan-200 dark:ring-cyan-800', label: 'role_changed' },
    user_deleted: { icon: Trash2, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800', label: 'user_deleted' },
    review_created: { icon: Activity, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 ring-1 ring-pink-200 dark:ring-pink-800', label: 'review_created' },
}

const ALL_ACTIONS = Object.keys(ACTION_CONFIG)

function timeAgo(dateStr: string, t: (key: string) => string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ${t('ago')}`
    if (h > 0) return `${h}h ${t('ago')}`
    return `${m}m ${t('ago')}`
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ActivityLogsPage() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [actionFilter, setActionFilter] = useState<string | null>(null)
    const pageRef = useRef(0)
    const [hasMore, setHasMore] = useState(true)
    const PAGE_SIZE = 20

    const fetchLogs = useCallback(async (reset = false) => {
        setLoading(true)
        const currentPage = reset ? 0 : pageRef.current
        try {
            let query = supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

            if (actionFilter) {
                query = query.eq('action', actionFilter)
            }

            const { data, error } = await query
            if (error) {
                console.error("Fetch audit_logs error:", error)
                throw error
            }

            let result = (data || []) as unknown as ActivityLog[]

            // Manual profile fetch to prevent relation join errors
            if (result.length > 0) {
                const userIds = [...new Set(result.map(log => log.user_id).filter(Boolean))]
                if (userIds.length > 0) {
                    const { data: profiles, error: profileErr } = await supabase
                        .from('profiles')
                        .select('user_id, full_name, email, avatar_url')
                        .in('user_id', userIds)

                    if (!profileErr && profiles) {
                        const profileMap = new Map()
                        profiles.forEach((p: any) => profileMap.set(p.user_id, p))
                        result = result.map(log => ({
                            ...log,
                            user: profileMap.get(log.user_id) || null
                        }))
                    }
                }
            }

            setLogs(reset ? result : prev => [...prev, ...result])
            setHasMore(result.length === PAGE_SIZE)
        } catch (err) {
            toast.error(t('failed_to_load_logs'))
            if (reset) setLogs([])
        } finally {
            setLoading(false)
        }
    }, [actionFilter, t])

    useEffect(() => {
        pageRef.current = 0
        fetchLogs(true)
    }, [fetchLogs])

    const loadMore = () => {
        pageRef.current += 1
        fetchLogs(false)
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{t('activity_logs')}</h1>
                        <p className="mt-1.5 text-gray-300 text-sm">{t('view_system_activity')}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => fetchLogs(true)} className="bg-white/10 text-white hover:bg-white/20 border-0">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('refresh')}
                    </Button>
                </div>
            </div>

            {/* Action Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <button
                    onClick={() => setActionFilter(null)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${!actionFilter
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                >
                    {t('all')}
                </button>
                {ALL_ACTIONS.map(action => {
                    const config = ACTION_CONFIG[action]
                    return (
                        <button
                            key={action}
                            onClick={() => setActionFilter(actionFilter === action ? null : action)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${actionFilter === action
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            {t(config.label)}
                        </button>
                    )
                })}
            </div>

            {/* Timeline */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                <CardContent className="p-0">
                    {loading && logs.length === 0 ? (
                        <div className="p-6"><TableSkeleton rows={5} /></div>
                    ) : logs.length === 0 ? (
                        <EmptyState icon={Activity} title={t('no_activity_logs')} description={t('no_activity_logs_description')} />
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500 via-gray-200 to-gray-100 dark:via-gray-700 dark:to-gray-800" />

                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {logs.map((log, idx) => {
                                    const config = ACTION_CONFIG[log.action] || { icon: Activity, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700', label: log.action }
                                    const IconComp = config.icon
                                    const isFirst = idx === 0
                                    return (
                                        <div key={log.id} className="relative flex items-start gap-5 px-4 py-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                            {/* Timeline dot */}
                                            <div className="relative z-10 shrink-0">
                                                <Avatar className="h-10 w-10 rounded-xl">
                                                    <AvatarImage src={log.user?.avatar_url || undefined} alt={log.user?.full_name || ''} />
                                                    <AvatarFallback className={`rounded-xl ${config.color}`}>
                                                        <IconComp className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {log.user?.full_name || t('unknown')}
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                                                        {t(config.label)}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400 ml-auto flex items-center gap-1 shrink-0">
                                                        <Clock className="h-3 w-3" />
                                                        {timeAgo(log.created_at, t)}
                                                    </span>
                                                </div>
                                                {log.details && (
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 inline-block">
                                                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-gray-400">{log.user?.email} &middot; {formatDate(log.created_at)}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Load More */}
            {!loading && hasMore && logs.length > 0 && (
                <div className="flex justify-center">
                    <Button variant="outline" onClick={loadMore} className="rounded-xl px-8">
                        {t('load_more')}
                    </Button>
                </div>
            )}
        </div>
    )
}
