import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CardSkeleton } from '@/components/ui/loading'
import { Save, RefreshCw, FileText, Image, Upload, X, Plus, Edit, Trash2, Building, Eye, AlertCircle, Globe, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { CmsPage } from '@/types'

type Section = 'general' | 'branding' | 'pages'

const TABS: { key: Section; labelKey: string; icon: typeof Building }[] = [
  { key: 'general', labelKey: 'general_settings', icon: Building },
  { key: 'branding', labelKey: 'branding', icon: Image },
  { key: 'pages', labelKey: 'cms_pages', icon: FileText },
]

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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
          {accept.startsWith('image') ? (
            <img src={currentUrl} alt="" className="h-12 w-auto rounded object-contain" />
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-400"><Image className="h-5 w-5" /></div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{currentUrl.split('/').pop()}</p>
            <p className="text-xs text-gray-500 truncate">{currentUrl}</p>
          </div>
          <button onClick={onRemove} className="shrink-0 rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragOver ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className={`rounded-full p-2.5 ${dragOver ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">Click or drag to upload</p>
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
      {/* Page Header */}
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

      {/* Tab Bar */}
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

      {/* Sections */}
      <div className="space-y-6">
        {section === 'general' && (
          <SectionCard title={t('general_settings')} description={t('general_settings_description')} icon={Building}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={t('platform_name')} value={platformName} onChange={v => { setPlatformName(v); setGeneralDirty(true); setGeneralErrors(p => ({ ...p, platformName: '' })) }} placeholder="Rwanda EasyRent" error={generalErrors.platformName} />
              <InputField label={t('support_email')} value={supportEmail} onChange={v => { setSupportEmail(v); setGeneralDirty(true); setGeneralErrors(p => ({ ...p, supportEmail: '' })) }} type="email" placeholder="support@example.com" error={generalErrors.supportEmail} />
              <InputField label={t('phone_number')} value={phoneNumber} onChange={v => { setPhoneNumber(v); setGeneralDirty(true) }} type="tel" placeholder="+250 788 000 000" />
              <InputField label={t('address')} value={address} onChange={v => { setAddress(v); setGeneralDirty(true) }} placeholder="Kigali, Rwanda" />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <span className="text-xs text-gray-400">{generalDirty ? t('unsaved_changes') : t('all_changes_saved')}</span>
              <Button disabled={saving === 'general'} onClick={saveGeneral}>
                {saving === 'general' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('saving')}...</> : <><Save className="h-4 w-4 mr-2" /> {t('save_changes')}</>}
              </Button>
            </div>
          </SectionCard>
        )}

        {section === 'branding' && (
          <div className="space-y-6">
            <SectionCard title={t('logo_favicon')} description={t('brand_assets_description')} icon={Image}>
              <div className="grid gap-6 sm:grid-cols-2">
                <UploadZone label={t('site_logo')} accept="image/*" currentUrl={logoUrl} onUpload={handleUpload('logo_url', 'logo', setLogoUrl)} onRemove={async () => { setLogoUrl(''); try { await upsertSetting('logo_url', '') } catch { toast.error(t('failed_to_save')) } }} uploading={uploading === 'logo_url'} uploadLabel={t('upload_logo')} />
                <UploadZone label={t('favicon')} accept="image/*" currentUrl={faviconUrl} onUpload={handleUpload('favicon_url', 'favicon', setFaviconUrl)} onRemove={async () => { setFaviconUrl(''); try { await upsertSetting('favicon_url', '') } catch { toast.error(t('failed_to_save')) } }} uploading={uploading === 'favicon_url'} uploadLabel={t('upload_favicon')} />
              </div>
            </SectionCard>

            <SectionCard title={t('hero_section')} description={t('hero_section_description')} icon={Eye}>
              <UploadZone label={t('hero_background')} accept="image/*" currentUrl={heroBgUrl} onUpload={handleUpload('hero_background', 'hero-bg', setHeroBgUrl)} onRemove={async () => { setHeroBgUrl(''); try { await upsertSetting('hero_background', '') } catch { toast.error(t('failed_to_save')) } }} uploading={uploading === 'hero_background'} uploadLabel={t('upload_image')} />
            </SectionCard>

            {(logoUrl || heroBgUrl) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4 text-primary-500" />
                    {t('preview')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-[3/1] overflow-hidden rounded-b-lg bg-gradient-to-r from-primary-600 to-primary-800">
                    {heroBgUrl && <img src={heroBgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative flex h-full items-center p-6">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="h-10 w-auto" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-lg font-bold text-white">R</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
      </div>

      {/* Page Editor Modal */}
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
                <input type="text" value={pageForm.title} onChange={e => { const t = e.target.value; setPageForm(p => ({ ...p, title: t, slug: editPage ? p.slug : t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })); setPageErrors(prev => ({ ...prev, title: '' })) }}
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

      {/* Delete Confirmation */}
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
