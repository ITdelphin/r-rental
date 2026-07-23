import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/ui/loading'
import { DollarSign, TrendingUp, Calendar, Download, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const rows = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
}

export function OwnerEarnings() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, pending: 0, pendingCount: 0 })
  const [recentPayments, setRecentPayments] = useState<{ date: string; amount: number; property: string; status: string }[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number }[]>([])

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
      const payments = (allPayments || []) as unknown as {
        amount: number; status: string; created_at: string; booking?: { property?: { title: string } }
      }[]

      const completed = payments.filter(p => p.status === 'completed')
      const total = completed.reduce((s, p) => s + Number(p.amount), 0)
      const now = new Date()
      const thisMonth = completed.filter(p =>
        new Date(p.created_at).getMonth() === now.getMonth() &&
        new Date(p.created_at).getFullYear() === now.getFullYear()
      ).reduce((s, p) => s + Number(p.amount), 0)
      const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
      const pendingCount = payments.filter(p => p.status === 'pending').length

      setStats({ total, thisMonth, pending, pendingCount })
      setRecentPayments(payments.slice(0, 8).map(p => ({
        date: p.created_at,
        amount: Number(p.amount),
        property: p.booking?.property?.title || t('property'),
        status: p.status,
      })))

      // Build last 6 months chart
      const last6: Record<string, number> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        last6[key] = 0
      }
      completed.forEach(p => {
        const d = new Date(p.created_at)
        const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        if (key in last6) last6[key] += Number(p.amount)
      })
      setMonthlyData(Object.entries(last6).map(([month, amount]) => ({ month, amount })))

    } catch {
      setStats({ total: 0, thisMonth: 0, pending: 0, pendingCount: 0 })
      setRecentPayments([])
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => { fetchEarnings() }, [fetchEarnings])

  const handleExport = () => {
    exportCSV(
      recentPayments.map(p => ({
        Date: new Date(p.date).toLocaleDateString(),
        Property: p.property,
        Amount_RWF: p.amount,
        Status: p.status,
      })),
      `earnings-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('earnings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('track_your_earnings')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1.5" /> {t('export_report')}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/50">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_earnings')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF {stats.total.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('this_month')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF {stats.thisMonth.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('pending_payments')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF {stats.pending.toLocaleString()}</p>
                    <p className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                      <ArrowDownRight className="h-3 w-3" /> {stats.pendingCount} {t('pending_transactions')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly earnings chart */}
          {monthlyData.some(d => d.amount > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-green-500" /> Monthly Earnings (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => [`RWF ${Number(v).toLocaleString()}`, 'Earnings']} />
                    <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} fill="url(#earningsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent transactions */}
          {recentPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('recent_transactions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="hidden sm:grid sm:grid-cols-4 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>{t('date')}</span>
                    <span>{t('property')}</span>
                    <span>{t('status')}</span>
                    <span className="text-right">{t('amount')}</span>
                  </div>
                  {recentPayments.map((p, i) => (
                    <div key={i} className="grid sm:grid-cols-4 gap-4 rounded-lg px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b last:border-0 dark:border-gray-700">
                      <span className="text-gray-500">{new Date(p.date).toLocaleDateString()}</span>
                      <span className="text-gray-900 dark:text-gray-100 truncate">{p.property}</span>
                      <span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {p.status}
                        </span>
                      </span>
                      <span className="text-right font-semibold text-green-600">+RWF {p.amount.toLocaleString()}</span>
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
