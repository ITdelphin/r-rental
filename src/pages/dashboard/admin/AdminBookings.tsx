import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Home, CheckCircle, XCircle, Clock, Eye, User, Search, Building2, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { createAuditLog } from '@/lib/audit'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'secondary' | 'default'; icon: typeof Clock }> = {
  pending: { label: 'pending', variant: 'warning', icon: Clock },
  approved: { label: 'approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'rejected', variant: 'danger', icon: XCircle },
  cancelled: { label: 'cancelled', variant: 'secondary', icon: XCircle },
  completed: { label: 'completed', variant: 'default', icon: CheckCircle },
}

const statusOptions = [
  { value: '', label: 'all' },
  { value: 'pending', label: 'pending' },
  { value: 'approved', label: 'approved' },
  { value: 'rejected', label: 'rejected' },
  { value: 'cancelled', label: 'cancelled' },
  { value: 'completed', label: 'completed' },
]

interface BookingWithAll {
  id: string
  property_id: string
  tenant_id: string
  owner_id: string
  status: string
  check_in: string | null
  check_out: string | null
  visit_date: string | null
  message: string | null
  reply_message: string | null
  created_at: string
  updated_at: string
  tenant?: Profile
  owner?: Profile
  property?: { title: string; district: string; province: string; price: number; images?: { url: string }[] }
}

export function AdminBookings() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingWithAll[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (user && profile) fetchBookings()
  }, [user, profile])

  const fetchBookings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, property:properties(title, district, province, price, images:property_images(url))')
        .order('created_at', { ascending: false })
      if (error) throw error
      const raw = (data || []) as unknown as BookingWithAll[]

      const profileIds = [...new Set(raw.flatMap(b => [b.tenant_id, b.owner_id]).filter(Boolean))]
      let profileMap: Record<string, Profile> = {}
      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', profileIds)
        if (profiles) {
          for (const p of profiles as unknown as Profile[]) {
            profileMap[p.id] = p
          }
        }
      }

      for (const b of raw) {
        b.tenant = profileMap[b.tenant_id] || null
        b.owner = profileMap[b.owner_id] || null
      }

      setBookings(raw)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string, tenantId?: string, propertyTitle?: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus } as never).eq('id', id)
      if (error) throw error
      const msgKey = newStatus === 'approved' ? 'booking_approved' : newStatus === 'rejected' ? 'booking_rejected' : 'status_updated'
      toast.success(t(msgKey))
      createAuditLog(`booking_${newStatus}`, 'booking', id, { property_title: propertyTitle })
      if (newStatus === 'approved' || newStatus === 'rejected' || newStatus === 'completed') {
        sendBookingNotification(id, newStatus)
      }
      if (tenantId) {
        await createNotification(
          tenantId,
          `Booking ${newStatus}`,
          `Your booking for "${propertyTitle || 'Property'}" has been ${newStatus}.`,
          newStatus === 'approved' ? 'success' : newStatus === 'completed' ? 'success' : 'error',
          { booking_id: id }
        )
      }
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } as BookingWithAll : b))
    } catch {
      toast.error(t('failed_to_update_status'))
    } finally { setProcessingId(null) }
  }

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false
    if (dateFrom && b.check_in && b.check_in < dateFrom) return false
    if (dateTo && b.check_out && b.check_out > dateTo) return false
    if (!search) return true
    const q = search.toLowerCase()
    const tenant = b.tenant
    const owner = b.owner
    const property = b.property as unknown as { title?: string } | undefined
    return (
      tenant?.full_name?.toLowerCase().includes(q) ||
      tenant?.email?.toLowerCase().includes(q) ||
      owner?.full_name?.toLowerCase().includes(q) ||
      property?.title?.toLowerCase().includes(q) ||
      b.id?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('all_bookings')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_all_bookings_description')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search_bookings')}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={statusOptions.map(o => ({ ...o, label: t(o.label) }))}
            placeholder={t('filter_by_status')}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            title={t('from_date')}
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            title={t('to_date')}
          />
        </div>
      </div>

      {loading ? (
        <ListSkeleton items={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={bookings.length === 0 ? t('no_bookings_yet') : t('no_bookings_found')}
          description={bookings.length === 0 ? t('no_bookings_description') : ''}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{filtered.length} {t('bookings')}</p>
          {filtered.map((booking) => {
            const config = statusConfig[booking.status] || statusConfig.pending
            const StatusIcon = config.icon
            const property = booking.property as unknown as { title: string; district: string; province: string; price: number; images?: { url: string }[] } | undefined
            const tenant = booking.tenant
            const owner = booking.owner
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        {property?.images?.[0]?.url ? (
                          <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-5 w-5" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{property?.title || t('unknown_property')}</h3>
                          <Badge variant={config.variant} className="flex items-center gap-1 capitalize shrink-0">
                            <StatusIcon className="h-3 w-3" /> {t(config.label)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {tenant?.full_name || t('unknown')}</span>
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {owner?.full_name || t('unknown')}</span>
                          {booking.check_in && booking.check_out && (
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</span>
                          )}
                          <span>{t('booked')} {new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                          {tenant?.email && <span>{tenant.email}</span>}
                          {tenant?.phone && <span>{tenant.phone}</span>}
                          {property?.price && <span className="font-medium text-primary-600">{formatPrice(property.price)}/mo</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {booking.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(booking.id, 'approved', booking.tenant_id, property?.title)} disabled={processingId === booking.id}>
                            <CheckCircle className="h-4 w-4 mr-1" /> {t('approve')}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateStatus(booking.id, 'rejected', booking.tenant_id, property?.title)} disabled={processingId === booking.id}>
                            <XCircle className="h-4 w-4 mr-1" /> {t('reject')}
                          </Button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, 'completed', booking.tenant_id, property?.title)} disabled={processingId === booking.id}>
                          <CheckCheck className="h-4 w-4 mr-1" /> {t('mark_completed')}
                        </Button>
                      )}
                      <Link to={`/properties/${booking.property_id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </Link>
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
