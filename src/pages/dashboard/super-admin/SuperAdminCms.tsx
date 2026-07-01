import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ListSkeleton } from '@/components/ui/loading'
import { FileText, Plus, Edit, Globe, Palette, Eye, Trash2, Upload, Image, Video, Save, X, Check, RefreshCw, Link } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { CmsPage } from '@/types'

type Tab = 'pages' | 'media' | 'theme'

export function SuperAdminCms() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('pages')
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<CmsPage[]>([])
  const [editPage, setEditPage] = useState<CmsPage | null>(null)
  const [showPageModal, setShowPageModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true })
  const [uploadingHero, setUploadingHero] = useState(false)
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState('')
  const [heroVideoUrl, setHeroVideoUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#38BDF8')
  const heroBgRef = useRef<HTMLInputElement>(null)
  const heroVideoRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPages()
    fetchSettings()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('cms_pages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setPages((data || []) as unknown as CmsPage[])
    } catch {
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('key, value')
      if (data) {
        for (const row of data as { key: string; value: string }[]) {
          if (row.key === 'hero_background') setHeroBackgroundUrl(row.value)
          if (row.key === 'hero_video') setHeroVideoUrl(row.value)
          if (row.key === 'logo_url') setLogoUrl(row.value)
          if (row.key === 'favicon_url') setFaviconUrl(row.value)
          if (row.key === 'primary_color') setPrimaryColor(row.value)
        }
      }
    } catch {}
  }

  const openNewPage = () => {
    setEditPage(null)
    setPageForm({ title: '', slug: '', content: '', meta_title: '', meta_description: '', is_published: true })
    setShowPageModal(true)
  }

  const openEditPage = (page: CmsPage) => {
    setEditPage(page)
    setPageForm({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published,
    })
    setShowPageModal(true)
  }

  const savePage = async () => {
    if (!pageForm.title || !pageForm.slug) {
      toast.error('Title and slug are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: pageForm.title,
        slug: pageForm.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        content: pageForm.content,
        meta_title: pageForm.meta_title,
        meta_description: pageForm.meta_description,
        is_published: pageForm.is_published,
      }
      if (editPage) {
        const { error } = await supabase.from('cms_pages').update(payload as never).eq('id', editPage.id)
        if (error) throw error
        toast.success('Page updated')
      } else {
        const { error } = await supabase.from('cms_pages').insert(payload as never)
        if (error) throw error
        toast.success('Page created')
      }
      setShowPageModal(false)
      fetchPages()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const deletePage = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('cms_pages').delete().eq('id', deleteTarget)
      if (error) throw error
      toast.success('Page deleted')
      setDeleteTarget(null)
      fetchPages()
    } catch {
      toast.error('Failed to delete page')
    }
  }

  const uploadMedia = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `cms/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    try {
      const { error } = await supabase.storage.from('cms').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('cms').getPublicUrl(path)
      return publicUrl
    } catch {
      toast.error(`Failed to upload ${folder}`)
      return null
    }
  }

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    const url = await uploadMedia(file, 'hero-bg')
    if (url) {
      setHeroBackgroundUrl(url)
      await supabase.from('settings').upsert({ key: 'hero_background', value: url } as never, { onConflict: 'key' })
      toast.success('Hero background updated')
    }
    setUploadingHero(false)
  }

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    const url = await uploadMedia(file, 'hero-video')
    if (url) {
      setHeroVideoUrl(url)
      await supabase.from('settings').upsert({ key: 'hero_video', value: url } as never, { onConflict: 'key' })
      toast.success('Hero video updated')
    }
    setUploadingHero(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadMedia(file, 'logo')
    if (url) {
      setLogoUrl(url)
      await supabase.from('settings').upsert({ key: 'logo_url', value: url } as never, { onConflict: 'key' })
      toast.success('Logo updated')
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadMedia(file, 'favicon')
    if (url) {
      setFaviconUrl(url)
      await supabase.from('settings').upsert({ key: 'favicon_url', value: url } as never, { onConflict: 'key' })
      toast.success('Favicon updated')
    }
  }

  const saveColor = async () => {
    try {
      await supabase.from('settings').upsert({ key: 'primary_color', value: primaryColor } as never, { onConflict: 'key' })
      toast.success('Primary color saved')
    } catch {
      toast.error('Failed to save color')
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'pages', label: 'Pages', icon: FileText },
    { key: 'media', label: 'Media & Branding', icon: Image },
    { key: 'theme', label: 'Theme', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CMS Control Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage pages, media, and branding across the platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-1 dark:border-gray-700">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
              tab === key
                ? 'bg-white text-primary-600 border-x border-t border-gray-200 dark:bg-gray-800 dark:text-primary-400 dark:border-gray-700'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Pages Tab */}
      {tab === 'pages' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{pages.length} pages</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchPages}><RefreshCw className="h-4 w-4" /> Refresh</Button>
              <Button size="sm" onClick={openNewPage}><Plus className="h-4 w-4" /> New Page</Button>
            </div>
          </div>

          {loading ? (
            <ListSkeleton items={5} />
          ) : pages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-gray-500">No pages yet. Create your first CMS page.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y dark:divide-gray-700">
                  {pages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{page.title}</p>
                          <p className="text-xs text-gray-500 truncate">/{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          page.is_published
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => openEditPage(page)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteTarget(page.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Media & Branding Tab */}
      {tab === 'media' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5 text-primary-500" /> Hero Background</CardTitle>
              <CardDescription>Background image shown on the homepage hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {heroBackgroundUrl && (
                <div className="relative aspect-[21/9] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <img src={heroBackgroundUrl} alt="Hero background" className="h-full w-full object-cover" />
                  <button onClick={() => setHeroBackgroundUrl('')} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 cursor-pointer"><X className="h-4 w-4" /></button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input ref={heroBgRef} type="file" accept="image/*" className="hidden" onChange={handleHeroBgUpload} disabled={uploadingHero} />
                <Button variant="outline" onClick={() => heroBgRef.current?.click()} disabled={uploadingHero}>
                  {uploadingHero ? 'Uploading...' : <><Upload className="h-4 w-4" /> Upload Image</>}
                </Button>
                {heroBackgroundUrl && (
                  <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(heroBackgroundUrl); toast.success('URL copied') }} title="Copy URL">
                    <Link className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary-500" /> Hero Video</CardTitle>
              <CardDescription>Optional background video for the hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {heroVideoUrl && (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <video src={heroVideoUrl} controls className="h-full w-full" />
                  <button onClick={() => setHeroVideoUrl('')} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 cursor-pointer"><X className="h-4 w-4" /></button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input ref={heroVideoRef} type="file" accept="video/*" className="hidden" onChange={handleHeroVideoUpload} disabled={uploadingHero} />
                <Button variant="outline" onClick={() => heroVideoRef.current?.click()} disabled={uploadingHero}>
                  {uploadingHero ? 'Uploading...' : <><Upload className="h-4 w-4" /> Upload Video</>}
                </Button>
                {heroVideoUrl && (
                  <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(heroVideoUrl); toast.success('URL copied') }} title="Copy URL">
                    <Link className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5 text-primary-500" /> Site Logo</CardTitle>
              <CardDescription>Brand logo displayed in the navigation bar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logoUrl && (
                <div className="flex items-center gap-4 rounded-lg border p-4 dark:border-gray-700">
                  <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => setLogoUrl('')} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <Button variant="outline" onClick={() => logoRef.current?.click()}><Upload className="h-4 w-4" /> Upload Logo</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Link className="h-5 w-5 text-primary-500" /> Favicon</CardTitle>
              <CardDescription>Browser tab icon (recommended: 32x32 PNG or SVG)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faviconUrl && (
                <div className="flex items-center gap-4 rounded-lg border p-4 dark:border-gray-700">
                  <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => setFaviconUrl('')} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
              <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
              <Button variant="outline" onClick={() => faviconRef.current?.click()}><Upload className="h-4 w-4" /> Upload Favicon</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Theme Tab */}
      {tab === 'theme' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary-500" /> Brand Colors</CardTitle>
              <CardDescription>Customize the platform's primary color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {['#38BDF8', '#0F172A', '#10B981', '#22C55E', '#FACC15', '#EF4444'].map(c => (
                  <button
                    key={c}
                    onClick={() => setPrimaryColor(c)}
                    className="h-8 w-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <Button onClick={saveColor}><Save className="h-4 w-4" /> Save Color</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary-500" /> SEO Defaults</CardTitle>
              <CardDescription>Global meta tags for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Meta Title</label>
                <input type="text" defaultValue="Rwanda EasyRent - Find Your Perfect Home" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Meta Description</label>
                <textarea rows={3} defaultValue="Rwanda EasyRent is the leading platform for renting houses, apartments, and properties across Rwanda." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <Button><Save className="h-4 w-4" /> Save SEO</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page Editor Modal */}
      <Dialog open={showPageModal} onOpenChange={setShowPageModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editPage ? 'Edit Page' : 'New Page'}</DialogTitle>
            <DialogDescription>Create or edit a CMS page for the public website</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={e => setPageForm(p => ({ ...p, title: e.target.value, slug: editPage ? p.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. About Us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input
                  type="text"
                  value={pageForm.slug}
                  onChange={e => setPageForm(p => ({ ...p, slug: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. about-us"
                />
                <p className="mt-1 text-xs text-gray-400">URL path: /{pageForm.slug || '...'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <textarea
                value={pageForm.content}
                onChange={e => setPageForm(p => ({ ...p, content: e.target.value }))}
                rows={8}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Page content (HTML supported)..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={pageForm.meta_title}
                  onChange={e => setPageForm(p => ({ ...p, meta_title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
                <input
                  type="text"
                  value={pageForm.meta_description}
                  onChange={e => setPageForm(p => ({ ...p, meta_description: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={pageForm.is_published}
                onChange={e => setPageForm(p => ({ ...p, is_published: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">Published</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPageModal(false)}>Cancel</Button>
            <Button onClick={savePage} disabled={saving}>
              {saving ? 'Saving...' : <><Save className="h-4 w-4" /> {editPage ? 'Update' : 'Create'}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>Are you sure you want to delete this page? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deletePage}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
