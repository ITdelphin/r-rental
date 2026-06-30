import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Calendar, Home, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import type { Booking } from '@/types'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'secondary' | 'default'; icon: typeof Clock }> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
  cancelled: { label: 'Cancelled', variant: 'secondary', icon: XCircle },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle },
}

export function TenantBookings() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (user && profile) fetchBookings()
  }, [user, profile])

  const fetchBookings = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Owners/agents see bookings for their properties; tenants see their own bookings
      const isOwner = profile?.role === 'owner' || profile?.role === 'agent'
      const column = isOwner ? 'owner_id' : 'tenant_id'
      const { data, error } = await supabase
        .from('bookings')
        .select('*, property:properties(title, district, province, price, images:property_images(url))')
        .eq(column, user.id)
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
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' } as never).eq('id', id)
      if (error) throw error
      toast.success('Booking cancelled')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'approved' } as never).eq('id', id)
      if (error) throw error
      toast.success('Booking approved')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b))
    } catch {
      toast.error('Failed to approve booking')
    }
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
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        {property?.images?.[0]?.url ? (
                          <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-6 w-6" /></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{property?.title || 'Property'}</h3>
                        <p className="text-sm text-gray-500">{property?.district}, {property?.province}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          {booking.visit_date && (
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(booking.visit_date).toLocaleDateString()}</span>
                          )}
                          {property?.price && <span className="font-medium text-primary-600">{formatPrice(property.price)}/mo</span>}
                        </div>
                        {booking.message && <p className="mt-1 text-xs text-gray-400 italic">"{booking.message}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
                      <Badge variant={config.variant} className="flex items-center gap-1 capitalize">
                        <StatusIcon className="h-3 w-3" /> {t(config.label.toLowerCase())}
                      </Badge>
                      {isOwner && booking.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApprove(booking.id)}>Approve</Button>
                      )}
                      {!isOwner && booking.status === 'pending' && (
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                      )}
                      {property && (
                        <Link to={`/properties/${booking.property_id}`}>
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        </Link>
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
