import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Activity, UserPlus, Building2, LogIn, Settings, Trash2, Shield, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface ActivityLog {
    id: string
    user_id: string
    action: string
    entity_type: string
    details: string | null
    created_at: string
    user?: { full_name: string; email: string }
}

const actionIcons: Record<string, typeof Activity> = {
    login: LogIn,
    register: UserPlus,
    property_created: Building2,
    property_deleted: Trash2,
    settings_changed: Settings,
    user_suspended: Shield,
}

const actionColors: Record<string, string> = {
    login: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    register: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    property_created: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
    property_deleted: 'bg-red-100 text-red-600 dark:bg-red-900/30',
    settings_changed: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
    user_suspended: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
}

function timeAgo(dateStr: string, t: (key: string) => string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ${t('ago')}`
    if (h > 0) return `${h}h ${t('ago')}`
    return `${m}m ${t('ago')}`
}

export function ActivityLogsPage() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<ActivityLog[]>([])

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*, user:profiles!user_id(full_name, email)')
                .order('created_at', { ascending: false })
                .limit(50)
            if (error) throw error
            setLogs((data || []) as unknown as ActivityLog[])
        } catch {
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('activity_logs')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('view_system_activity')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs}><RefreshCw className="h-4 w-4" /> {t('refresh')}</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6"><TableSkeleton rows={5} /></div>
                    ) : logs.length === 0 ? (
                        <EmptyState icon={Activity} title={t('no_activity_logs')} description={t('no_activity_logs_description')} />
                    ) : (
                        <div className="divide-y dark:divide-gray-700">
                            {logs.map(log => {
                                const IconComp = actionIcons[log.action] || Activity
                                const colorClass = actionColors[log.action] || 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                                return (
                                    <div key={log.id} className="flex items-start gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                                            <IconComp className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {log.user?.full_name || t('unknown')}
                                                </span>
                                                <Badge variant="secondary" className="text-xs capitalize">
                                                    {t(log.action)}
                                                </Badge>
                                            </div>
                                            {log.details && <p className="mt-0.5 text-sm text-gray-500">{log.details}</p>}
                                            <p className="mt-0.5 text-xs text-gray-400">{log.user?.email} • {timeAgo(log.created_at, t)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
