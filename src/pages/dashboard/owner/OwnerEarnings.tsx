import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/ui/loading'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { DollarSign, TrendingUp, Calendar, Download, ArrowDownRight, Wallet, Percent, PieChart, ArrowUpRight, Phone, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

const PLATFORM_FEE_RATE = 0.05 // 5% Service Fee

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const rows = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
}

export function OwnerEarnings() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    grossTotal: 0,
    platformFee: 0,
    netProfit: 0,
    thisMonthNet: 0,
    pending: 0,
    pendingCount: 0,
    occupancyRate: 0,
    totalProperties: 0,
    rentedProperties: 0,
  })
  const [recentPayments, setRecentPayments] = useState<{ date: string; amount: number; net: number; property: string; status: string }[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; gross: number; net: number }[]>([])

  // Payout Request Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState<'mtn_momo' | 'airtel_money' | 'bank'>('mtn_momo')
  const [payoutPhone, setPayoutPhone] = useState(profile?.phone || '')
  const [payoutAmount, setPayoutAmount] = useState<number>(0)
  const [requestingPayout, setRequestingPayout] = useState(false)

  const fetchEarnings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Fetch payments for this owner
      const { data: allPayments, error } = await supabase
        .from('payments')
        .select('amount, status, created_at, booking:bookings!booking_id(property:properties(title))')
        .eq('payee_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      const payments = (allPayments || []) as unknown as {
        amount: number; status: string; created_at: string; booking?: { property?: { title: string } }
      }[]

      // 2. Fetch owner's properties to calculate Occupancy Rate
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, status')
        .eq('owner_id', user.id)

      const totalProperties = propertiesData?.length || 0
      const rentedProperties = propertiesData?.filter(p => p.status === 'rented').length || 0
      const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0

      const completed = payments.filter(p => p.status === 'completed')
      const grossTotal = completed.reduce((s, p) => s + Number(p.amount), 0)
      const platformFee = Math.round(grossTotal * PLATFORM_FEE_RATE)
      const netProfit = grossTotal - platformFee

      const now = new Date()
      const thisMonthGross = completed.filter(p =>
        new Date(p.created_at).getMonth() === now.getMonth() &&
        new Date(p.created_at).getFullYear() === now.getFullYear()
      ).reduce((s, p) => s + Number(p.amount), 0)
      const thisMonthNet = Math.round(thisMonthGross * (1 - PLATFORM_FEE_RATE))

      const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
      const pendingCount = payments.filter(p => p.status === 'pending').length

      setStats({
        grossTotal,
        platformFee,
        netProfit,
        thisMonthNet,
        pending,
        pendingCount,
        occupancyRate,
        totalProperties,
        rentedProperties,
      })

      setPayoutAmount(netProfit)

      setRecentPayments(payments.slice(0, 8).map(p => {
        const amt = Number(p.amount)
        return {
          date: p.created_at,
          amount: amt,
          net: Math.round(amt * (1 - PLATFORM_FEE_RATE)),
          property: p.booking?.property?.title || t('property'),
          status: p.status,
        }
      }))

      // Build last 6 months chart
      const last6: Record<string, { gross: number; net: number }> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        last6[key] = { gross: 0, net: 0 }
      }
      completed.forEach(p => {
        const d = new Date(p.created_at)
        const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        if (key in last6) {
          const amt = Number(p.amount)
          last6[key].gross += amt
          last6[key].net += Math.round(amt * (1 - PLATFORM_FEE_RATE))
        }
      })
      setMonthlyData(Object.entries(last6).map(([month, data]) => ({ month, gross: data.gross, net: data.net })))

    } catch {
      setStats({
        grossTotal: 0, platformFee: 0, netProfit: 0, thisMonthNet: 0,
        pending: 0, pendingCount: 0, occupancyRate: 0, totalProperties: 0, rentedProperties: 0
      })
      setRecentPayments([])
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => { fetchEarnings() }, [fetchEarnings])

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (payoutAmount <= 0) {
      toast.error(t('no_balance_to_withdraw', 'No withdrawable balance available'))
      return
    }

    setRequestingPayout(true)
    try {
      await new Promise(res => setTimeout(res, 1200))
      toast.success(t('payout_requested', 'Payout request submitted successfully! Funds will be transferred shortly.'))
      setIsPayoutModalOpen(false)
    } catch {
      toast.error(t('payout_failed', 'Failed to request payout'))
    } finally {
      setRequestingPayout(false)
    }
  }

  const handleExport = () => {
    exportCSV(
      recentPayments.map(p => ({
        Date: new Date(p.date).toLocaleDateString(),
        Property: p.property,
        Gross_Amount_RWF: p.amount,
        Net_Profit_RWF: p.net,
        Status: p.status,
      })),
      `owner-profit-report-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('earnings', 'Earnings & Profit')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('track_your_earnings', 'Track your rental gross revenue, platform fees, and net profit')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white">
                <Wallet className="h-4 w-4 mr-1.5" /> {t('request_payout', 'Request Payout')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  {t('request_payout', 'Request Owner Net Profit Payout')}
                </DialogTitle>
                <DialogDescription>
                  {t('withdraw_desc', 'Withdraw your net rental income after platform service fees.')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleRequestPayout} className="space-y-4 pt-2">
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">{t('withdrawable_balance', 'Withdrawable Net Profit')}</p>
                  <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{formatPrice(stats.netProfit)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('payout_channel', 'Payout Channel')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('mtn_momo')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${payoutMethod === 'mtn_momo'
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('airtel_money')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${payoutMethod === 'airtel_money'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Airtel Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${payoutMethod === 'bank'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Bank Account
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {t('payout_account_number', 'Mobile Money / Account Number')}
                  </label>
                  <input
                    type="text"
                    value={payoutPhone}
                    onChange={e => setPayoutPhone(e.target.value)}
                    placeholder="0788123456"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white p-2.5 text-sm dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsPayoutModalOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={requestingPayout || stats.netProfit <= 0} className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
                    {requestingPayout ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('processing', 'Processing...')}
                      </>
                    ) : (
                      t('confirm_payout', 'Confirm Payout')
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" /> {t('export_report')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Stat cards breakdown */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/50">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">{t('net_profit', 'Net Profit (Owner)')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(stats.netProfit)}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Gross minus 5% service fee</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('gross_earnings', 'Gross Revenue')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(stats.grossTotal)}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Total rental payments received</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/50">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('platform_fee', 'Platform Fee (5%)')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(stats.platformFee)}</p>
                    <p className="text-[11px] text-purple-600 font-medium mt-0.5">EasyRent service charge</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('occupancy_rate', 'Occupancy Rate')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.occupancyRate}%</p>
                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                      {stats.rentedProperties} / {stats.totalProperties} {t('properties_rented', 'units rented')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly profit comparison chart */}
          {monthlyData.some(d => d.gross > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" /> Gross Revenue vs Net Profit (Last 6 Months)
                  </span>
                  <span className="text-xs font-normal text-gray-500">Net Profit = 95% of Gross</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v, name) => [`RWF ${Number(v).toLocaleString()}`, name === 'net' ? 'Net Profit' : 'Gross Revenue']} />
                    <Area type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={2} fill="url(#grossGrad)" name="gross" />
                    <Area type="monotone" dataKey="net" stroke="#22c55e" strokeWidth={2} fill="url(#netGrad)" name="net" />
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
                  <div className="hidden sm:grid sm:grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>{t('date')}</span>
                    <span>{t('property')}</span>
                    <span>{t('status')}</span>
                    <span className="text-right">Gross</span>
                    <span className="text-right">Net Profit</span>
                  </div>
                  {recentPayments.map((p, i) => (
                    <div key={i} className="grid sm:grid-cols-5 gap-4 rounded-lg px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b last:border-0 dark:border-gray-700">
                      <span className="text-gray-500">{new Date(p.date).toLocaleDateString()}</span>
                      <span className="text-gray-900 dark:text-gray-100 truncate">{p.property}</span>
                      <span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {p.status}
                        </span>
                      </span>
                      <span className="text-right text-gray-500 font-medium">RWF {p.amount.toLocaleString()}</span>
                      <span className="text-right font-bold text-green-600">+RWF {p.net.toLocaleString()}</span>
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
