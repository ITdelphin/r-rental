import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function SuperAdminSettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h1>
      <Card>
        <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Platform Name" defaultValue="Rwanda EasyRent" />
            <Input label="Support Email" defaultValue="support@rwanda-easyrent.com" />
            <Input label="Phone Number" defaultValue="+250 788 000 000" />
            <Input label="Address" defaultValue="Kigali, Rwanda" />
          </div>
          <Button>{t('save')}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="User Registration" options={[{ value: 'open', label: 'Open' }, { value: 'invite', label: 'Invite Only' }, { value: 'closed', label: 'Closed' }]} />
            <Select label="Property Auto-Approval" options={[{ value: 'yes', label: 'Enabled' }, { value: 'no', label: 'Disabled' }]} />
          </div>
          <Button>{t('save')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
