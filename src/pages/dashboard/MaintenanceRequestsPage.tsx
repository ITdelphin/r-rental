import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Wrench, Search, Plus, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface MaintenanceRequest {
    id: string
    property_id: string
    tenant_id: string
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    created_at: string
    updated_at: string
    property?: { title: string; district: string; province: string }
    tenant?: { full_name: string; email: string }
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'default' | 'success' | 'secondary'; icon: typeof Clock }> = {
    open: { label: 'open', variant: 'warning', icon: AlertTriangle },
    in_progress: { label: 'in_progress', variant: 'default', icon: Clock },
    resolved: { label: 'resolved', variant: 'success', icon: CheckCircle },
    closed: { label: 'closed', variant: 'secondary', icon: XCircle },
}

const priorityConfig: Record<string, { label: string; variant: 'secondary' | 'warning' | 'default' | 'danger' }> = {
    low: { label: 'low', variant: 'secondary' },
    medium: { label: 'medium', variant: 'warning' },
    high: { label: 'high', variant: 'default' },
    urgent: { label: 'urgent', variant: 'danger' },
}

export function MaintenanceRequestsPage() {
    const { t } = useTranslation()
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [search, setSearch] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // New Request Form fields
    const [properties, setProperties] = useState<{ id: string; title: string }[]>([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

    useEffect(() => {
        if (user) {
            fetchRequests()
            if (profile?.role === 'tenant') {
                fetchRentedProperties()
            }
        }
    }, [user, profile])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('maintenance_requests')
                .select('*, property:properties(title, district, province), tenant:profiles!tenant_id(full_name, email)')
                .order('created_at', { ascending: false })

            if (profile?.role === 'tenant') {
                query = query.eq('tenant_id', user!.id)
            } else if (profile?.role === 'owner' || profile?.role === 'agent') {
                // Query requests for properties owned by this user
                const { data: ownProps } = await supabase.from('properties').select('id').eq('owner_id', user!.id)
                const propIds = ((ownProps || []) as any[]).map(p => p.id)
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
    }

    const fetchRentedProperties = async () => {
        try {
            // Find properties from tenant's approved/completed bookings
            const { data, error } = await supabase
                .from('bookings')
                .select('property:properties(id, title)')
                .eq('tenant_id', user!.id)
                .in('status', ['approved', 'completed'])
            if (error) throw error

            const uniqueProps = new Map<string, string>()
            data?.forEach((b: any) => {
                if (b.property) {
                    uniqueProps.set(b.property.id, b.property.title)
                }
            })
            setProperties(Array.from(uniqueProps.entries()).map(([id, title]) => ({ id, title })))
        } catch (err) {
            console.error('Failed to load rented properties:', err)
        }
    }

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
                status: 'open',
            } as never)

            if (error) throw error
            toast.success(t('maintenance_request_created'))
            setIsCreateOpen(false)
            setTitle('')
            setDescription('')
            fetchRequests()
        } catch {
            toast.error(t('failed_to_create_request'))
        } finally {
            setSubmitting(false)
        }
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
        } catch {
            toast.error(t('failed_to_update_status'))
        }
    }

    const filtered = requests.filter(r =>
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.property?.title.toLowerCase().includes(search.toLowerCase())
    )

    const isTenant = profile?.role === 'tenant'
    const isOwner = profile?.role === 'owner' || profile?.role === 'agent'
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('maintenance_requests')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_maintenance_desc')}</p>
                </div>

                {isTenant && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="cursor-pointer">
                                <Plus className="h-4 w-4 mr-1" /> {t('new_request')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t('new_maintenance_request')}</DialogTitle>
                                <DialogDescription>{t('maintenance_request_help')}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('property')}</label>
                                    <select
                                        value={selectedProperty}
                                        onChange={e => setSelectedProperty(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                    >
                                        <option value="">{t('select_property')}</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder={t('maintenance_title_placeholder')}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('priority')}</label>
                                    <select
                                        value={priority}
                                        onChange={e => setPriority(e.target.value as any)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                    >
                                        <option value="low">{t('low')}</option>
                                        <option value="medium">{t('medium')}</option>
                                        <option value="high">{t('high')}</option>
                                        <option value="urgent">{t('urgent')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder={t('maintenance_desc_placeholder')}
                                        rows={4}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>{t('cancel')}</Button>
                                    <Button type="submit" disabled={submitting}>{submitting ? t('submitting') : t('submit')}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('search_requests')}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
            </div>

            {loading ? (
                <TableSkeleton rows={3} />
            ) : filtered.length === 0 ? (
                <EmptyState icon={Wrench} title={t('no_requests')} description={t('no_requests_description')} />
            ) : (
                <div className="space-y-4">
                    {filtered.map(req => {
                        const config = statusConfig[req.status] || statusConfig.open
                        const StatusIcon = config.icon
                        const prio = priorityConfig[req.priority] || priorityConfig.medium
                        return (
                            <Card key={req.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20">
                                                <Wrench className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-gray-950 dark:text-gray-50">{req.title}</h3>
                                                    <Badge variant={config.variant} className="flex items-center gap-1">
                                                        <StatusIcon className="h-3 w-3" />
                                                        {t(config.label)}
                                                    </Badge>
                                                    <Badge variant={prio.variant as any}>
                                                        {t(prio.label)}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500 font-medium">
                                                    {req.property?.title} • {req.property?.district}, {req.property?.province}
                                                </p>
                                                {isOwner || isAdmin ? (
                                                    <p className="text-xs text-gray-400 mt-0.5">{t('submitted_by')}: {req.tenant?.full_name}</p>
                                                ) : null}
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{req.description}</p>
                                                <p className="mt-2 text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Request Status Updates */}
                                        {(isOwner || isAdmin || (isTenant && req.status === 'open')) && (
                                            <div className="flex items-center gap-2 self-end sm:self-start">
                                                {(isOwner || isAdmin) && req.status === 'open' && (
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'in_progress')}>
                                                        {t('in_progress')}
                                                    </Button>
                                                )}
                                                {(isOwner || isAdmin) && (req.status === 'open' || req.status === 'in_progress') && (
                                                    <Button size="sm" onClick={() => updateStatus(req.id, 'resolved')}>
                                                        {t('resolve')}
                                                    </Button>
                                                )}
                                                {req.status === 'resolved' && (
                                                    <Button size="sm" variant="secondary" onClick={() => updateStatus(req.id, 'closed')}>
                                                        {t('close')}
                                                    </Button>
                                                )}
                                                {isTenant && req.status === 'open' && (
                                                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => updateStatus(req.id, 'closed')}>
                                                        {t('cancel')}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
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
