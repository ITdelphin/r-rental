import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

const SITE_URL = 'https://rwanda-easyrent.vercel.app'
const DEFAULT_IMAGE = '/images/easyrentlogo.jpeg'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  structuredData?: object | object[]
  noIndex?: boolean
}

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  structuredData,
  noIndex = false,
}: SEOProps) {
  const { i18n } = useTranslation()
  const currentLang = i18n.language
  const currentUrl = url || `${SITE_URL}${window.location.pathname}`
  const ogImage = image?.startsWith('http') ? image : `${SITE_URL}${image || DEFAULT_IMAGE}`

  const langAlternates = ['en', 'rw', 'fr', 'sw'].map((lang) => {
    const url = new URL(window.location.href)
    url.searchParams.set('lang', lang)
    return {
      lang,
      href: url.toString(),
    }
  })

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}

      <html lang={currentLang} />

      {/* Canonical */}
      <link rel="canonical" href={currentUrl} />

      {/* Hreflang alternates */}
      {langAlternates.map((alt) => (
        <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="EasyRent" />
      <meta property="og:url" content={currentUrl} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={currentLang === 'rw' ? 'rw_RW' : currentLang === 'fr' ? 'fr_FR' : currentLang === 'sw' ? 'sw_KE' : 'en_US'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@EasyRentRW" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(
            Array.isArray(structuredData) ? structuredData : [structuredData]
          )}
        </script>
      )}
    </Helmet>
  )
}
