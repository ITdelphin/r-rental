import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/loading'
import { Settings, Shield, Mail, Bell, Save, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function SuperAdminSettings() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmailing, setTestEmailing] = useState(false)

  // System settings state
  const [sysSettings, setSysSettings] = useState<Record<string, string>>({
    platform_name: 'Rwanda EasyRent',
    support_email: 'support@rwanda-easyrent.com',
    phone_number: '+250 788 000 000',
    address: 'Kigali, Rwanda',
    user_registration: 'open',
    property_auto_approval: 'no',
    two_factor_auth: 'optional',
    session_timeout: '1440',
    smtp_host: 'smtp.sendgrid.net',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    email_notifications: 'true',
    sms_notifications: 'false',
    push_notifications: 'true',
    booking_updates: 'true'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      if (data && data.length > 0) {
        const mapped = { ...sysSettings }
        for (const row of data as any[]) {
          if (row.key in mapped) mapped[row.key] = row.value
        }
        setSysSettings(mapped)
      }
    } catch (error: any) {
      toast.error('Failed to load settings from database')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string | boolean) => {
    setSysSettings(prev => ({ ...prev, [key]: String(value) }))
  }

  const saveSettings = async (keys: string[]) => {
    setSaving(true)
    try {
      for (const key of keys) {
        // Upsert standard pattern since key is unique
        const { error } = await supabase.from('settings').upsert({
          key,
          value: sysSettings[key]
        } as any, { onConflict: 'key' })
        if (error) throw error
      }
      toast.success('Settings synchronized successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setTestEmailing(true)
    setTimeout(() => {
      setTestEmailing(false)
      toast.success('Test email requested (SMTP needs real backend server)')
    }, 1500)
  }

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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('platform_settings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_platform_settings')}</p>
        </div>
        <Button variant="outline" onClick={fetchSettings} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Configuration
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-500" /> {t('general_settings')}
            </CardTitle>
            <CardDescription>{t('general_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('platform_name')}</label>
                <input type="text" value={sysSettings.platform_name} onChange={e => handleChange('platform_name', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('support_email')}</label>
                <input type="email" value={sysSettings.support_email} onChange={e => handleChange('support_email', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_number')}</label>
                <input type="tel" value={sysSettings.phone_number} onChange={e => handleChange('phone_number', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                <input type="text" value={sysSettings.address} onChange={e => handleChange('address', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <Button disabled={saving} onClick={() => saveSettings(['platform_name', 'support_email', 'phone_number', 'address'])} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" /> {t('save_settings')}
            </Button>
          </CardContent>
        </Card>

        {/* Security / Policies */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" /> {t('security_settings')}
            </CardTitle>
            <CardDescription>{t('security_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('user_registration')}</label>
                <select value={sysSettings.user_registration} onChange={e => handleChange('user_registration', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="open">{t('open')}</option>
                  <option value="invite">{t('invite_only')}</option>
                  <option value="closed">{t('closed')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('property_auto_approval')}</label>
                <select value={sysSettings.property_auto_approval} onChange={e => handleChange('property_auto_approval', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="yes">{t('enabled')}</option>
                  <option value="no">{t('disabled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('two_factor_auth')}</label>
                <select value={sysSettings.two_factor_auth} onChange={e => handleChange('two_factor_auth', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="required">{t('required')}</option>
                  <option value="optional">{t('optional')}</option>
                  <option value="disabled">{t('disabled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('session_timeout')}</label>
                <select value={sysSettings.session_timeout} onChange={e => handleChange('session_timeout', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="30">30 {t('minutes')}</option>
                  <option value="60">1 {t('hour')}</option>
                  <option value="240">4 {t('hours')}</option>
                  <option value="1440">24 {t('hours')}</option>
                </select>
              </div>
            </div>
            <Button disabled={saving} variant="outline" onClick={() => saveSettings(['user_registration', 'property_auto_approval', 'two_factor_auth', 'session_timeout'])}>
              <Save className="h-4 w-4 mr-2" /> {t('update_security')}
            </Button>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" /> {t('email_settings')}
            </CardTitle>
            <CardDescription>{t('email_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_host')}</label>
                <input type="text" value={sysSettings.smtp_host} onChange={e => handleChange('smtp_host', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_port')}</label>
                <input type="text" value={sysSettings.smtp_port} onChange={e => handleChange('smtp_port', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_user')}</label>
                <input type="text" value={sysSettings.smtp_user} onChange={e => handleChange('smtp_user', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('smtp_password')}</label>
                <input type="password" value={sysSettings.smtp_password} onChange={e => handleChange('smtp_password', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled={saving} onClick={() => saveSettings(['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password'])}>
                <Save className="h-4 w-4 mr-2" /> Save SMTP Config
              </Button>
              <Button disabled={testEmailing} variant="secondary" onClick={handleTestEmail}>
                <Mail className={`h-4 w-4 mr-2 ${testEmailing ? 'animate-pulse' : ''}`} /> {t('test_email')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-xs hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" /> {t('notification_settings')}
            </CardTitle>
            <CardDescription>{t('notification_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'email_notifications', label: t('email_notifications'), desc: t('email_notifications_desc') },
              { id: 'sms_notifications', label: t('sms_notifications'), desc: t('sms_notifications_desc') },
              { id: 'push_notifications', label: t('push_notifications'), desc: t('push_notifications_desc') },
              { id: 'booking_updates', label: t('booking_updates'), desc: t('booking_updates_desc') },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={sysSettings[item.id] === 'true'}
                    onChange={e => handleChange(item.id, e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                </label>
              </div>
            ))}
            <Button disabled={saving} onClick={() => saveSettings(['email_notifications', 'sms_notifications', 'push_notifications', 'booking_updates'])}>
              <Save className="h-4 w-4 mr-2" /> {t('save_notifications')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
