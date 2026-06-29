import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/loading'
import { Download, BarChart3, TrendingUp, Users, Building2, DollarSign, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

const reports = [
  { title: 'Property Reports', desc: 'Property listing analytics', icon: Building2, color: 'bg-blue-100 text-blue-600' },
  { title: 'Booking Reports', desc: 'Booking trends and stats', icon: Calendar, color: 'bg-green-100 text-green-600' },
  { title: 'Revenue Reports', desc: 'Financial performance', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
  { title: 'User Reports', desc: 'User growth analytics', icon: Users, color: 'bg-amber-100 text-amber-600' },
  { title: 'Owner Reports', desc: 'Owner performance metrics', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
  { title: 'Agent Reports', desc: 'Agent activity stats', icon: BarChart3, color: 'bg-rose-100 text-rose-600' },
]

export function AdminReports() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('reports')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('view_platform_analytics')}</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> {t('export_all')}</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.title} className="cursor-pointer hover:shadow-md transition-shadow group">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.color} dark:opacity-80 group-hover:scale-110 transition-transform`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{report.title}</p>
                    <p className="text-sm text-gray-500">{report.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('revenue_overview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-sm">{t('chart_placeholder')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('platform_summary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: t('total_users'), value: '1,234', change: '+12%' },
                    { label: t('total_properties'), value: '456', change: '+8%' },
                    { label: t('total_bookings'), value: '789', change: '+15%' },
                    { label: t('total_revenue'), value: 'RWF 45M', change: '+22%' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b pb-3 last:border-0 dark:border-gray-700">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
                        <span className="text-xs text-green-600">{item.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
