import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Home, CheckCircle, XCircle, Clock, Eye, Sparkles, CreditCard, Wallet, Smartphone, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { createAuditLog } from '@/lib/audit'
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

  // Payment Checkout State Machine
  const [isPayOpen, setIsPayOpen] = useState(false)
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money' | 'card'>('mtn_momo')
  const [paymentPhone, setPaymentPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details')
  const [paymentMessage, setPaymentMessage] = useState('')

  useEffect(() => {
    if (user && profile) fetchBookings()
  }, [user, profile])

  const fetchBookings = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, property:properties(title, district, province, price, deposit, images:property_images(url))')
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
      createAuditLog('booking_cancelled', 'booking', id)
      const booking = bookings.find(b => b.id === id)
      if (booking?.owner_id) {
        await createNotification(booking.owner_id, 'Booking Cancelled', `${profile?.full_name || 'A tenant'} cancelled their booking.`, 'warning', { booking_id: id })
      }
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch {
      toast.error(t('failed_to_cancel_booking'))
    } finally { setProcessingId(null) }
  }

  const handleStartPayment = (booking: Booking) => {
    setPayingBooking(booking)
    setPaymentPhone(profile?.phone || '')
    setPaymentStep('details')
    setPaymentMessage('')
    setIsPayOpen(true)
  }

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingBooking) return

    setPaymentStep('processing')
    setPaymentMessage(t('initiating_payment_protocol') || 'Initiating secure transaction...')

    // Step 1: Simulate network verification
    await new Promise(r => setTimeout(r, 1500))
    setPaymentMessage(t('waiting_for_momo_approval') || 'Waiting for confirmation prompt on your device...')

    // Step 2: Simulating approval timeout
    await new Promise(r => setTimeout(r, 2000))
    setPaymentMessage(t('verifying_transaction_status') || 'Verifying transaction status...')
    await new Promise(r => setTimeout(r, 1000))

    try {
      const price = (payingBooking.property as any)?.price || 0
      const deposit = (payingBooking.property as any)?.deposit || 0
      const totalAmount = price + deposit

      // 1. Insert into payments table
      const { error: payError } = await supabase.from('payments').insert({
        booking_id: payingBooking.id,
        payer_id: user!.id,
        payee_id: payingBooking.owner_id,
        amount: totalAmount,
        currency: 'RWF',
        method: paymentMethod,
        status: 'completed',
        transaction_id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        receipt_url: null,
      } as never)

      if (payError) throw payError

      // 2. Update booking status to completed
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'completed' } as never)
        .eq('id', payingBooking.id)

      if (bookingError) throw bookingError

      // 3. Notify owner & tenant
      sendBookingNotification(payingBooking.id, 'completed')
      await createNotification(
        payingBooking.owner_id,
        'Booking Completed & Paid',
        `A payment of ${formatPrice(totalAmount)} was received from ${profile?.full_name || 'Tenant'}.`,
        'success',
        { booking_id: payingBooking.id }
      )

      setPaymentStep('success')
      toast.success(t('payment_successful') || 'Payment processed successfully!')
      fetchBookings()
    } catch (err) {
      console.error(err)
      toast.error(t('payment_failed') || 'Payment failed. Please try again.')
      setPaymentStep('details')
    }
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
            const property = booking.property as unknown as { title: string; district: string; province: string; price: number; deposit?: number; images?: { url: string }[] }
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
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 block mb-1">{t('message_from_owner')}</span>
                          <p className="text-gray-700 dark:text-gray-300 italic">"{booking.reply_message}"</p>
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
                          <Button size="sm" variant="outline" className="text-red-600 cursor-pointer" onClick={() => handleCancel(booking.id)} disabled={processingId === booking.id}>
                            {t('cancel')}
                          </Button>
                        )}
                        {booking.status === 'approved' && (
                          <Button size="sm" className="bg-primary-600 text-white hover:bg-primary-700 cursor-pointer" onClick={() => handleStartPayment(booking)}>
                            {t('pay_now') || 'Pay Rent & Deposit'}
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

      {/* Payment Dialog Modal */}
      {payingBooking && (
        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-500" />
                {t('complete_rental_payment') || 'Complete Rental Payment'}
              </DialogTitle>
              <DialogDescription>
                {t('payment_momo_card_desc') || 'Pay your first month rent and security deposit securely.'}
              </DialogDescription>
            </DialogHeader>

            {paymentStep === 'details' && (
              <form onSubmit={handleCompletePayment} className="space-y-4 pt-2">
                {/* Summary Box */}
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('rent')}:</span>
                    <span className="font-semibold">{formatPrice((payingBooking.property as any)?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('deposit')}:</span>
                    <span className="font-semibold">{formatPrice((payingBooking.property as any)?.deposit || 0)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base text-primary-600">
                    <span>{t('total')}:</span>
                    <span>{formatPrice(((payingBooking.property as any)?.price || 0) + ((payingBooking.property as any)?.deposit || 0))}</span>
                  </div>
                </div>

                {/* Method selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('payment_method') || 'Payment Method'}</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mtn_momo')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-1.5 cursor-pointer ${paymentMethod === 'mtn_momo'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-300'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                    >
                      <Smartphone className="h-5 w-5" />
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('airtel_money')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-1.5 cursor-pointer ${paymentMethod === 'airtel_money'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-300'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                    >
                      <Smartphone className="h-5 w-5" />
                      Airtel Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-1.5 cursor-pointer ${paymentMethod === 'card'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-300'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      Visa / Card
                    </button>
                  </div>
                </div>

                {/* Dynamic Inputs */}
                {paymentMethod !== 'card' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_number') || 'Mobile Money Phone Number'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0782 680 268"
                      value={paymentPhone}
                      onChange={e => setPaymentPhone(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('card_number') || 'Card Number'}</label>
                      <input
                        type="text"
                        required
                        placeholder="1234 5678 1234 5678"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expiry') || 'Expiry (MM/YY)'}</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="123"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsPayOpen(false)}>{t('cancel')}</Button>
                  <Button type="submit">{t('confirm_and_pay') || 'Confirm & Pay'}</Button>
                </DialogFooter>
              </form>
            )}

            {paymentStep === 'processing' && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
                <p className="font-semibold text-center text-gray-900 dark:text-gray-100">{t('processing_payment') || 'Processing Payment'}</p>
                <p className="text-sm text-gray-500 text-center animate-pulse">{paymentMessage}</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('payment_successful') || 'Payment Successful!'}</h3>
                <p className="text-sm text-gray-500">
                  {t('payment_success_booking_complete') || 'Your rental booking has been fully verified and is now complete.'}
                </p>
                <div className="pt-4 w-full">
                  <Button className="w-full" onClick={() => setIsPayOpen(false)}>{t('close')}</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
