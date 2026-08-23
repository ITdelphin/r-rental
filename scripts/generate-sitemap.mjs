import { writeFileSync } from 'fs'

const SITE_URL = process.env.VITE_SITE_URL || 'https://rwanda-easyrent.vercel.app'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

async function fetchProperties() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('generate-sitemap: no SUPABASE env, skipping dynamic URLs')
    return []
  }
  try {
    const url = `${SUPABASE_URL}/rest/v1/properties?select=id,updated_at&status=eq.published&order=updated_at.desc&limit=1000`
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } })
    if (!res.ok) throw new Error(`supabase ${res.status}`)
    const data = await res.json()
    return data.map((p) => ({ id: p.id, lastmod: (p.updated_at || new Date().toISOString()).slice(0, 10) }))
  } catch (e) {
    console.warn('generate-sitemap: fetch failed', e.message)
    return []
  }
}

const staticUrls = [
  { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${SITE_URL}/properties`, changefreq: 'daily', priority: '0.9' },
  { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.6' },
  { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.6' },
  { loc: `${SITE_URL}/faq`, changefreq: 'monthly', priority: '0.5' },
  { loc: `${SITE_URL}/privacy`, changefreq: 'yearly', priority: '0.3' },
  { loc: `${SITE_URL}/terms`, changefreq: 'yearly', priority: '0.3' },
]

async function main() {
  const props = await fetchProperties()
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    ...staticUrls.map((u) => ({ ...u, lastmod: today })),
    ...props.map((p) => ({ loc: `${SITE_URL}/properties/${p.id}`, lastmod: p.lastmod, changefreq: 'weekly', priority: '0.7' })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`
  writeFileSync('public/sitemap.xml', xml)
  console.log(`generate-sitemap: wrote ${urls.length} urls (${props.length} properties) to public/sitemap.xml`)
}

main()
