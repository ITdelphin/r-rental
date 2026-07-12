import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Home, CheckCircle, XCircle, Clock, Eye, User, Phone, Mail, MessageSquare, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import type { Booking } from '@/types'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'secondary' | 'default'; icon: typeof Clock }> = {
  pending: { label: 'pending', variant: 'warning', icon: Clock },
  approved: { label: 'approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'rejected', variant: 'danger', icon: XCircle },
  cancelled: { label: 'cancelled', variant: 'secondary', icon: XCircle },
  completed: { label: 'completed', variant: 'default', icon: CheckCircle },
}

interface BookingWithTenant extends Booking {
  tenant?: Profile
  reply_message?: string
}

export function TenantBookings() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingWithTenant[]>([])
  const [respondTarget, setRespondTarget] = useState<BookingWithTenant | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (user && profile) fetchBookings()
  }, [user, profile])

  const fetchBookings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const isOwnerRole = profile?.role === 'owner' || profile?.role === 'agent'
      const column = isOwnerRole ? 'owner_id' : 'tenant_id'
      const { data, error } = await supabase
        .from('bookings')
        .select('*, property:properties(title, district, province, price, images:property_images(url)), tenant:profiles!tenant_id(full_name, email, phone, avatar_url)')
        .eq(column, user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setBookings((data || []) as unknown as BookingWithTenant[])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' } as never).eq('id', id)
      if (error) throw error
      toast.success(t('booking_cancelled'))
      sendBookingNotification(id, 'cancelled')
      const booking = bookings.find(b => b.id === id)
      if (booking?.owner_id) {
        await createNotification(booking.owner_id, 'Booking Cancelled', `${profile?.full_name || 'A tenant'} cancelled their booking.`, 'warning', { booking_id: id })
      }
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch {
      toast.error(t('failed_to_cancel_booking'))
    } finally { setProcessingId(null) }
  }

  const handleRespond = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id)
    try {
      const { error } = await supabase.from('bookings').update({ status, reply_message: replyMessage || null } as never).eq('id', id)
      if (error) throw error
      toast.success(status === 'approved' ? t('booking_approved') : t('booking_rejected'))
      sendBookingNotification(id, status)
      const booking = bookings.find(b => b.id === id)
      if (booking?.tenant_id) {
        const title = (booking.property as unknown as { title: string } | null)?.title || 'Property'
        await createNotification(
          booking.tenant_id,
          `Booking ${status}`,
          `Your booking for "${title}" has been ${status}.${replyMessage ? ` Owner says: "${replyMessage}"` : ''}`,
          status === 'approved' ? 'success' : 'error',
          { booking_id: id }
        )
      }
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status, reply_message: replyMessage || null } as BookingWithTenant : b))
      setRespondTarget(null)
      setReplyMessage('')
    } catch {
      toast.error(status === 'approved' ? t('failed_to_approve_booking') : t('failed_to_reject_booking'))
    } finally { setProcessingId(null) }
  }

  const isOwner = profile?.role === 'owner' || profile?.role === 'agent'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_bookings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_bookings')}</p>
        </div>
        {!isOwner && (
          <Link to="/properties">
            <Button variant="outline" size="sm"><Home className="h-4 w-4" /> {t('browse_properties')}</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <ListSkeleton items={3} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('no_bookings_yet')}
          description={t('no_bookings_description')}
          actionLabel={isOwner ? undefined : t('browse_properties')}
          onAction={isOwner ? undefined : () => window.location.href = '/properties'}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status] || statusConfig.pending
            const StatusIcon = config.icon
            const property = booking.property as unknown as { title: string; district: string; province: string; price: number; images?: { url: string }[] }
            const tenant = booking.tenant as unknown as Profile | undefined
            return (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Property + Booking Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                          {property?.images?.[0]?.url ? (
                            <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-6 w-6" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{property?.title || t('property')}</h3>
                          <p className="text-sm text-gray-500">{property?.district}, {property?.province}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            {booking.visit_date && (
                              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(booking.visit_date).toLocaleDateString()}</span>
                            )}
                            {property?.price && <span className="font-medium text-primary-600">{formatPrice(property.price)}/mo</span>}
                          </div>
                        </div>
                      </div>

                      {/* Tenant Info (Owner View) */}
                      {isOwner && tenant && (
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1"><User className="h-3 w-3" /> Tenant</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{tenant.full_name}</span>
                            {tenant.email && <span className="flex items-center gap-1 text-gray-500"><Mail className="h-3 w-3" /> {tenant.email}</span>}
                            {tenant.phone && <span className="flex items-center gap-1 text-gray-500"><Phone className="h-3 w-3" /> {tenant.phone}</span>}
                          </div>
                        </div>
                      )}

                      {/* Booking Message */}
                      {booking.message && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-primary-300 pl-3">
                          "{booking.message}"
                        </div>
                      )}

                      {/* Owner Reply */}
                      {booking.reply_message && (
                        <div className="rounded-lg bg-primary-50 dark:bg-primary-900/10 p-3 text-sm">
                          <span className="font-medium text-primary-700 dark:text-primary-300">{t('owner_reply')}:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-400">{booking.reply_message}</span>
                        </div>
                      )}

                      {/* Booking created time */}
                      <p className="text-xs text-gray-400">{t('booked')} {new Date(booking.created_at).toLocaleString()}</p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
                      <Badge variant={config.variant} className="flex items-center gap-1 capitalize whitespace-nowrap">
                        <StatusIcon className="h-3 w-3" /> {t(config.label)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {isOwner && booking.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => setRespondTarget(booking)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> {t('respond')}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleRespond(booking.id, 'rejected')} disabled={processingId === booking.id}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!isOwner && booking.status === 'pending' && (
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleCancel(booking.id)} disabled={processingId === booking.id}>
                            {t('cancel')}
                          </Button>
                        )}
                        {property && (
                          <Link to={`/properties/${booking.property_id}`}>
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Respond Dialog */}
      <Dialog open={!!respondTarget} onOpenChange={() => { setRespondTarget(null); setReplyMessage('') }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('respond_to_booking')}</DialogTitle>
            <DialogDescription>{t('respond_to_booking_description')}</DialogDescription>
          </DialogHeader>
          {respondTarget && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-sm space-y-1">
                <p><span className="font-medium">{t('property')}:</span> {(respondTarget.property as unknown as { title: string })?.title || t('unknown')}</p>
                <p><span className="font-medium">{t('tenant')}:</span> {(respondTarget.tenant as unknown as Profile)?.full_name || t('unknown')}</p>
                {respondTarget.visit_date && <p><span className="font-medium">{t('visit_date')}:</span> {new Date(respondTarget.visit_date).toLocaleDateString()}</p>}
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
