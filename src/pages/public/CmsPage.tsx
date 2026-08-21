import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/components/SEO'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, FileText, Calendar, Clock } from 'lucide-react'

interface CmsPageData {
    id: string
    title: string
    slug: string
    content: string
    meta_title?: string
    meta_description?: string
    is_published: boolean
    created_at: string
    updated_at: string
}

export function CmsPage() {
    const { slug } = useParams<{ slug: string }>()
    const { t } = useTranslation()
    const [page, setPage] = useState<CmsPageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        async function fetchPage() {
            if (!slug) return
            setLoading(true)
            setNotFound(false)
            try {
                const { data, error } = await supabase
                    .from('cms_pages')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_published', true)
                    .single()

                if (error || !data) {
                    setNotFound(true)
                } else {
                    setPage(data as unknown as CmsPageData)
                }
            } catch {
                setNotFound(true)
            } finally {
                setLoading(false)
            }
        }

        fetchPage()
    }, [slug])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    if (notFound || !page) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16 text-center">
                <SEO title="Page Not Found | EasyRent" description="The requested page could not be found." />
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <FileText className="h-10 w-10" />
                </div>
                <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">{t('page_not_found', 'Page Not Found')}</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('page_not_found_desc', 'The page you are looking for does not exist or has been unpublished.')}</p>
                <Link to="/" className="mt-6 inline-block">
                    <Button>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('back_to_home', 'Back to Home')}
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <SEO
                title={page.meta_title || `${page.title} | EasyRent`}
                description={page.meta_description || page.content.slice(0, 160)}
            />

            <Link to="/" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {t('back_to_home', 'Back to Home')}
            </Link>

            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-8 text-white">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{page.title}</h1>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-primary-100">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(page.updated_at || page.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {Math.max(1, Math.ceil(page.content.split(' ').length / 200))} min read
                        </span>
                    </div>
                </div>

                <CardContent className="p-8 sm:p-10">
                    <div
                        className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
