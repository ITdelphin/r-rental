import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Home, CheckCircle, XCircle, Clock, Eye, User, Phone, Mail, Sparkles, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
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

const NEW_BOOKING_HOURS = 48

function isNewBooking(createdAt: string): boolean {
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < NEW_BOOKING_HOURS * 60 * 60 * 1000
}

interface BookingWithRelations {
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
  property?: { title: string; district: string; province: string; price: number; images?: { url: string }[] }
}

interface PropertyGroup {
  title: string
  propertyId: string
  bookings: BookingWithRelations[]
}

export function OwnerBookings() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<PropertyGroup[]>([])
  const [respondTarget, setRespondTarget] = useState<BookingWithRelations | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedProps, setExpandedProps] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user && profile) fetchBookings()
  }, [user, profile])

  const fetchBookings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, property:properties(title, district, province, price, images:property_images(url)), tenant:profiles!tenant_id(full_name, email, phone, avatar_url)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      const raw = (data || []) as unknown as BookingWithRelations[]

      const grouped: Record<string, PropertyGroup> = {}
      for (const b of raw) {
        const title = b.property?.title || t('unknown_property')
        if (!grouped[title]) {
          grouped[title] = { title, propertyId: b.property_id, bookings: [] }
        }
        grouped[title].bookings.push(b)
      }
      const result = Object.values(grouped)
      setGroups(result)
      if (result.length > 0) setExpandedProps(new Set([result[0].title]))
    } catch {
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id)
    try {
      const { error } = await supabase.from('bookings').update({ status, reply_message: replyMessage || null } as never).eq('id', id)
      if (error) throw error
      toast.success(status === 'approved' ? t('booking_approved') : t('booking_rejected'))
      sendBookingNotification(id, status)
      const allBookings = groups.flatMap(g => g.bookings)
      const booking = allBookings.find(b => b.id === id)
      if (booking?.tenant_id) {
        const title = booking.property?.title || 'Property'
        await createNotification(
          booking.tenant_id,
          `Booking ${status}`,
          `Your booking for "${title}" has been ${status}.${replyMessage ? ` Owner says: "${replyMessage}"` : ''}`,
          status === 'approved' ? 'success' : 'error',
          { booking_id: id }
        )
      }
      setGroups(prev => prev.map(g => ({
        ...g,
        bookings: g.bookings.map(b => b.id === id ? { ...b, status, reply_message: replyMessage || null } as BookingWithRelations : b)
      })))
      setRespondTarget(null)
      setReplyMessage('')
    } catch {
      toast.error(status === 'approved' ? t('failed_to_approve_booking') : t('failed_to_reject_booking'))
    } finally { setProcessingId(null) }
  }

  const allBookings = groups.flatMap(g => g.bookings)
  const pendingCount = allBookings.filter(b => b.status === 'pending').length
  const approvedCount = allBookings.filter(b => b.status === 'approved').length
  const newCount = allBookings.filter(b => isNewBooking(b.created_at)).length

  const toggleExpand = (title: string) => {
    setExpandedProps(prev => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('booking_requests')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('people_who_booked_your_properties')}</p>
      </div>

      {!loading && allBookings.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('pending'), count: pendingCount, variant: 'warning' as const, icon: Clock },
            { label: t('approved'), count: approvedCount, variant: 'success' as const, icon: CheckCircle },
            { label: t('new_requests'), count: newCount, variant: 'default' as const, icon: Sparkles },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  item.variant === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  item.variant === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.count}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <ListSkeleton items={3} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('no_bookings_yet')}
          description={t('no_bookings_description')}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.propertyId}>
              <button
                onClick={() => toggleExpand(group.title)}
                className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{group.title}</h3>
                    <p className="text-xs text-gray-500">
                      {group.bookings.length} {group.bookings.length === 1 ? t('booking') : t('bookings')}
                      {' · '}
                      {group.bookings.filter(b => b.status === 'pending').length} {t('pending')}
                    </p>
                  </div>
                </div>
                {expandedProps.has(group.title) ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>

              {expandedProps.has(group.title) && (
                <div className="border-t dark:border-gray-700 divide-y dark:divide-gray-700">
                  {group.bookings.map((booking) => {
                    const config = statusConfig[booking.status] || statusConfig.pending
                    const StatusIcon = config.icon
                    const tenant = booking.tenant
                    return (
                      <div key={booking.id} className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant={config.variant} className="flex items-center gap-1 capitalize">
                                <StatusIcon className="h-3 w-3" /> {t(config.label)}
                              </Badge>
                              {isNewBooking(booking.created_at) && (
                                <Badge variant="default" className="bg-primary-500 text-white border-0 animate-pulse">
                                  <Sparkles className="h-3 w-3 mr-0.5" /> {t('new_request')}
                                </Badge>
                              )}
                            </div>

                            {tenant && (
                              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 space-y-1.5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                  <User className="h-3 w-3" /> {t('tenant')}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{tenant.full_name}</span>
                                  {tenant.email && (
                                    <a href={`mailto:${tenant.email}`} className="flex items-center gap-1 text-gray-500 hover:text-primary-600">
                                      <Mail className="h-3 w-3" /> {tenant.email}
                                    </a>
                                  )}
                                  {tenant.phone && (
                                    <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 text-gray-500 hover:text-primary-600">
                                      <Phone className="h-3 w-3" /> {tenant.phone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {booking.check_in && booking.check_out && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                              </p>
                            )}

                            {booking.message && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-primary-300 pl-3">
                                "{booking.message}"
                              </div>
                            )}

                            <p className="text-xs text-gray-400">{t('booked')} {new Date(booking.created_at).toLocaleString()}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {booking.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => setRespondTarget(booking)}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> {t('respond')}
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleRespond(booking.id, 'rejected')} disabled={processingId === booking.id}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Link to={`/properties/${booking.property_id}`}>
                              <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!respondTarget} onOpenChange={() => { setRespondTarget(null); setReplyMessage('') }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('respond_to_booking')}</DialogTitle>
            <DialogDescription>{t('respond_to_booking_description')}</DialogDescription>
          </DialogHeader>
          {respondTarget && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-sm space-y-1">
                <p><span className="font-medium">{t('property')}:</span> {respondTarget.property?.title || t('unknown')}</p>
                <p><span className="font-medium">{t('tenant')}:</span> {respondTarget.tenant?.full_name || t('unknown')}</p>
                {respondTarget.check_in && respondTarget.check_out && <p><span className="font-medium">{t('dates')}:</span> {new Date(respondTarget.check_in).toLocaleDateString()} - {new Date(respondTarget.check_out).toLocaleDateString()}</p>}
                {respondTarget.message && <p className="italic">"{respondTarget.message}"</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reply_message')} ({t('optional')})</label>
                <textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  rows={3}
                  placeholder={t('reply_placeholder')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-3 text-sm dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setRespondTarget(null); setReplyMessage('') }}>{t('cancel')}</Button>
                <Button variant="destructive" onClick={() => handleRespond(respondTarget.id, 'rejected')} disabled={processingId === respondTarget.id}>
                  <XCircle className="h-4 w-4 mr-1" /> {t('reject')}
                </Button>
                <Button onClick={() => handleRespond(respondTarget.id, 'approved')} disabled={processingId === respondTarget.id}>
                  <CheckCircle className="h-4 w-4 mr-1" /> {t('approve')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
