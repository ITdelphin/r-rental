import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
    Wrench, Search, Plus, AlertTriangle, Clock, CheckCircle,
    XCircle, Eye, UserCheck, BadgeCheck, MessageSquare, Send,
    Paperclip, ChevronDown, ChevronUp, X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface MaintenanceRequest {
    id: string
    property_id: string
    tenant_id: string
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'submitted' | 'acknowledged' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'closed'
    created_at: string
    updated_at: string
    property?: { title: string; district: string; province: string }
    tenant?: { full_name: string; email: string }
}

interface MaintenanceComment {
    id: string
    request_id: string
    author_id: string
    comment: string
    created_at: string
    author?: { full_name: string; avatar_url?: string }
}

/* ─── Config ─────────────────────────────────────────────────────────────── */
const statusConfig: Record<string, {
    label: string
    variant: 'warning' | 'default' | 'success' | 'secondary'
    icon: typeof Clock
    color: string
}> = {
    submitted: { label: 'submitted', variant: 'warning', icon: AlertTriangle, color: 'text-amber-500' },
    acknowledged: { label: 'acknowledged', variant: 'default', icon: Eye, color: 'text-blue-500' },
    assigned: { label: 'assigned', variant: 'default', icon: UserCheck, color: 'text-indigo-500' },
    in_progress: { label: 'in_progress', variant: 'default', icon: Clock, color: 'text-purple-500' },
    completed: { label: 'completed', variant: 'success', icon: CheckCircle, color: 'text-green-500' },
    verified: { label: 'verified', variant: 'success', icon: BadgeCheck, color: 'text-emerald-500' },
    closed: { label: 'closed', variant: 'secondary', icon: XCircle, color: 'text-gray-400' },
}

const NEXT_STATUSES: Record<string, string> = {
    submitted: 'acknowledged',
    acknowledged: 'assigned',
    assigned: 'in_progress',
    in_progress: 'completed',
    completed: 'verified',
    verified: 'closed',
}

const priorityConfig: Record<string, { label: string; variant: 'secondary' | 'warning' | 'default' | 'danger'; dot: string }> = {
    low: { label: 'low', variant: 'secondary', dot: 'bg-gray-400' },
    medium: { label: 'medium', variant: 'warning', dot: 'bg-amber-400' },
    high: { label: 'high', variant: 'default', dot: 'bg-orange-500' },
    urgent: { label: 'urgent', variant: 'danger', dot: 'bg-red-500' },
}

const STATUS_TABS = ['all', 'submitted', 'in_progress', 'completed', 'closed'] as const

