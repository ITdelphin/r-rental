import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Home, CheckCircle, XCircle, Clock, Eye, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import type { Booking } from '@/types'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'secondary' | 'default'; icon: typeof Clock }> = {
  pending: { label: 'pending', variant: 'warning', icon: Clock },
  approved: { label: 'approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'rejected', variant: 'danger', icon: XCircle },
  cancelled: { label: 'cancelled', variant: 'secondary', icon: XCircle },
  completed: { label: 'completed', variant: 'default', icon: CheckCircle },
}

export function TenantBookings() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
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
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setBookings((data || []) as unknown as Booking[])
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_bookings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_bookings')}</p>
        </div>
        <Link to="/properties">
          <Button variant="outline" size="sm"><Home className="h-4 w-4" /> {t('browse_properties')}</Button>
        </Link>
      </div>

      {loading ? (
        <ListSkeleton items={3} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('no_bookings_yet')}
          description={t('no_bookings_description')}
          actionLabel={t('browse_properties')}
          onAction={() => window.location.href = '/properties'}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status] || statusConfig.pending
            const StatusIcon = config.icon
            const property = booking.property as unknown as { title: string; district: string; province: string; price: number; images?: { url: string }[] }
            return (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
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
                            {booking.check_in && booking.check_out && (
                              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</span>
                            )}
                            {property?.price && <span className="font-medium text-primary-600">{formatPrice(property.price)}/mo</span>}
                          </div>
                        </div>
                      </div>

                      {booking.message && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-primary-300 pl-3">
                          "{booking.message}"
                        </div>
                      )}

                      {booking.reply_message && (
                        <div className="rounded-lg bg-primary-50 dark:bg-primary-900/10 p-3 text-sm">
                          <span className="font-medium text-primary-700 dark:text-primary-300">{t('owner_reply')}:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-400">{booking.reply_message}</span>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">{t('booked')} {new Date(booking.created_at).toLocaleString()}</p>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
                      <Badge variant={config.variant} className="flex items-center gap-1 capitalize whitespace-nowrap">
                        <StatusIcon className="h-3 w-3" /> {t(config.label)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
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
    </div>
  )
}
