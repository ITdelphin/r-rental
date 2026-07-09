import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CardSkeleton } from '@/components/ui/loading'
import { Settings, Shield, Mail, Bell, Save, RefreshCw, Palette, FileText, Image, Upload, X, Plus, Edit, Trash2, Building, Eye, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { CmsPage } from '@/types'

type Section = 'general' | 'branding' | 'pages' | 'security' | 'email' | 'notifications'

const btnCls = "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
const activeBtnCls = "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
const inactiveBtnCls = "text-gray-600 dark:text-gray-400 border border-transparent"

function SectionNav({ section, setSection, sections }: { section: Section; setSection: (s: Section) => void; sections: { key: Section; label: string; icon: typeof Settings }[] }) {
  return (
    <nav className="space-y-1 lg:w-56 shrink-0">
      {sections.map(s => (
        <button key={s.key} onClick={() => setSection(s.key)} className={`${btnCls} ${section === s.key ? activeBtnCls : inactiveBtnCls}`}>
          <s.icon className="h-4 w-4 shrink-0" />
          <span>{s.label}</span>
          <ChevronRight className={`h-3.5 w-3.5 ml-auto transition ${section === s.key ? 'opacity-100' : 'opacity-0'}`} />
        </button>
      ))}
    </nav>
  )
}

function SectionCard({ title, description, icon: Icon, children }: { title: string; description?: string; icon: typeof Settings; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
    </div>
  )
}

export function SuperAdminSettings() {
  const { t } = useTranslation()
  const [section, setSection] = useState<Section>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const sections: { key: Section; label: string; icon: typeof Settings }[] = [
    { key: 'general', label: t('general_settings'), icon: Building },
    { key: 'branding', label: t('branding'), icon: Palette },
    { key: 'pages', label: t('cms_pages'), icon: FileText },
    { key: 'security', label: t('security_settings'), icon: Shield },
    { key: 'email', label: t('email_settings'), icon: Mail },
    { key: 'notifications', label: t('notification_settings'), icon: Bell },
  ]

  // General
  const [platformName, setPlatformName] = useState('Rwanda EasyRent')
  const [supportEmail, setSupportEmail] = useState('support@rwanda-easyrent.com')
  const [phoneNumber, setPhoneNumber] = useState('+250 788 000 000')
  const [address, setAddress] = useState('Kigali, Rwanda')

  // Security
  const [userRegistration, setUserRegistration] = useState('open')
  const [propertyAutoApproval, setPropertyAutoApproval] = useState('no')
  const [twoFactorAuth, setTwoFactorAuth] = useState('optional')
  const [sessionTimeout, setSessionTimeout] = useState('1440')

  // Email
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [bookingUpdates, setBookingUpdates] = useState(true)

  // Branding
  const [heroBgUrl, setHeroBgUrl] = useState('')
  const [heroVideoUrl, setHeroVideoUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#38BDF8')
  const [uploading, setUploading] = useState('')
  const heroBgRef = useRef<HTMLInputElement>(null)
  const heroVideoRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)

  // Pages
  const [pages, setPages] = useState<CmsPage[]>([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [editPage, setEditPage] = useState<CmsPage | null>(null)
  const [showPageModal, setShowPageModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true })

  const fetchAll = async () => {
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
        if (map.user_registration) setUserRegistration(map.user_registration)
        if (map.property_auto_approval) setPropertyAutoApproval(map.property_auto_approval)
        if (map.two_factor_auth) setTwoFactorAuth(map.two_factor_auth)
        if (map.session_timeout) setSessionTimeout(map.session_timeout)
        if (map.smtp_host) setSmtpHost(map.smtp_host)
        if (map.smtp_port) setSmtpPort(map.smtp_port)
        if (map.smtp_user) setSmtpUser(map.smtp_user)
        if (map.smtp_password) setSmtpPassword(map.smtp_password)
        if (map.email_notifications) setEmailNotifs(map.email_notifications === 'true')
        if (map.sms_notifications) setSmsNotifs(map.sms_notifications === 'true')
        if (map.push_notifications) setPushNotifs(map.push_notifications === 'true')
        if (map.booking_updates) setBookingUpdates(map.booking_updates === 'true')
        if (map.hero_background) setHeroBgUrl(map.hero_background)
        if (map.hero_video) setHeroVideoUrl(map.hero_video)
        if (map.logo_url) setLogoUrl(map.logo_url)
        if (map.favicon_url) setFaviconUrl(map.favicon_url)
        if (map.primary_color) setPrimaryColor(map.primary_color)
      }
    } catch { toast.error(t('failed_to_load_settings')) }
    setLoading(false)
  }

  useEffect(() => { fetchAll(); fetchPages() }, [])

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

  const deleteSetting = async (key: string) => {
    const { error } = await supabase.from('settings').delete().eq('key', key)
    if (error) throw error
  }

  const saveSettings = async (keys: string[], getValue: (key: string) => string) => {
    setSaving(true)
    try {
      for (const key of keys) await upsertSetting(key, getValue(key))
      toast.success(t('settings_saved'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_save'))
    }
    setSaving(false)
  }

  const uploadMedia = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('cms').upload(path, file)
    if (error) { toast.error(`${t('upload_failed')}: ${error.message}`); return null }
    const { data: { publicUrl } } = supabase.storage.from('cms').getPublicUrl(path)
    return publicUrl
  }

  const handleUpload = (field: string, folder: string, ref: React.RefObject<HTMLInputElement | null>) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(field)
    try {
      const url = await uploadMedia(file, folder)
      if (url) {
        const setters: Record<string, (v: string) => void> = {
          hero_background: setHeroBgUrl,
          hero_video: setHeroVideoUrl,
          logo_url: setLogoUrl,
          favicon_url: setFaviconUrl,
        }
        setters[field]?.(url)
        await upsertSetting(field, url)
        toast.success(`${folder} ${t('updated')}`)
        if (ref.current) ref.current.value = ''
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('upload_failed'))
    }
    setUploading('')
  }

  const openNewPage = () => {
    setEditPage(null)
    setPageForm({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true })
    setShowPageModal(true)
  }

  const openEditPage = (page: CmsPage) => {
    setEditPage(page)
    setPageForm({ title: page.title, slug: page.slug, content: page.content || '', meta_title: page.meta_title || '', meta_description: page.meta_description || '', is_published: page.is_published })
    setShowPageModal(true)
  }

  const savePage = async () => {
    if (!pageForm.title || !pageForm.slug) { toast.error(t('title_slug_required')); return }
    setSaving(true)
    try {
      const payload = { title: pageForm.title, slug: pageForm.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), content: pageForm.content, meta_title: pageForm.meta_title, meta_description: pageForm.meta_description, is_published: pageForm.is_published }
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
    setSaving(false)
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

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h1><CardSkeleton /><CardSkeleton /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_platform_settings')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll}><RefreshCw className={`h-4 w-4${loading ? ' animate-spin' : ''}`} /> {t('refresh')}</Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <SectionNav section={section} setSection={setSection} sections={sections} />

        <div className="flex-1 min-w-0 space-y-6">
          {section === 'general' && (
            <SectionCard title={t('general_settings')} description={t('general_settings_description')} icon={Building}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField label={t('platform_name')} value={platformName} onChange={setPlatformName} placeholder="Rwanda EasyRent" />
                <InputField label={t('support_email')} value={supportEmail} onChange={setSupportEmail} type="email" placeholder="support@example.com" />
                <InputField label={t('phone_number')} value={phoneNumber} onChange={setPhoneNumber} type="tel" placeholder="+250 788 000 000" />
                <InputField label={t('address')} value={address} onChange={setAddress} placeholder="Kigali, Rwanda" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button disabled={saving} onClick={() => saveSettings(['platform_name', 'support_email', 'phone_number', 'address'], k => ({ platform_name: platformName, support_email: supportEmail, phone_number: phoneNumber, address }[k] || ''))}>
                  <Save className="h-4 w-4 mr-2" /> {t('save')}
                </Button>
              </div>
            </SectionCard>
          )}

          {section === 'branding' && (
            <div className="space-y-6">
              <SectionCard title={t('logo_favicon')} description={t('brand_assets_description')} icon={Image}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('site_logo')}</label>
                    {logoUrl && (
                      <div className="flex items-center gap-4 rounded-lg border p-3 dark:border-gray-700">
                        <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
                        <button onClick={async () => { setLogoUrl(''); try { await upsertSetting('logo_url', '') } catch { toast.error(t('failed_to_save')) } }} className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleUpload('logo_url', 'logo', logoRef)} />
                    <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={uploading === 'logo_url'}>{uploading === 'logo_url' ? `${t('uploading')}...` : <><Upload className="h-4 w-4 mr-2" /> {t('upload_logo')}</>}</Button>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('favicon')}</label>
                    {faviconUrl && (
                      <div className="flex items-center gap-4 rounded-lg border p-3 dark:border-gray-700">
                        <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                        <button onClick={async () => { setFaviconUrl(''); try { await upsertSetting('favicon_url', '') } catch { toast.error(t('failed_to_save')) } }} className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                    <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={handleUpload('favicon_url', 'favicon', faviconRef)} />
                    <Button variant="outline" size="sm" onClick={() => faviconRef.current?.click()} disabled={uploading === 'favicon_url'}>{uploading === 'favicon_url' ? `${t('uploading')}...` : <><Upload className="h-4 w-4 mr-2" /> {t('upload_favicon')}</>}</Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title={t('hero_section')} description={t('hero_section_description')} icon={Eye}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('hero_background')}</label>
                    {heroBgUrl && (
                      <div className="relative aspect-[21/9] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        <img src={heroBgUrl} alt="Hero" className="h-full w-full object-cover" />
                        <button onClick={async () => { setHeroBgUrl(''); try { await upsertSetting('hero_background', '') } catch { toast.error(t('failed_to_save')) } }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                    <input ref={heroBgRef} type="file" accept="image/*" className="hidden" onChange={handleUpload('hero_background', 'hero-bg', heroBgRef)} />
                    <Button variant="outline" size="sm" onClick={() => heroBgRef.current?.click()} disabled={uploading === 'hero_background'}>{uploading === 'hero_background' ? `${t('uploading')}...` : <><Upload className="h-4 w-4 mr-2" /> {t('upload_image')}</>}</Button>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('hero_video')}</label>
                    {heroVideoUrl && (
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        <video src={heroVideoUrl} controls className="h-full w-full" />
                        <button onClick={async () => { setHeroVideoUrl(''); try { await upsertSetting('hero_video', '') } catch { toast.error(t('failed_to_save')) } }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 cursor-pointer"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                    <input ref={heroVideoRef} type="file" accept="video/*" className="hidden" onChange={handleUpload('hero_video', 'hero-video', heroVideoRef)} />
                    <Button variant="outline" size="sm" onClick={() => heroVideoRef.current?.click()} disabled={uploading === 'hero_video'}>{uploading === 'hero_video' ? `${t('uploading')}...` : <><Upload className="h-4 w-4 mr-2" /> {t('upload_video')}</>}</Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title={t('brand_colors')} description={t('brand_colors_description')} icon={Palette}>
                <div className="flex items-center gap-4">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer shrink-0" />
                  <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['#38BDF8', '#0F172A', '#10B981', '#22C55E', '#FACC15', '#EF4444', '#8B5CF6', '#EC4899'].map(c => (
                    <button key={c} onClick={() => setPrimaryColor(c)} className="h-8 w-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button disabled={saving} onClick={async () => { await upsertSetting('primary_color', primaryColor); toast.success(t('color_saved')) }}>
                    <Save className="h-4 w-4 mr-2" /> {t('save_color')}
                  </Button>
                </div>
              </SectionCard>
            </div>
          )}

          {section === 'pages' && (
            <SectionCard title={t('cms_pages')} description={t('manage_cms_pages')} icon={FileText}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{pages.length} {t('pages')}</span>
                <Button size="sm" onClick={openNewPage}><Plus className="h-4 w-4 mr-2" /> {t('new_page')}</Button>
              </div>
              {pagesLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}</div>
              ) : pages.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <FileText className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">{t('no_pages_yet')}</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700 rounded-lg border dark:border-gray-700">
                  {pages.map(page => (
                    <div key={page.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{page.title}</p>
                          <p className="text-xs text-gray-500">/{page.slug}</p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${page.is_published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {page.is_published ? t('published') : t('draft')}
                        </span>
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

          {section === 'security' && (
            <SectionCard title={t('security_settings')} description={t('security_settings_description')} icon={Shield}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('user_registration')}</label>
                  <select value={userRegistration} onChange={e => setUserRegistration(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="open">{t('open')}</option>
                    <option value="invite">{t('invite_only')}</option>
                    <option value="closed">{t('closed')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('property_auto_approval')}</label>
                  <select value={propertyAutoApproval} onChange={e => setPropertyAutoApproval(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="yes">{t('enabled')}</option>
                    <option value="no">{t('disabled')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('two_factor_auth')}</label>
                  <select value={twoFactorAuth} onChange={e => setTwoFactorAuth(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="required">{t('required')}</option>
                    <option value="optional">{t('optional')}</option>
                    <option value="disabled">{t('disabled')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('session_timeout')}</label>
                  <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="30">30 {t('minutes')}</option>
                    <option value="60">1 {t('hour')}</option>
                    <option value="240">4 {t('hours')}</option>
                    <option value="1440">24 {t('hours')}</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button disabled={saving} onClick={() => saveSettings(['user_registration', 'property_auto_approval', 'two_factor_auth', 'session_timeout'], k => ({ user_registration: userRegistration, property_auto_approval: propertyAutoApproval, two_factor_auth: twoFactorAuth, session_timeout: sessionTimeout }[k] || ''))}>
                  <Save className="h-4 w-4 mr-2" /> {t('save')}
                </Button>
              </div>
            </SectionCard>
          )}

          {section === 'email' && (
            <SectionCard title={t('email_settings')} description={t('email_settings_description')} icon={Mail}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField label={t('smtp_host')} value={smtpHost} onChange={setSmtpHost} placeholder="smtp.sendgrid.net" />
                <InputField label={t('smtp_port')} value={smtpPort} onChange={setSmtpPort} placeholder="587" />
                <InputField label={t('smtp_user')} value={smtpUser} onChange={setSmtpUser} placeholder="apikey" />
                <InputField label={t('smtp_password')} value={smtpPassword} onChange={setSmtpPassword} type="password" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button disabled={saving} onClick={() => saveSettings(['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password'], k => ({ smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_password: smtpPassword }[k] || ''))}>
                  <Save className="h-4 w-4 mr-2" /> {t('save_smtp')}
                </Button>
              </div>
            </SectionCard>
          )}

          {section === 'notifications' && (
            <SectionCard title={t('notification_settings')} description={t('notification_settings_description')} icon={Bell}>
              <div className="space-y-3">
                {[
                  { id: 'email_notifications', label: t('email_notifications'), desc: t('email_notifications_desc'), val: emailNotifs, set: setEmailNotifs },
                  { id: 'sms_notifications', label: t('sms_notifications'), desc: t('sms_notifications_desc'), val: smsNotifs, set: setSmsNotifs },
                  { id: 'push_notifications', label: t('push_notifications'), desc: t('push_notifications_desc'), val: pushNotifs, set: setPushNotifs },
                  { id: 'booking_updates', label: t('booking_updates'), desc: t('booking_updates_desc'), val: bookingUpdates, set: setBookingUpdates },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)} className="peer sr-only" />
                      <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button disabled={saving} onClick={() => saveSettings(['email_notifications', 'sms_notifications', 'push_notifications', 'booking_updates'], k => ({ email_notifications: String(emailNotifs), sms_notifications: String(smsNotifs), push_notifications: String(pushNotifs), booking_updates: String(bookingUpdates) }[k] || ''))}>
                  <Save className="h-4 w-4 mr-2" /> {t('save')}
                </Button>
              </div>
            </SectionCard>
          )}
        </div>
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
                <input type="text" value={pageForm.title} onChange={e => setPageForm(p => ({ ...p, title: e.target.value, slug: editPage ? p.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('page_title_placeholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('slug')} *</label>
                <input type="text" value={pageForm.slug} onChange={e => setPageForm(p => ({ ...p, slug: e.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="about-us" />
                <p className="mt-1 text-xs text-gray-400">{t('url_prefix')}/{pageForm.slug || '...'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content')}</label>
              <textarea value={pageForm.content} onChange={e => setPageForm(p => ({ ...p, content: e.target.value }))} rows={8} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('page_content_placeholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_title')}</label>
                <input type="text" value={pageForm.meta_title} onChange={e => setPageForm(p => ({ ...p, meta_title: e.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_description')}</label>
                <input type="text" value={pageForm.meta_description} onChange={e => setPageForm(p => ({ ...p, meta_description: e.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_published" checked={pageForm.is_published} onChange={e => setPageForm(p => ({ ...p, is_published: e.target.checked }))} className="rounded" />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('published')}</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPageModal(false)}>{t('cancel')}</Button>
            <Button onClick={savePage} disabled={saving}>{saving ? `${t('saving')}...` : <><Save className="h-4 w-4 mr-2" /> {editPage ? t('update') : t('create')}</>}</Button>
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
