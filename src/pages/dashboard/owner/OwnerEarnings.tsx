import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/ui/loading'
import { DollarSign, TrendingUp, Calendar, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function OwnerEarnings() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, pending: 0, pendingCount: 0 })
  const [recentPayments, setRecentPayments] = useState<{ date: string; amount: number; property: string }[]>([])

  const fetchEarnings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: allPayments, error } = await supabase
        .from('payments')
        .select('amount, status, created_at, booking:bookings!booking_id(property:properties(title))')
        .eq('payee_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      const payments = (allPayments || []) as unknown as { amount: number; status: string; created_at: string; booking?: { property?: { title: string } } }[]

      const total = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0)
      const now = new Date()
      const thisMonth = payments.filter(p => p.status === 'completed' && new Date(p.created_at).getMonth() === now.getMonth() && new Date(p.created_at).getFullYear() === now.getFullYear()).reduce((s, p) => s + Number(p.amount), 0)
      const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
      const pendingCount = payments.filter(p => p.status === 'pending').length

      setStats({ total, thisMonth, pending, pendingCount })
      setRecentPayments(payments.slice(0, 5).map(p => ({
        date: p.created_at,
        amount: Number(p.amount),
        property: p.booking?.property?.title || t('property'),
      })))
    } catch {
      setStats({ total: 0, thisMonth: 0, pending: 0, pendingCount: 0 })
      setRecentPayments([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('earnings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('track_your_earnings')}</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> {t('export_report')}</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/50">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_earnings')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('rwf')} {stats.total.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('this_month')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('rwf')} {stats.thisMonth.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('pending_payments')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('rwf')} {stats.pending.toLocaleString()}</p>
                    <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                      <ArrowDownRight className="h-3 w-3" /> {stats.pendingCount} {t('pending_transactions')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {recentPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('recent_transactions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="hidden sm:grid sm:grid-cols-4 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>{t('date')}</span>
                    <span>{t('description')}</span>
                    <span>{t('property')}</span>
                    <span className="text-right">{t('amount')}</span>
                  </div>
                  {recentPayments.map((p, i) => (
                    <div key={i} className="grid sm:grid-cols-4 gap-4 rounded-lg px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b last:border-0 dark:border-gray-700">
                      <span className="text-gray-500">{new Date(p.date).toLocaleDateString()}</span>
                      <span className="text-gray-900 dark:text-gray-100">{t('payment_from_tenant')}</span>
                      <span className="text-gray-500 truncate">{p.property}</span>
                      <span className="text-right font-semibold text-green-600">+{t('rwf')} {p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
