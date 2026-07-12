import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CardSkeleton } from '@/components/ui/loading'
import { Save, RefreshCw, FileText, Image, Upload, X, Plus, Edit, Trash2, Building, Eye, AlertCircle, Globe, Loader2, Key, Camera, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { sendAccountNotification } from '@/lib/email'
import { profileApi } from '@/lib/api'
import toast from 'react-hot-toast'
import type { CmsPage } from '@/types'

type Section = 'general' | 'branding' | 'pages' | 'account'

const TABS: { key: Section; labelKey: string; icon: typeof Building }[] = [
  { key: 'general', labelKey: 'general_settings', icon: Building },
  { key: 'branding', labelKey: 'branding', icon: Image },
  { key: 'pages', labelKey: 'cms_pages', icon: FileText },
  { key: 'account', labelKey: 'account_settings', icon: User },
]

function SectionCard({ title, description, icon: Icon, children }: { title: string; description?: string; icon: typeof Building; children: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm shadow-sm transition-colors dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none ${
          error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  )
}

function UploadZone({ label, accept, currentUrl, onUpload, onRemove, uploading, uploadLabel }: {
  label: string; accept: string; currentUrl: string; onUpload: (file: File) => void; onRemove: () => void; uploading: boolean; uploadLabel: string
}) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onUpload(file)
  }, [onUpload])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {currentUrl ? (
        <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="p-4 flex items-center gap-4">
            {accept.startsWith('image') ? (
              <img src={currentUrl} alt="" className="h-16 w-auto object-contain rounded-lg" />
            ) : (
              <div className="h-16 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400">
                <Image className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{currentUrl.split('/').pop()}</p>
              <p className="text-xs text-gray-500 truncate">{currentUrl}</p>
            </div>
            <button onClick={onRemove} className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-all ${
            dragOver
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className={`rounded-full p-3 ${dragOver ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">Click to browse or drag & drop</p>
          </div>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f) }} />
        </div>
      )}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
        </div>
      )}
    </div>
  )
}

export function SuperAdminSettings() {
  const { t } = useTranslation()
  const [section, setSection] = useState<Section>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // General
  const [platformName, setPlatformName] = useState('Rwanda EasyRent')
  const [supportEmail, setSupportEmail] = useState('support@rwanda-easyrent.com')
  const [phoneNumber, setPhoneNumber] = useState('+250 788 000 000')
  const [address, setAddress] = useState('Kigali, Rwanda')
  const [generalDirty, setGeneralDirty] = useState(false)
  const [generalErrors, setGeneralErrors] = useState<Record<string, string>>({})

  // Branding
  const [heroBgUrl, setHeroBgUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)

  // Pages
  const [pages, setPages] = useState<CmsPage[]>([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [editPage, setEditPage] = useState<CmsPage | null>(null)
  const [showPageModal, setShowPageModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true })
  const [pageErrors, setPageErrors] = useState<Record<string, string>>({})

  // Account
  const { profile: accountProfile, user: accountUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(undefined)
  const [accountForm, setAccountForm] = useState({
    full_name: accountProfile?.full_name || '',
    phone: accountProfile?.phone || '',
    national_id: accountProfile?.national_id || '',
    province: accountProfile?.province || '',
    district: accountProfile?.district || '',
    sector: accountProfile?.sector || '',
    cell: accountProfile?.cell || '',
    village: accountProfile?.village || '',
    address: accountProfile?.address || '',
    bio: accountProfile?.bio || '',
  })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [savingAccount, setSavingAccount] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('settings').select('key, value') as { data: { key: string; value: string }[] | null }
      if (data) {
        const map: Record<string, string> = {}
        for (const row of data) map[row.key] = row.value
        if (map.platform_name) setPlatformName(map.platform_name)
        if (map.support_email) setSupportEmail(map.support_email)
        if (map.phone_number) setPhoneNumber(map.phone_number)
        if (map.address) setAddress(map.address)
        if (map.hero_background) setHeroBgUrl(map.hero_background)
        if (map.logo_url) setLogoUrl(map.logo_url)
        if (map.favicon_url) setFaviconUrl(map.favicon_url)
      }
    } catch { toast.error(t('failed_to_load_settings')) }
    setLoading(false)
  }, [t])

  useEffect(() => { fetchAll(); fetchPages() }, [fetchAll])

  const fetchPages = async () => {
    setPagesLoading(true)
    try {
      const { data } = await supabase.from('cms_pages').select('*').order('created_at', { ascending: false })
      setPages((data || []) as unknown as CmsPage[])
    } catch { setPages([]) }
    setPagesLoading(false)
  }

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
      const keys = ['platform_name', 'support_email', 'phone_number', 'address']
      const values = { platform_name: platformName.trim(), support_email: supportEmail.trim(), phone_number: phoneNumber.trim(), address: address.trim() }
      for (const key of keys) await upsertSetting(key, values[key as keyof typeof values])
      toast.success(t('settings_saved'))
      setGeneralDirty(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_save'))
    }
    setSaving(null)
  }

  const uploadMedia = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage.from('cms').upload(path, file)
    if (uploadError) { toast.error(`${t('upload_failed')}: ${uploadError.message}`); return null }
    const { data: { publicUrl } } = supabase.storage.from('cms').getPublicUrl(path)
    return publicUrl
  }

  const handleUpload = (field: string, folder: string, setter: (v: string) => void) => async (file: File) => {
    setUploading(field)
    try {
      const url = await uploadMedia(file, folder)
      if (url) {
        setter(url)
        await upsertSetting(field, url)
        toast.success(`${t('uploaded')} ${t('successfully')}`)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('upload_failed'))
    }
    setUploading(null)
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
      } else {
        const res = await supabase.from('cms_pages').insert(payload as never)
        error = res.error
      }
      if (error) throw error
      toast.success(editPage ? t('page_updated') : t('page_created'))
      setShowPageModal(false)
      fetchPages()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : t('failed')) }
    setSaving(null)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !accountUser) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `avatars/${accountUser.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await profileApi.update(accountUser.id, { avatar_url: publicUrl } as never)
      setLocalAvatar(publicUrl ?? undefined)
      toast.success(t('profile_updated'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('upload_failed'))
    } finally { setUploadingAvatar(false) }
  }

  const handleProfileUpdate = async () => {
    if (!accountUser) return
    setSavingAccount(true)
    try {
      await profileApi.update(accountUser.id, accountForm as never)
      toast.success(t('profile_updated'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('update_failed'))
    } finally { setSavingAccount(false) }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) { toast.error(t('passwords_do_not_match')); return }
    if (passwordForm.new_password.length < 6) { toast.error(t('password_too_short')); return }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new_password })
      if (error) throw error
      toast.success(t('password_updated'))
      if (accountUser) sendAccountNotification(accountUser.id, 'password_changed')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : t('password_update_failed')) }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('delete_account_confirm'))) return
    try {
      if (accountUser) {
        sendAccountNotification(accountUser.id, 'account_deleted')
        await supabase.from('profiles').delete().eq('user_id', accountUser.id)
        await supabase.auth.signOut()
        window.location.href = '/'
      }
    } catch { toast.error(t('delete_failed')) }
  }

  const deletePage = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('cms_pages').delete().eq('id', deleteTarget)
      if (error) throw error
      toast.success(t('page_deleted'))
      setDeleteTarget(null)
      fetchPages()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_delete'))
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t('settings')}</h1>
            <p className="mt-1.5 text-gray-300 text-sm">{t('manage_platform_settings')}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAll} className="bg-white/10 text-white hover:bg-white/20 border-0">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1.5">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            className={`flex items-center gap-2.5 rounded-lg px-5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              section === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {section === 'general' && (
          <SectionCard title={t('general_settings')} description={t('general_settings_description')} icon={Building}>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label={t('platform_name')}
                value={platformName}
                onChange={v => { setPlatformName(v); setGeneralDirty(true); setGeneralErrors(p => ({ ...p, platformName: '' })) }}
                placeholder="Rwanda EasyRent"
                error={generalErrors.platformName}
              />
              <InputField
                label={t('support_email')}
                value={supportEmail}
                onChange={v => { setSupportEmail(v); setGeneralDirty(true); setGeneralErrors(p => ({ ...p, supportEmail: '' })) }}
                type="email"
                placeholder="support@example.com"
                error={generalErrors.supportEmail}
              />
              <InputField
                label={t('phone_number')}
                value={phoneNumber}
                onChange={v => { setPhoneNumber(v); setGeneralDirty(true) }}
                type="tel"
                placeholder="+250 788 000 000"
              />
              <InputField
                label={t('address')}
                value={address}
                onChange={v => { setAddress(v); setGeneralDirty(true) }}
                placeholder="Kigali, Rwanda"
              />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5">
              <p className="text-xs text-gray-400">{generalDirty ? t('unsaved_changes') : t('all_changes_saved')}</p>
              <Button disabled={saving === 'general'} onClick={saveGeneral}>
                {saving === 'general' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> {t('save_changes')}</>
                )}
              </Button>
            </div>
          </SectionCard>
        )}

        {section === 'branding' && (
          <div className="space-y-6">
            <SectionCard title={t('logo_favicon')} description={t('brand_assets_description')} icon={Image}>
              <div className="grid gap-8 sm:grid-cols-2">
                <UploadZone
                  label={t('site_logo')}
                  accept="image/*"
                  currentUrl={logoUrl}
                  onUpload={handleUpload('logo_url', 'logo', setLogoUrl)}
                  onRemove={async () => { setLogoUrl(''); try { await upsertSetting('logo_url', '') } catch { toast.error(t('failed_to_save')) } }}
                  uploading={uploading === 'logo_url'}
                  uploadLabel={t('upload_logo')}
                />
                <UploadZone
                  label={t('favicon')}
                  accept="image/*"
                  currentUrl={faviconUrl}
                  onUpload={handleUpload('favicon_url', 'favicon', setFaviconUrl)}
                  onRemove={async () => { setFaviconUrl(''); try { await upsertSetting('favicon_url', '') } catch { toast.error(t('failed_to_save')) } }}
                  uploading={uploading === 'favicon_url'}
                  uploadLabel={t('upload_favicon')}
                />
              </div>
            </SectionCard>

            <SectionCard title={t('hero_section')} description={t('hero_section_description')} icon={Eye}>
              <UploadZone
                label={t('hero_background')}
                accept="image/*"
                currentUrl={heroBgUrl}
                onUpload={handleUpload('hero_background', 'hero-bg', setHeroBgUrl)}
                onRemove={async () => { setHeroBgUrl(''); try { await upsertSetting('hero_background', '') } catch { toast.error(t('failed_to_save')) } }}
                uploading={uploading === 'hero_background'}
                uploadLabel={t('upload_image')}
              />
            </SectionCard>

            {/* Preview Card */}
            {(logoUrl || heroBgUrl) && (
              <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4 text-primary-500" />
                    {t('preview')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative" style={{ background: heroBgUrl ? `url(${heroBgUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="bg-black/40 backdrop-brightness-75 p-8">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="h-10 w-auto" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-lg">R</div>
                        )}
                        <div className="h-2 flex-1 max-w-[200px] rounded-full bg-white/20" />
                      </div>
                      <div className="mt-6 space-y-3">
                        <div className="h-6 w-3/4 rounded-md bg-white/20" />
                        <div className="h-3 w-1/2 rounded-md bg-white/10" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {section === 'pages' && (
          <SectionCard title={t('cms_pages')} description={t('manage_cms_pages')} icon={FileText}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('total')}: </span>
                <span className="inline-flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {pages.length}
                </span>
              </div>
              <Button size="sm" onClick={openNewPage} className="shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" /> {t('new_page')}
              </Button>
            </div>

            {pagesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                ))}
              </div>
            ) : pages.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('no_pages_yet')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('create_first_page')}</p>
                <Button size="sm" onClick={openNewPage} className="mt-4">
                  <Plus className="h-4 w-4 mr-1.5" /> {t('new_page')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {pages.map(page => (
                  <div key={page.id} className="group flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all bg-white dark:bg-gray-800/50">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30">
                        <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{page.title}</p>
                          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            page.is_published
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800'
                          }`}>
                            {page.is_published ? t('published') : t('draft')}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400 font-mono">/{page.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => openEditPage(page)} className="text-gray-500 hover:text-primary-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(page.id)} className="text-gray-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {section === 'account' && accountProfile && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title={t('profile_information')} description={t('profile_info_description')} icon={User}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('full_name')}</label>
                    <input type="text" value={accountForm.full_name} onChange={e => setAccountForm(f => ({ ...f, full_name: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('email')}</label>
                    <input type="email" value={accountProfile.email} disabled className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('phone')}</label>
                    <input type="tel" value={accountForm.phone} onChange={e => setAccountForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('national_id')}</label>
                    <input type="text" value={accountForm.national_id} onChange={e => setAccountForm(f => ({ ...f, national_id: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('province')}</label>
                    <input type="text" value={accountForm.province} onChange={e => setAccountForm(f => ({ ...f, province: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('district')}</label>
                    <input type="text" value={accountForm.district} onChange={e => setAccountForm(f => ({ ...f, district: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('sector')}</label>
                    <input type="text" value={accountForm.sector} onChange={e => setAccountForm(f => ({ ...f, sector: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('cell')}</label>
                    <input type="text" value={accountForm.cell} onChange={e => setAccountForm(f => ({ ...f, cell: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('village')}</label>
                    <input type="text" value={accountForm.village} onChange={e => setAccountForm(f => ({ ...f, village: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('address')}</label>
                    <input type="text" value={accountForm.village} onChange={e => setAccountForm(f => ({ ...f, village: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('bio')}</label>
                  <textarea rows={3} value={accountForm.bio} onChange={e => setAccountForm(f => ({ ...f, bio: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                </div>
                <div className="mt-6 flex justify-end border-t border-gray-100 dark:border-gray-800 pt-5">
                  <Button onClick={handleProfileUpdate} disabled={savingAccount}>
                    {savingAccount ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</> : <><Save className="h-4 w-4 mr-2" /> {t('save_changes')}</>}
                  </Button>
                </div>
              </SectionCard>

              <SectionCard title={t('change_password')} description={t('password_description')} icon={Key}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('current_password')}</label>
                    <input type="password" value={passwordForm.current_password} onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('new_password')}</label>
                    <input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('confirm_password')}</label>
                    <input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400" />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5">
                  <button type="button" onClick={async () => {
                    if (!accountProfile?.email) return
                    setSendingReset(true)
                    try {
                      await supabase.auth.resetPasswordForEmail(accountProfile.email, { redirectTo: window.location.origin + '/auth/forgot-password' })
                      toast.success(t('reset_link_sent'))
                    } catch { toast.error(t('password_update_failed')) }
                    setSendingReset(false)
                  }} disabled={sendingReset} className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer disabled:opacity-50">
                    {sendingReset ? t('sending') : t('forgot_password')}
                  </button>
                  <Button variant="outline" onClick={handlePasswordChange}>
                    <Key className="h-4 w-4 mr-2" /> {t('update_password')}
                  </Button>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title={t('profile_photo')} description={t('profile_photo_description')} icon={Camera}>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {(localAvatar ?? accountProfile.avatar_url) ? <AvatarImage src={localAvatar ?? accountProfile.avatar_url ?? undefined} /> : null}
                      <AvatarFallback className="text-2xl">{accountProfile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow hover:bg-primary-700 disabled:opacity-50 cursor-pointer">
                      {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                  <p className="text-xs text-gray-500">{t('click_to_change_photo')}</p>
                  <div className="w-full border-t pt-4 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('account_type')}</span>
                      <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{accountProfile.role}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('member_since')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(accountProfile.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('verified')}</span>
                      <span className={`font-medium ${accountProfile.is_verified ? 'text-emerald-600' : 'text-gray-400'}`}>{accountProfile.is_verified ? t('yes') : t('no')}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <Card className="border-0 shadow-sm ring-1 ring-red-200 dark:ring-red-900 overflow-hidden">
                <CardHeader className="pb-3 border-b border-red-100 dark:border-red-900">
                  <CardTitle className="flex items-center gap-2 text-base text-red-600">
                    <AlertCircle className="h-4 w-4" /> {t('danger_zone')}
                  </CardTitle>
                  <CardDescription className="text-red-500 text-sm">{t('danger_zone_description')}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" /> {t('delete_account')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Page Editor Modal */}
      <Dialog open={showPageModal} onOpenChange={setShowPageModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editPage ? t('edit_page') : t('new_page')}</DialogTitle>
            <DialogDescription>{t('create_edit_page_description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('title')} *</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={e => {
                    const title = e.target.value
                    setPageForm(p => ({
                      ...p,
                      title,
                      slug: editPage ? p.slug : title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    }))
                    setPageErrors(prev => ({ ...prev, title: '' }))
                  }}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none ${
                    pageErrors.title ? 'border-red-400' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  placeholder={t('page_title_placeholder')}
                />
                {pageErrors.title && <p className="mt-1 text-xs text-red-500">{pageErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('slug')} *</label>
                <input
                  type="text"
                  value={pageForm.slug}
                  onChange={e => { setPageForm(p => ({ ...p, slug: e.target.value })); setPageErrors(prev => ({ ...prev, slug: '' })) }}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none ${
                    pageErrors.slug ? 'border-red-400' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  placeholder="about-us"
                />
                <p className="mt-1 text-xs text-gray-400">{t('url_prefix')}/<span className="font-mono text-primary-600">{pageForm.slug || '...'}</span></p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('content')}</label>
              <textarea
                value={pageForm.content}
                onChange={e => setPageForm(p => ({ ...p, content: e.target.value }))}
                rows={8}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400 font-mono"
                placeholder={t('page_content_placeholder')}
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('meta_title')}</label>
                <input
                  type="text"
                  value={pageForm.meta_title}
                  onChange={e => setPageForm(p => ({ ...p, meta_title: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('meta_description')}</label>
                <input
                  type="text"
                  value={pageForm.meta_description}
                  onChange={e => setPageForm(p => ({ ...p, meta_description: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400"
                />
              </div>
            </div>
            <label className="relative inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pageForm.is_published}
                onChange={e => setPageForm(p => ({ ...p, is_published: e.target.checked }))}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('published')}</span>
            </label>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowPageModal(false)}>{t('cancel')}</Button>
            <Button onClick={savePage} disabled={saving === 'page'}>
              {saving === 'page' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> {editPage ? t('update') : t('create')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 mb-2">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl">{t('delete_page')}</DialogTitle>
            <DialogDescription className="text-center">{t('delete_page_warning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-center gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="min-w-[100px]">{t('cancel')}</Button>
            <Button variant="destructive" onClick={deletePage} className="min-w-[100px]">{t('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
