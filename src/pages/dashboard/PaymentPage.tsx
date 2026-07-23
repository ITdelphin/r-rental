import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, CreditCard, CheckCircle, XCircle, Clock, ArrowUpRight, Download, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'
import jsPDF from 'jspdf'

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

function downloadReceipt(payment: PaymentWithBooking, profile: { full_name?: string; email?: string } | null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  const W = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Rwanda EasyRent', W / 2, 11, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('PAYMENT RECEIPT', W / 2, 19, { align: 'center' })
  doc.text(`Ref: ${payment.transaction_id || payment.id.slice(0, 8).toUpperCase()}`, W / 2, 25, { align: 'center' })

  // Body
  doc.setTextColor(30, 30, 30)
  const rows: [string, string][] = [
    ['Property', payment.booking?.property?.title || 'N/A'],
    ['Amount', `RWF ${Number(payment.amount).toLocaleString()}`],
    ['Currency', payment.currency || 'RWF'],
    ['Payment Method', payment.method.replace(/_/g, ' ').toUpperCase()],
    ['Status', payment.status.toUpperCase()],
    ['Date', new Date(payment.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Payer', profile?.full_name || 'N/A'],
    ['Email', profile?.email || 'N/A'],
  ]

  let y = 38
  rows.forEach(([label, value]) => {
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(label, 14, y)
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    doc.text(value, 14, y + 5)
    y += 13
  })

  // Footer
  doc.setDrawColor(220, 220, 220)
  doc.line(14, y + 4, W - 14, y + 4)
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for using Rwanda EasyRent', W / 2, y + 10, { align: 'center' })
  doc.text('support@rwanda-easyrent.rw', W / 2, y + 15, { align: 'center' })

  doc.save(`receipt-${payment.transaction_id || payment.id.slice(0, 8)}.pdf`)
}

function exportAllCSV(payments: PaymentWithBooking[], filename: string) {
  const rows = payments.map(p => ({
    Date: new Date(p.created_at).toLocaleDateString(),
    Property: p.booking?.property?.title || '',
    Amount: p.amount,
    Currency: p.currency,
    Method: p.method,
    Status: p.status,
    TransactionID: p.transaction_id || '',
  }))
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${(r as any)[k]}"`).join(','))].join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = filename; a.click()
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('payment_history')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_payments')}</p>
        </div>
        {payments.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportAllCSV(payments, `payments-${new Date().toISOString().slice(0, 10)}.csv`)}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        )}
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

                  <div className="border-t dark:border-gray-700 pt-3 flex items-center justify-between gap-2">
                    {payment.booking && (
                      <Link
                        to={`/dashboard/bookings`}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        {t('view_booking')}
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-gray-700 ml-auto"
                      onClick={() => downloadReceipt(payment, profile)}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" /> Download Receipt
                    </Button>
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
