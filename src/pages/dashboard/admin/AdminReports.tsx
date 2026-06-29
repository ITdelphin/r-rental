import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, BarChart3 } from 'lucide-react'

export function AdminReports() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('reports') || 'Reports'}</h1>
        <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Property Reports', 'Booking Reports', 'Revenue Reports', 'User Reports', 'Owner Reports', 'Agent Reports'].map((report) => (
          <Card key={report} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><BarChart3 className="h-6 w-6" /></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{report}</p>
                <p className="text-sm text-gray-500">Generate {report.toLowerCase()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
            Chart component (recharts)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
