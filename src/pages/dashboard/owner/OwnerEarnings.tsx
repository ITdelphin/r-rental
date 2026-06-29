import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading'
import { DollarSign, TrendingUp, Calendar, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function OwnerEarnings() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(timer)
  }, [])

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
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <CardSkeleton />
        </>
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
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF 1,250,000</p>
                    <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <ArrowUpRight className="h-3 w-3" /> +12.5% {t('vs_last_month')}
                    </p>
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
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF 500,000</p>
                    <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <ArrowUpRight className="h-3 w-3" /> +8.3% {t('vs_last_month')}
                    </p>
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
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF 250,000</p>
                    <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                      <ArrowDownRight className="h-3 w-3" /> 3 {t('pending_transactions')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid sm:grid-cols-4 gap-4 rounded-lg px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b last:border-0 dark:border-gray-700">
                    <span className="text-gray-500">{`Dec ${10 + i}, 2024`}</span>
                    <span className="text-gray-900 dark:text-gray-100">{t('payment_from_tenant')}</span>
                    <span className="text-gray-500 truncate">{t('apartment_name')}</span>
                    <span className="text-right font-semibold text-green-600">+RWF 250,000</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
