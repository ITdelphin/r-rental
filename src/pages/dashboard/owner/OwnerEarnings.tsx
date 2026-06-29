import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'

export function OwnerEarnings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('earnings') || 'Earnings'}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600"><DollarSign className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF 1,250,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF 500,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600"><Calendar className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">RWF 250,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>{t('recent_transactions') || 'Recent Transactions'}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment from Tenant</p>
                  <p className="text-xs text-gray-500">{`Dec ${10 + i}, 2024`}</p>
                </div>
                <p className="text-sm font-semibold text-green-600">+RWF 250,000</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
