import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Plus } from 'lucide-react'

export function SuperAdminCms() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CMS</h1>
        <Button><Plus className="h-4 w-4" /> New Page</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Editable Pages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Homepage', 'Hero Section', 'About', 'Contact', 'FAQ', 'Privacy Policy', 'Terms'].map((page) => (
              <div key={page} className="flex items-center justify-between border-b pb-3 last:border-0 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{page}</span>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Theme Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Primary Color" defaultValue="#2563eb" />
            <Input label="Logo URL" placeholder="https://example.com/logo.png" />
            <Input label="Footer Text" defaultValue="Rwanda EasyRent" />
            <Input label="Contact Email" defaultValue="info@rwanda-easyrent.com" />
          </div>
          <Button>{t('save')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
