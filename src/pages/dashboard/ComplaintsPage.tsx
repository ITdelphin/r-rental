import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Shield, Search, MessageSquare, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { sendComplaintNotification } from '@/lib/email'
import toast from 'react-hot-toast'

interface Complaint {
    id: string
    user_id: string
    subject: string
    description: string
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    created_at: string
    user?: { full_name: string; email: string }
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'default' | 'success' | 'secondary'; icon: typeof Clock }> = {
    open: { label: 'Open', variant: 'warning', icon: AlertTriangle },
    in_progress: { label: 'In Progress', variant: 'default', icon: Clock },
    resolved: { label: 'Resolved', variant: 'success', icon: CheckCircle },
    closed: { label: 'Closed', variant: 'secondary', icon: XCircle },
}

export function ComplaintsPage() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*, user:profiles!user_id(full_name, email)')
                .order('created_at', { ascending: false })
            if (error) throw error
            setComplaints((data || []) as unknown as Complaint[])
        } catch {
            // fallback to empty
            setComplaints([])
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase.from('complaints').update({ status } as never).eq('id', id)
            if (error) throw error
            toast.success('Status updated')
            sendComplaintNotification(id, status)
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: status as Complaint['status'] } : c))
        } catch {
            toast.error('Failed to update status')
        }
    }

    const filtered = complaints.filter(c =>
        !search || c.subject.toLowerCase().includes(search.toLowerCase()) ||
        c.user?.full_name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('complaints')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_complaints')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {complaints.filter(c => c.status === 'open').length} {t('open')}
                    </span>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('search_complaints') || 'Search complaints...'}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
            </div>

            {loading ? (
                <TableSkeleton rows={5} />
            ) : filtered.length === 0 ? (
                <EmptyState icon={Shield} title={t('no_complaints')} description={t('no_complaints_description')} />
            ) : (
                <div className="space-y-4">
                    {filtered.map(complaint => {
                        const config = statusConfig[complaint.status] || statusConfig.open
                        const StatusIcon = config.icon
                        return (
                            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{complaint.subject}</h3>
                                                    <Badge variant={config.variant} className="flex items-center gap-1">
                                                        <StatusIcon className="h-3 w-3" />
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{complaint.user?.full_name} • {complaint.user?.email}</p>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{complaint.description}</p>
                                                <p className="mt-1 text-xs text-gray-400">{new Date(complaint.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-start">
                                            {complaint.status === 'open' && (
                                                <Button size="sm" variant="outline" onClick={() => updateStatus(complaint.id, 'in_progress')}>
                                                    In Progress
                                                </Button>
                                            )}
                                            {(complaint.status === 'open' || complaint.status === 'in_progress') && (
                                                <Button size="sm" onClick={() => updateStatus(complaint.id, 'resolved')}>
                                                    Resolve
                                                </Button>
                                            )}
                                            {complaint.status === 'resolved' && (
                                                <Button size="sm" variant="secondary" onClick={() => updateStatus(complaint.id, 'closed')}>
                                                    Close
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
