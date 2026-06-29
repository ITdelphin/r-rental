import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/loading'
import { Settings, Shield, Mail, Bell, Save, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

export function SuperAdminSettings() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h1>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('platform_settings')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_platform_settings')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> {t('general_settings')}
            </CardTitle>
            <CardDescription>{t('general_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('platform_name')}</label>
                <input type="text" defaultValue="Rwanda EasyRent" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('support_email')}</label>
                <input type="email" defaultValue="support@rwanda-easyrent.com" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_number')}</label>
                <input type="tel" defaultValue="+250 788 000 000" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                <input type="text" defaultValue="Kigali, Rwanda" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
            </div>
            <Button><Save className="h-4 w-4" /> {t('save_settings')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> {t('security_settings')}
            </CardTitle>
            <CardDescription>{t('security_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('user_registration')}</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option value="open">{t('open')}</option>
                  <option value="invite">{t('invite_only')}</option>
                  <option value="closed">{t('closed')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('property_auto_approval')}</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option value="yes">{t('enabled')}</option>
                  <option value="no">{t('disabled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('two_factor_auth')}</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option value="required">{t('required')}</option>
                  <option value="optional">{t('optional')}</option>
                  <option value="disabled">{t('disabled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('session_timeout')}</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option value="30">30 {t('minutes')}</option>
                  <option value="60">1 {t('hour')}</option>
                  <option value="240">4 {t('hours')}</option>
                  <option value="1440">24 {t('hours')}</option>
                </select>
              </div>
            </div>
            <Button variant="outline"><RefreshCw className="h-4 w-4" /> {t('update_security')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> {t('email_settings')}
            </CardTitle>
            <CardDescription>{t('email_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_host')}</label>
                <input type="text" defaultValue="smtp.sendgrid.net" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_port')}</label>
                <input type="text" defaultValue="587" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_user')}</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_password')}</label>
                <input type="password" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
            </div>
            <Button variant="outline"><Mail className="h-4 w-4" /> {t('test_email')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> {t('notification_settings')}
            </CardTitle>
            <CardDescription>{t('notification_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: t('email_notifications'), desc: t('email_notifications_desc') },
              { label: t('sms_notifications'), desc: t('sms_notifications_desc') },
              { label: t('push_notifications'), desc: t('push_notifications_desc') },
              { label: t('booking_updates'), desc: t('booking_updates_desc') },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                </label>
              </div>
            ))}
            <Button variant="outline"><Save className="h-4 w-4" /> {t('save_notifications')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
