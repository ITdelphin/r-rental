import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, CreditCard, CheckCircle, XCircle, Clock, ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'secondary' | 'default'; icon: typeof Clock }> = {
  pending: { label: 'pending', variant: 'warning', icon: Clock },
  completed: { label: 'completed', variant: 'success', icon: CheckCircle },
  failed: { label: 'failed', variant: 'danger', icon: XCircle },
  refunded: { label: 'refunded', variant: 'secondary', icon: XCircle },
}

interface PaymentWithBooking {
  id: string
  booking_id: string
  payer_id: string
  payee_id: string
  amount: number
  currency: string
  method: string
  status: string
  transaction_id: string | null
  receipt_url: string | null
  created_at: string
  booking?: {
    id: string
    status: string
    property?: { title: string; district: string; province: string }
  }
}

export function PaymentPage() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentWithBooking[]>([])
  const [search, setSearch] = useState('')

  const fetchPayments = useCallback(async () => {
    if (!user || !profile) return
    setLoading(true)
    try {
      const column = profile.role === 'owner' || profile.role === 'agent' ? 'payee_id' : 'payer_id'
      const { data, error } = await supabase
        .from('payments')
        .select('*, booking:bookings(id, status, property:properties(title, district, province))')
        .eq(column, user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPayments((data || []) as unknown as PaymentWithBooking[])
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    if (user && profile) fetchPayments()
  }, [fetchPayments, user, profile])

  const filtered = payments.filter(p =>
    !search ||
    p.booking?.property?.title.toLowerCase().includes(search.toLowerCase()) ||
    p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.method.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('payment_history')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_payments')}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('search_payments')}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title={t('no_payments')} description={t('no_payments_description')} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map(payment => {
            const config = statusConfig[payment.status] || statusConfig.pending
            const StatusIcon = config.icon
            return (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {payment.booking?.property?.title || t('payment')}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">{payment.method.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge variant={config.variant} className="flex items-center gap-1 capitalize">
                      <StatusIcon className="h-3 w-3" /> {t(config.label)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">{t('amount')}</p>
                      <p className="font-semibold text-primary-600 mt-0.5">{formatPrice(payment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">{t('total')}</p>
                      <p className="font-semibold text-primary-600 mt-0.5">{payment.currency}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">{t('payment_date')}</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">{t('transaction_id')}</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 text-xs truncate">
                        {payment.transaction_id || '-'}
                      </p>
                    </div>
                  </div>

                  {payment.booking && (
                    <div className="border-t dark:border-gray-700 pt-3">
                      <Link
                        to={`/dashboard/bookings`}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        {t('view_booking')}
                      </Link>
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
