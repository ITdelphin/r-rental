import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CardSkeleton } from '@/components/ui/loading'
import {
  Save, RefreshCw, FileText, Plus, Edit, Trash2,
  Building, AlertCircle, Loader2, Shield, Settings, Clock, User,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import type { CmsPage } from '@/types'

type Section = 'general' | 'operations' | 'pages' | 'history'

const TABS: { key: Section; labelKey: string; icon: typeof Building }[] = [
  { key: 'general', labelKey: 'general_settings', icon: Building },
  { key: 'operations', labelKey: 'operations', icon: Settings },
  { key: 'pages', labelKey: 'cms_pages', icon: FileText },
  { key: 'history', labelKey: 'config_history', icon: Clock },
]

interface FeatureFlag {
  id: string
  key: string
  label: string
  enabled: boolean
  description: string | null
  created_at: string
  updated_at: string
}

interface ConfigHistoryEntry {
  id: string
  actor_email: string
  key: string
  old_value: string | null
  new_value: string
  created_at: string
}

function SectionCard({ title, description, icon: Icon, children }: { title: string; description?: string; icon: typeof Building; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none ${
          error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  )
}

function ToggleSetting({ label, description, enabled, onToggle, disabled }: {
  label: string; description?: string; enabled: boolean; onToggle: () => void; disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export function SuperAdminSettings() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const [section, setSection] = useState<Section>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const [platformName, setPlatformName] = useState('Rwanda EasyRent')
  const [supportEmail, setSupportEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [generalDirty, setGeneralDirty] = useState(false)
  const [generalErrors, setGeneralErrors] = useState<Record<string, string>>({})

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [flagsLoading, setFlagsLoading] = useState(true)

  const [configHistory, setConfigHistory] = useState<ConfigHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const [pages, setPages] = useState<CmsPage[]>([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [editPage, setEditPage] = useState<CmsPage | null>(null)
  const [showPageModal, setShowPageModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true })
  const [pageErrors, setPageErrors] = useState<Record<string, string>>({})

  const logConfigChange = useCallback(async (key: string, oldValue: string | null, newValue: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('config_history').insert({
        actor_email: user.email,
        key,
        old_value: oldValue,
        new_value: newValue,
      } as never)
    } catch {
      // silently fail
    }
  }, [])

  const fetchGeneral = useCallback(async () => {
    const { data } = await supabase.from('settings').select('key, value') as { data: { key: string; value: string }[] | null }
    if (data) {
      const map: Record<string, string> = {}
      for (const row of data) map[row.key] = row.value
      if (map.platform_name) setPlatformName(map.platform_name)
      if (map.support_email) setSupportEmail(map.support_email)
      if (map.phone_number) setPhoneNumber(map.phone_number)
      if (map.address) setAddress(map.address)
    }
  }, [])

  const fetchFlags = useCallback(async () => {
    setFlagsLoading(true)
    try {
      const { data, error } = await supabase.from('feature_flags').select('*').order('key')
      if (error) throw error
      setFeatureFlags((data || []) as FeatureFlag[])
    } catch {
      setFeatureFlags([])
    }
    setFlagsLoading(false)
  }, [])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const { data, error } = await supabase.from('config_history').select('*').order('created_at', { ascending: false }).limit(50)
      if (error) throw error
      setConfigHistory((data || []) as ConfigHistoryEntry[])
    } catch {
      setConfigHistory([])
    }
    setHistoryLoading(false)
  }, [])

  const fetchPages = useCallback(async () => {
    setPagesLoading(true)
    try {
      const { data } = await supabase.from('cms_pages').select('*').order('created_at', { ascending: false })
      setPages((data || []) as unknown as CmsPage[])
    } catch {
      setPages([])
    }
    setPagesLoading(false)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchGeneral(), fetchFlags(), fetchHistory(), fetchPages()])
    setLoading(false)
  }, [fetchGeneral, fetchFlags, fetchHistory, fetchPages])

  useEffect(() => { fetchAll() }, [fetchAll])

  const upsertSetting = async (key: string, value: string) => {
    const { error } = await supabase.from('settings').upsert({ key, value } as never, { onConflict: 'key' })
    if (error) throw error
  }

  const saveGeneral = async () => {
    const errors: Record<string, string> = {}
    if (!platformName.trim()) errors.platformName = t('required')
    if (!supportEmail.trim()) errors.supportEmail = t('required')
    setGeneralErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving('general')
    try {
      const keys = ['platform_name', 'support_email', 'phone_number', 'address'] as const
      const newValues = {
        platform_name: platformName.trim(),
        support_email: supportEmail.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
      }
      for (const key of keys) {
        const { data: existing } = await supabase.from('settings').select('value').eq('key', key).single()
        const oldVal = existing?.value ?? null
        await upsertSetting(key, newValues[key])
        if (oldVal !== newValues[key]) {
          await logConfigChange(key, oldVal, newValues[key])
        }
      }
      toast.success(t('settings_saved'))
      setGeneralDirty(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_save'))
    }
    setSaving(null)
  }

  const toggleFlag = async (flag: FeatureFlag) => {
    const newValue = !flag.enabled
    try {
      const { error } = await supabase.from('feature_flags').update({ enabled: newValue } as never).eq('id', flag.id)
      if (error) throw error
      setFeatureFlags(prev => prev.map(f => f.id === flag.id ? { ...f, enabled: newValue } : f))
      await logConfigChange(`flag:${flag.key}`, String(flag.enabled), String(newValue))
      toast.success(t('feature_flag_updated'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_save'))
    }
  }

  const openNewPage = () => {
    setEditPage(null)
    setPageForm({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true })
    setPageErrors({})
    setShowPageModal(true)
  }

  const openEditPage = (page: CmsPage) => {
    setEditPage(page)
    setPageForm({ title: page.title, slug: page.slug, content: page.content || '', meta_title: page.meta_title || '', meta_description: page.meta_description || '', is_published: page.is_published })
    setPageErrors({})
    setShowPageModal(true)
  }

  const validatePageForm = () => {
    const errors: Record<string, string> = {}
    if (!pageForm.title.trim()) errors.title = t('required')
    if (!pageForm.slug.trim()) errors.slug = t('required')
    setPageErrors(errors)
    return Object.keys(errors).length === 0
  }

  const savePage = async () => {
    if (!validatePageForm()) return
    setSaving('page')
    try {
      const payload = {
        title: pageForm.title.trim(),
        slug: pageForm.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        content: pageForm.content,
        meta_title: pageForm.meta_title,
        meta_description: pageForm.meta_description,
        is_published: pageForm.is_published,
      }
      let error
      if (editPage) {
        const res = await supabase.from('cms_pages').update(payload as never).eq('id', editPage.id)
        error = res.error
        await logConfigChange(`cms_page:${editPage.id}`, editPage.title, payload.title)
      } else {
        const res = await supabase.from('cms_pages').insert(payload as never)
        error = res.error
        await logConfigChange('cms_page:new', null, payload.title)
      }
      if (error) throw error
      toast.success(editPage ? t('page_updated') : t('page_created'))
      setShowPageModal(false)
      fetchPages()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed'))
    }
    setSaving(null)
  }

  const deletePage = async () => {
    if (!deleteTarget) return
    try {
      const page = pages.find(p => p.id === deleteTarget)
      const { error } = await supabase.from('cms_pages').delete().eq('id', deleteTarget)
      if (error) throw error
      await logConfigChange('cms_page:deleted', page?.title ?? deleteTarget, '')
      toast.success(t('page_deleted'))
      setDeleteTarget(null)
      fetchPages()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_delete'))
    }
  }

  if (profile && profile.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-4">
          <Shield className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('access_denied')}</h2>
        <p className="mt-2 text-sm text-gray-500">{t('super_admin_only')}</p>
      </div>
    )
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('manage_platform_settings')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              section === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {section === 'general' && (
          <SectionCard title={t('general_settings')} description={t('general_settings_description')} icon={Building}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={t('platform_name')} value={platformName} onChange={v => { setPlatformName(v); setGeneralDirty(true); setGeneralErrors(p => ({ ...p, platformName: '' })) }} placeholder="Rwanda EasyRent" error={generalErrors.platformName} />
              <InputField label={t('support_email')} value={supportEmail} onChange={v => { setSupportEmail(v); setGeneralDirty(true); setGeneralErrors(p => ({ ...p, supportEmail: '' })) }} type="email" placeholder="delphinngarambe@gmail.com" error={generalErrors.supportEmail} />
              <InputField label={t('phone_number')} value={phoneNumber} onChange={v => { setPhoneNumber(v); setGeneralDirty(true) }} type="tel" placeholder="0782680268" />
              <InputField label={t('address')} value={address} onChange={v => { setAddress(v); setGeneralDirty(true) }} placeholder="Gisenyi, Rwanda" />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <span className="text-xs text-gray-400">{generalDirty ? t('unsaved_changes') : t('all_changes_saved')}</span>
              <Button disabled={saving === 'general'} onClick={saveGeneral}>
                {saving === 'general' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</> : <><Save className="h-4 w-4 mr-2" /> {t('save_changes')}</>}
              </Button>
            </div>
          </SectionCard>
        )}

        {section === 'operations' && (
          <SectionCard title={t('feature_flags')} description={t('feature_flags_description')} icon={Settings}>
            {flagsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                ))}
              </div>
            ) : featureFlags.length === 0 ? (
              <div className="py-12 text-center">
                <Settings className="mx-auto h-8 w-8 text-gray-300" />
                <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">{t('no_feature_flags')}</h3>
                <p className="mt-1 text-xs text-gray-500">{t('create_feature_flags_hint')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {featureFlags.map(flag => (
                  <ToggleSetting
                    key={flag.id}
                    label={flag.label || flag.key}
                    description={flag.description || undefined}
                    enabled={flag.enabled}
                    onToggle={() => toggleFlag(flag)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {section === 'pages' && (
          <SectionCard title={t('cms_pages')} description={t('manage_cms_pages')} icon={FileText}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('total')}:</span>
                <span className="inline-flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 text-sm font-semibold text-primary-700 dark:text-primary-300">{pages.length}</span>
              </div>
              <Button size="sm" onClick={openNewPage}><Plus className="h-4 w-4 mr-1.5" /> {t('new_page')}</Button>
            </div>

            {pagesLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}</div>
            ) : pages.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-300" />
                <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">{t('no_pages_yet')}</h3>
                <p className="mt-1 text-xs text-gray-500">{t('create_first_page')}</p>
                <Button size="sm" onClick={openNewPage} className="mt-3"><Plus className="h-4 w-4 mr-1.5" /> {t('new_page')}</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {pages.map(page => (
                  <div key={page.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{page.title}</p>
                          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            page.is_published ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {page.is_published ? t('published') : t('draft')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">/{page.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEditPage(page)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteTarget(page.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {section === 'history' && (
          <SectionCard title={t('config_history')} description={t('config_history_description')} icon={Clock}>
            {historyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                ))}
              </div>
            ) : configHistory.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="mx-auto h-8 w-8 text-gray-300" />
                <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">{t('no_history_yet')}</h3>
                <p className="mt-1 text-xs text-gray-500">{t('history_will_appear_here')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configHistory.map(entry => (
                  <div key={entry.id} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.actor_email}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(entry.created_at)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-mono text-gray-600 dark:text-gray-400">
                        {entry.key}
                      </span>
                    </div>
                    {(entry.old_value || entry.new_value) && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        {entry.old_value && (
                          <span className="line-through text-red-500/80">{entry.old_value}</span>
                        )}
                        {entry.old_value && entry.new_value && <span>&rarr;</span>}
                        {entry.new_value && (
                          <span className="text-green-600 dark:text-green-400">{entry.new_value}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>

      <Dialog open={showPageModal} onOpenChange={setShowPageModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editPage ? t('edit_page') : t('new_page')}</DialogTitle>
            <DialogDescription>{t('create_edit_page_description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')} *</label>
                <input type="text" value={pageForm.title} onChange={e => { const val = e.target.value; setPageForm(p => ({ ...p, title: val, slug: editPage ? p.slug : val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })); setPageErrors(prev => ({ ...prev, title: '' })) }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none ${pageErrors.title ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder={t('page_title_placeholder')} />
                {pageErrors.title && <p className="mt-1 text-xs text-red-500">{pageErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('slug')} *</label>
                <input type="text" value={pageForm.slug} onChange={e => { setPageForm(p => ({ ...p, slug: e.target.value })); setPageErrors(prev => ({ ...prev, slug: '' })) }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none ${pageErrors.slug ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="about-us" />
                <p className="mt-1 text-xs text-gray-400">{t('url_prefix')}/<span className="text-primary-600 font-mono">{pageForm.slug || '...'}</span></p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content')}</label>
              <textarea value={pageForm.content} onChange={e => setPageForm(p => ({ ...p, content: e.target.value }))} rows={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder={t('page_content_placeholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_title')}</label>
                <input type="text" value={pageForm.meta_title} onChange={e => setPageForm(p => ({ ...p, meta_title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_description')}</label>
                <input type="text" value={pageForm.meta_description} onChange={e => setPageForm(p => ({ ...p, meta_description: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={pageForm.is_published} onChange={e => setPageForm(p => ({ ...p, is_published: e.target.checked }))} className="rounded" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('published')}</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPageModal(false)}>{t('cancel')}</Button>
            <Button onClick={savePage} disabled={saving === 'page'}>
              {saving === 'page' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</> : <><Save className="h-4 w-4 mr-2" /> {editPage ? t('update') : t('create')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('delete_page')}</DialogTitle>
            <DialogDescription>{t('delete_page_warning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('cancel')}</Button>
            <Button variant="destructive" onClick={deletePage}>{t('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
