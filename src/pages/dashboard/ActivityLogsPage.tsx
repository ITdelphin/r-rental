import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Activity, UserPlus, Building2, LogIn, Settings, Trash2, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ActivityLog {
    id: string
    user_id: string
    action: string
    resource: string
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

// Fallback mock data if table doesn't exist yet
const mockLogs: ActivityLog[] = [
    { id: '1', user_id: 'u1', action: 'login', resource: 'auth', details: 'User logged in from Kigali', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), user: { full_name: 'Alice Mutesi', email: 'alice@email.com' } },
    { id: '2', user_id: 'u2', action: 'property_created', resource: 'properties', details: 'Listed: Modern Apartment in Kicukiro', created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), user: { full_name: 'Jean-Pierre K.', email: 'jp@email.com' } },
    { id: '3', user_id: 'u3', action: 'register', resource: 'auth', details: 'New tenant registered', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), user: { full_name: 'Patrick Habimana', email: 'patrick@email.com' } },
    { id: '4', user_id: 'u4', action: 'property_deleted', resource: 'properties', details: 'Removed listing: Studio in Kimihurura', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), user: { full_name: 'Grace Mugabo', email: 'grace@email.com' } },
    { id: '5', user_id: 'u5', action: 'settings_changed', resource: 'settings', details: 'Updated platform notification settings', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), user: { full_name: 'Admin User', email: 'admin@email.com' } },
]

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    return `${m}m ago`
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
            setLogs(mockLogs)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('activity_logs')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('view_system_activity')}</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6"><TableSkeleton rows={5} /></div>
                    ) : logs.length === 0 ? (
                        <EmptyState icon={Activity} title="No activity logs" description="System activity will appear here." />
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
                                                    {log.user?.full_name || 'Unknown'}
                                                </span>
                                                <Badge variant="secondary" className="text-xs capitalize">
                                                    {log.action.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                            {log.details && <p className="mt-0.5 text-sm text-gray-500">{log.details}</p>}
                                            <p className="mt-0.5 text-xs text-gray-400">{log.user?.email} • {timeAgo(log.created_at)}</p>
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
