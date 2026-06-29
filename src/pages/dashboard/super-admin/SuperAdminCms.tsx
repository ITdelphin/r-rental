import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { FileText, Plus, Edit, Globe, Palette, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'

const pages = [
  { name: 'Homepage', slug: 'home', status: 'published' },
  { name: 'Hero Section', slug: 'hero', status: 'published' },
  { name: 'About', slug: 'about', status: 'published' },
  { name: 'Contact', slug: 'contact', status: 'published' },
  { name: 'FAQ', slug: 'faq', status: 'draft' },
  { name: 'Privacy Policy', slug: 'privacy', status: 'published' },
  { name: 'Terms of Service', slug: 'terms', status: 'published' },
]

export function SuperAdminCms() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CMS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_cms_pages')}</p>
        </div>
        <Button><Plus className="h-4 w-4" /> {t('new_page')}</Button>
      </div>

      {loading ? (
        <ListSkeleton items={7} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> {t('editable_pages')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {pages.map((page) => (
                  <div key={page.slug} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <FileText className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{page.name}</p>
                        <p className="text-xs text-gray-500">/{page.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {page.status}
                      </span>
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /> {t('edit')}</Button>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" /> {t('theme_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('primary_color')}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#2563eb" className="h-9 w-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
                      <input type="text" defaultValue="#2563eb" className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('logo_url')}</label>
                    <input type="text" placeholder="https://example.com/logo.png" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('footer_text')}</label>
                    <input type="text" defaultValue="Rwanda EasyRent" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact_email')}</label>
                    <input type="email" defaultValue="info@rwanda-easyrent.com" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                  </div>
                </div>
                <Button>{t('save')}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" /> {t('seo_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_title')}</label>
                  <input type="text" defaultValue="Rwanda EasyRent - Find Your Perfect Home" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('meta_description')}</label>
                  <textarea rows={3} defaultValue="Rwanda EasyRent is the leading platform for renting houses, apartments, and properties across Rwanda." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                </div>
                <Button>{t('save')}</Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
