import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCompareStore } from '@/store/compareStore'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl as unknown as string
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
import { useTranslation } from 'react-i18next'
import { MapPin, Home, SlidersHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SEO } from '@/components/SEO'
import { breadcrumbLD } from '@/lib/seo-data'
import { useProperties } from '@/hooks/useProperties'
import { formatPrice } from '@/lib/utils'

const provinces = ['kigali', 'eastern', 'western', 'northern', 'southern']
const propertyTypes = ['house', 'apartment', 'villa', 'cottage', 'studio', 'commercial']
const categories = ['rent', 'sale', 'short_term']

export function PropertiesPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || searchParams.get('search') || searchParams.get('query') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [priceMin, setPriceMin] = useState<string>('')
  const [priceMax, setPriceMax] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'beds_desc'>('newest')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const pageSize = 6
  const { data: properties, isLoading } = useProperties({ ...filters, status: 'published' })
  const { toggleItem: toggleCompare, isInCompare, items: compareItems } = useCompareStore()

  // Sync search from URL (homepage hero search -> /properties?q=...)
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || searchParams.get('query') || ''
    if (q !== searchQuery) setSearchQuery(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value.trim())
    else {
      next.delete('q')
      next.delete('search')
      next.delete('query')
    }
    setSearchParams(next, { replace: true })
  }

  const toggleFilter = (key: string, value: string) => {
    setFilters((prev) => {
      if (prev[key] === value) {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setPriceMin('')
    setPriceMax('')
    setSortBy('newest')
    setPage(1)
    const next = new URLSearchParams(searchParams)
    next.delete('q'); next.delete('search'); next.delete('query')
    setSearchParams(next, { replace: true })
  }

  const q = searchQuery.trim().toLowerCase()
  const min = priceMin ? Number(priceMin) : null
  const max = priceMax ? Number(priceMax) : null
  const filteredSorted = (properties?.filter((p) => {
    if (!q) return true
    const haystack = [
      p.title,
      p.description,
      p.district,
      p.province,
      p.sector,
      p.cell,
      p.village,
      p.category,
      p.property_type,
      String(p.bedrooms),
      String(p.bathrooms),
      String(p.price),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return q.split(/\s+/).every((word) => haystack.includes(word))
  }) || [])
    .filter((p) => {
      if (min !== null && p.price < min) return false
      if (max !== null && p.price > max) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'beds_desc') return b.bedrooms - a.bedrooms
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  useEffect(() => {
    setPage(1)
  }, [q, filters, priceMin, priceMax, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = filteredSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const filteredProperties = paginated

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SEO
        title="Browse Properties for Rent in Rwanda | Houses & Apartments | EasyRent"
        description="Find houses, apartments, and rooms for rent across Rwanda. Filter by location, price, bedrooms, and amenities."
        structuredData={breadcrumbLD([
          { name: 'Home', url: '/' },
          { name: 'Properties', url: '/properties' },
        ])}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('properties')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{filteredSorted.length} {t('properties_found')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('search_properties')}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t('filter')}</h3>
              <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer">{t('clear_filters')}</button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('province')}</label>
                <div className="flex flex-wrap gap-2">
                  {provinces.map((p) => (
                    <button key={p} onClick={() => toggleFilter('province', p)} className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer ${filters.province === p ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}`}>{t(p)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button key={c} onClick={() => toggleFilter('category', c)} className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer ${filters.category === c ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}`}>{t(c)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('property_type')}</label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((pt) => (
                    <button key={pt} onClick={() => toggleFilter('property_type', pt)} className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer ${filters.property_type === pt ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}]`}>{t(pt)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('bedrooms')}</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, '5+'].map((b) => (
                    <button key={String(b)} onClick={() => toggleFilter('bedrooms', String(b))} className={`rounded-full px-3 py-1 text-xs font-medium border cursor-pointer ${filters.bedrooms === String(b) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}`}>{b}</button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('price_range', 'Price range (RWF)')} </label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} placeholder={t('min_price', 'Min')} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
                  <span className="text-gray-400">—</span>
                  <input type="number" min={0} placeholder={t('max_price', 'Max')} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
                  {(priceMin || priceMax) && (
                    <button onClick={() => { setPriceMin(''); setPriceMax('') }} className="text-xs text-primary-600 hover:underline whitespace-nowrap">{t('clear', 'Clear')}</button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredSorted.length} {t('properties_found')}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100'}`}>{t('grid', 'Grid')}</button>
            <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 text-sm ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100'}`}>{t('map', 'Map')}</button>
          </div>
          <label className="text-sm text-gray-600 dark:text-gray-400">{t('sort_by', 'Sort by')}:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as never)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800">
            <option value="newest">{t('newest', 'Newest')}</option>
            <option value="price_asc">{t('price_low_high', 'Price: Low to High')}</option>
            <option value="price_desc">{t('price_high_low', 'Price: High to Low')}</option>
            <option value="beds_desc">{t('most_bedrooms', 'Most Bedrooms')}</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="aspect-[16/10] animate-pulse bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[600px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            {filteredSorted.filter((p) => p.latitude && p.longitude).length > 0 ? (
              <MapContainer center={[-1.94, 29.87]} zoom={8} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {filteredSorted.filter((p) => p.latitude && p.longitude).map((p) => (
                  <Marker key={p.id} position={[p.latitude as number, p.longitude as number]}>
                    <Popup>
                      <div className="w-48">
                        <img src={p.images?.[0]?.url || ''} alt={p.title} className="h-24 w-full rounded object-cover" />
                        <div className="mt-2 text-sm font-semibold">{p.title}</div>
                        <div className="text-xs text-gray-500">{p.district}, {p.province}</div>
                        <div className="mt-1 text-sm font-bold text-primary-600">{formatPrice(p.price)}/{t('mo')}</div>
                        <Link to={`/properties/${p.id}`} className="mt-2 block text-center text-xs text-primary-600 hover:underline">{t('view_property', 'View')}</Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">{t('no_map_data', 'No properties with location data for map view')}</div>
            )}
          </div>
        ) : filteredProperties && filteredProperties.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => {
                const inCompare = isInCompare(property.id)
                return (
                <Link key={property.id} to={`/properties/${property.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md h-full group">
                    <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 relative">
                      {property.images?.[0] ? (
                        <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-12 w-12" /></div>
                      )}
                      <Badge className="absolute left-3 top-3 bg-black/60 text-white border-0">{property.category}</Badge>
                      {property.is_featured && <Badge className="absolute right-3 top-3 bg-amber-500 text-white border-0">{t('featured')}</Badge>}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!inCompare && compareItems.length >= 4) return; toggleCompare(property) }}
                        className={`absolute bottom-2 right-2 rounded-full px-2.5 py-1 text-xs font-medium shadow backdrop-blur-sm border ${inCompare ? 'bg-primary-600 text-white border-primary-600' : 'bg-white/90 text-gray-800 border-gray-200 hover:bg-white'}`}
                      >
                        {inCompare ? '✓ ' + t('selected', 'Selected') : '+ ' + t('compare', 'Compare')}
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{property.title}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3 w-3" /> {property.district}, {property.province}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatPrice(property.price)}/{t('mo')}</span>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{property.bedrooms} {t('bed')}</span>
                          <span>{property.bathrooms} {t('bath')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                )})}
            </div>
            {filteredSorted.length > pageSize && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>{t('previous', 'Previous')}</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium ${n === currentPage ? 'bg-primary-600 text-white' : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 7 && <span className="text-sm text-gray-400">…{totalPages}</span>}
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>{t('next', 'Next')}</Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <Home className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('no_results')}</h3>
            <p className="mt-2 text-sm text-gray-500">{t('try_adjusting_search')}</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>{t('clear_filters')}</Button>
          </div>
        )}
      </div>
    </div>
  )
}