/* ─── Comment Panel ──────────────────────────────────────────────────────── */
function CommentPanel({ requestId, currentUserId }: { requestId: string; currentUserId: string }) {
    const { t, i18n } = useTranslation()
    const [comments, setComments] = useState<MaintenanceComment[]>([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    const fetchComments = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('maintenance_comments')
            .select('*, author:profiles!author_id(full_name, avatar_url)')
            .eq('request_id', requestId)
            .order('created_at', { ascending: true })
        setComments((data || []) as unknown as MaintenanceComment[])
        setLoading(false)
    }, [requestId])

    useEffect(() => { fetchComments() }, [fetchComments])
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [comments])

    /* subscribe to real-time updates */
    useEffect(() => {
        const ch = supabase
            .channel(`maint-comments-${requestId}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public',
                table: 'maintenance_comments',
                filter: `request_id=eq.${requestId}`,
            }, () => fetchComments())
            .subscribe()
        return () => { supabase.removeChannel(ch) }
    }, [requestId, fetchComments])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim()) return
        setSending(true)
        try {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', currentUserId)
                .single()

            const { error } = await supabase.from('maintenance_comments').insert({
                request_id: requestId,
                author_id: profileData?.id,
                comment: text.trim(),
            } as never)
            if (error) throw error
            setText('')
        } catch {
            toast.error(t('message_send_failed'))
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[120px] max-h-64">
                {loading ? (
                    <p className="text-xs text-gray-400 text-center pt-4">{t('loading')}</p>
                ) : comments.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center pt-4">{t('no_comments_yet', 'No comments yet — be the first to add one.')}</p>
                ) : comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 overflow-hidden">
                            {c.author?.avatar_url
                                ? <img src={c.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                : (c.author?.full_name?.[0] ?? '?')}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.author?.full_name ?? t('anonymous')}</span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(c.created_at).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-0.5 leading-snug">{c.comment}</p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={t('add_comment', 'Add a comment...')}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <Button type="submit" size="sm" disabled={sending || !text.trim()} className="shrink-0">
                    <Send className="h-3.5 w-3.5" />
                </Button>
            </form>
        </div>
    )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export function MaintenanceRequestsPage() {
    const { t, i18n } = useTranslation()
    const { user, profile } = useAuth()

    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState<string>('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // New request form state
    const [properties, setProperties] = useState<{ id: string; title: string }[]>([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

    /* ── Data fetching ──────────────────────────────────────────────────── */
    const fetchRequests = useCallback(async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('maintenance_requests')
                .select('*, property:properties(title, district, province), tenant:profiles!tenant_id(full_name, email)')
                .order('created_at', { ascending: false })

            if (profile?.role === 'tenant') {
                query = query.eq('tenant_id', user!.id)
            } else if (profile?.role === 'owner' || profile?.role === 'agent') {
                const { data: ownProps } = await supabase.from('properties').select('id').eq('owner_id', user!.id)
                const propIds = ((ownProps || []) as any[]).map(p => p.id)
                if (propIds.length === 0) { setRequests([]); setLoading(false); return }
                query = query.in('property_id', propIds)
            }

            const { data, error } = await query
            if (error) throw error
            setRequests((data || []) as unknown as MaintenanceRequest[])
        } catch (err) {
            console.error(err)
            setRequests([])
        } finally {
            setLoading(false)
        }
    }, [user, profile])

    const fetchRentedProperties = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('bookings')
                .select('property:properties(id, title)')
                .eq('tenant_id', user!.id)
                .in('status', ['approved', 'completed'])
            const uniqueProps = new Map<string, string>()
            data?.forEach((b: any) => { if (b.property) uniqueProps.set(b.property.id, b.property.title) })
            setProperties(Array.from(uniqueProps.entries()).map(([id, title]) => ({ id, title })))
        } catch (err) { console.error('Failed to load rented properties:', err) }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchRequests()
            if (profile?.role === 'tenant') fetchRentedProperties()
        }
    }, [fetchRequests, fetchRentedProperties, user, profile])

    /* ── Actions ────────────────────────────────────────────────────────── */
    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProperty || !title.trim() || !description.trim()) {
            toast.error(t('please_fill_all_fields'))
            return
        }
        setSubmitting(true)
        try {
            const { error } = await supabase.from('maintenance_requests').insert({
                property_id: selectedProperty,
                tenant_id: user!.id,
                title,
                description,
                priority,
                status: 'submitted',
            } as never)
            if (error) throw error
            toast.success(t('maintenance_request_created'))
            setIsCreateOpen(false)
            setTitle(''); setDescription(''); setSelectedProperty(''); setPriority('medium')
            fetchRequests()
        } catch { toast.error(t('failed_to_create_request')) }
        finally { setSubmitting(false) }
    }

    const updateStatus = async (id: string, status: MaintenanceRequest['status']) => {
        try {
            const { error } = await supabase
                .from('maintenance_requests')
                .update({ status } as never)
                .eq('id', id)
            if (error) throw error
            toast.success(t('status_updated'))
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
        } catch { toast.error(t('failed_to_update_status')) }
    }

    /* ── Derived data ───────────────────────────────────────────────────── */
    const isTenant = profile?.role === 'tenant'
    const isOwner = profile?.role === 'owner' || profile?.role === 'agent'
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    const filtered = requests.filter(r => {
        const matchSearch = !search ||
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.property?.title.toLowerCase().includes(search.toLowerCase()) ||
            r.tenant?.full_name?.toLowerCase().includes(search.toLowerCase())
        const matchTab = activeTab === 'all' || r.status === activeTab ||
            (activeTab === 'in_progress' && ['acknowledged', 'assigned', 'in_progress'].includes(r.status))
        return matchSearch && matchTab
    })

    // Stats
    const stats = {
        total: requests.length,
        open: requests.filter(r => ['submitted', 'acknowledged', 'assigned', 'in_progress'].includes(r.status)).length,
        completed: requests.filter(r => ['completed', 'verified'].includes(r.status)).length,
        closed: requests.filter(r => r.status === 'closed').length,
    }

    /* ── Render ─────────────────────────────────────────────────────────── */
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {t('maintenance_requests')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('manage_maintenance_desc')}
                    </p>
                </div>

                {isTenant && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="cursor-pointer shrink-0">
                                <Plus className="h-4 w-4 mr-1.5" />
                                {t('new_request')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t('new_maintenance_request')}</DialogTitle>
                                <DialogDescription>{t('maintenance_request_help')}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
                                {/* Property */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('property')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedProperty}
                                        onChange={e => setSelectedProperty(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    >
                                        <option value="">{t('select_property')}</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                    {properties.length === 0 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            {t('no_rented_properties', 'No active rentals found. You must have an approved booking to submit a request.')}
                                        </p>
                                    )}
                                </div>
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('title')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder={t('maintenance_title_placeholder')}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    />
                                </div>
                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('priority')}
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`rounded-lg border-2 px-2 py-1.5 text-xs font-medium transition-all ${priority === p
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                                                    }`}
                                            >
                                                <span className={`inline-block h-2 w-2 rounded-full mr-1 ${priorityConfig[p].dot}`} />
                                                {t(p)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('description')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder={t('maintenance_desc_placeholder')}
                                        rows={4}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                                    />
                                </div>
                                <DialogFooter className="pt-2 gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        {t('cancel')}
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? t('submitting') : t('submit')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Stats row */}
            {!loading && requests.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: t('total'), value: stats.total, color: 'from-blue-500 to-indigo-600' },
                        { label: t('open'), value: stats.open, color: 'from-amber-500 to-orange-500' },
                        { label: t('completed'), value: stats.completed, color: 'from-emerald-500 to-green-600' },
                        { label: t('closed'), value: stats.closed, color: 'from-gray-400 to-gray-500' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
                            <p className={`mt-1 text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('search_requests')}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Status tabs */}
                <div className="flex items-center gap-1 flex-wrap">
                    {STATUS_TABS.map(tab => {
                        const count = tab === 'all'
                            ? requests.length
                            : tab === 'in_progress'
                                ? requests.filter(r => ['acknowledged', 'assigned', 'in_progress'].includes(r.status)).length
                                : requests.filter(r => r.status === tab).length
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeTab === tab
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                                    }`}
                            >
                                {t(tab)} {count > 0 && <span className="ml-1 opacity-75">({count})</span>}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <TableSkeleton rows={3} />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Wrench}
                    title={t('no_requests')}
                    description={t('no_requests_description')}
                />
            ) : (
                <div className="space-y-4">
                    {filtered.map(req => {
                        const cfg = statusConfig[req.status] || statusConfig.submitted
                        const StatusIcon = cfg.icon
                        const prio = priorityConfig[req.priority] || priorityConfig.medium
                        const isExpanded = expandedId === req.id
                        const nextStatus = NEXT_STATUSES[req.status]

                        return (
                            <Card key={req.id} className={`transition-shadow hover:shadow-md ${isExpanded ? 'ring-1 ring-primary-300 dark:ring-primary-700' : ''}`}>
                                <CardContent className="p-0">
                                    {/* Main row */}
                                    <div className="p-4 sm:p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                {/* Icon */}
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.color.replace('text-', 'bg-').replace('-500', '-50').replace('-400', '-50')} dark:bg-gray-700`}>
                                                    <Wrench className={`h-5 w-5 ${cfg.color}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    {/* Title + badges */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-50 leading-tight">{req.title}</h3>
                                                        <Badge variant={cfg.variant} className="flex items-center gap-1 shrink-0">
                                                            <StatusIcon className="h-3 w-3" />
                                                            {t(cfg.label)}
                                                        </Badge>
                                                        <Badge variant={prio.variant as any} className="flex items-center gap-1 shrink-0">
                                                            <span className={`h-2 w-2 rounded-full ${prio.dot}`} />
                                                            {t(prio.label)}
                                                        </Badge>
                                                    </div>
                                                    {/* Property */}
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        {req.property?.title}
                                                        {req.property?.district && <> &bull; {req.property.district}, {req.property.province}</>}
                                                    </p>
                                                    {(isOwner || isAdmin) && req.tenant?.full_name && (
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {t('submitted_by')}: <span className="font-medium">{req.tenant.full_name}</span>
                                                        </p>
                                                    )}
                                                    {/* Description */}
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-2">
                                                        {req.description}
                                                    </p>
                                                    {/* Date */}
                                                    <p className="mt-2 text-xs text-gray-400">
                                                        {new Date(req.created_at).toLocaleDateString(i18n.language, { dateStyle: 'medium' })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap items-center gap-2 self-end sm:self-start shrink-0">
                                                {/* Owner/Admin: advance status */}
                                                {(isOwner || isAdmin) && req.status !== 'closed' && nextStatus && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateStatus(req.id, nextStatus as MaintenanceRequest['status'])}
                                                        className="text-xs"
                                                    >
                                                        {t(nextStatus)}
                                                    </Button>
                                                )}
                                                {/* Tenant: cancel when still submitted */}
                                                {isTenant && req.status === 'submitted' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-500 hover:text-red-600 text-xs"
                                                        onClick={() => updateStatus(req.id, 'closed')}
                                                    >
                                                        {t('cancel')}
                                                    </Button>
                                                )}
                                                {/* Comments toggle */}
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                                    className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    {isExpanded
                                                        ? <><ChevronUp className="h-3 w-3" /> {t('hide', 'Hide')}</>
                                                        : <><ChevronDown className="h-3 w-3" /> {t('comments', 'Comments')}</>
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* === Progress Timeline === */}
                                    <div className="px-4 sm:px-5 pb-3 overflow-x-auto">
                                        <div className="flex items-center gap-0 min-w-max">
                                            {Object.keys(statusConfig).map((s, idx, arr) => {
                                                const allStatuses = Object.keys(statusConfig)
                                                const reqIdx = allStatuses.indexOf(req.status)
                                                const stepIdx = allStatuses.indexOf(s)
                                                const done = stepIdx <= reqIdx
                                                const current = s === req.status
                                                const Icon = statusConfig[s].icon
                                                return (
                                                    <div key={s} className="flex items-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center ring-2 transition-all ${current
                                                                    ? 'ring-primary-500 bg-primary-500 text-white'
                                                                    : done
                                                                        ? 'ring-green-400 bg-green-400 text-white'
                                                                        : 'ring-gray-200 dark:ring-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600'
                                                                }`}>
                                                                <Icon className="h-3 w-3" />
                                                            </div>
                                                            <span className={`text-[9px] font-medium whitespace-nowrap ${current ? 'text-primary-600 dark:text-primary-400' : done ? 'text-green-500' : 'text-gray-400'
                                                                }`}>
                                                                {t(s)}
                                                            </span>
                                                        </div>
                                                        {idx < arr.length - 1 && (
                                                            <div className={`h-0.5 w-6 sm:w-8 mx-0.5 transition-all ${stepIdx < reqIdx ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-200 dark:bg-gray-700'
                                                                }`} />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* === Comment Panel === */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Paperclip className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('discussion', 'Discussion')}</span>
                                            </div>
                                            <CommentPanel requestId={req.id} currentUserId={user!.id} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
