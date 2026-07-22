import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Home, SlidersHorizontal, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useProperties } from '@/hooks/useProperties'
import { formatPrice } from '@/lib/utils'

const provinces = ['kigali', 'eastern', 'western', 'northern', 'southern']
const propertyTypes = ['house', 'apartment', 'villa', 'cottage', 'studio', 'commercial']
const categories = ['rent', 'sale', 'short_term']

export function PropertiesPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { data: properties, isLoading } = useProperties({ ...filters, status: 'published' })

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
  }

  const filteredProperties = properties?.filter((p) =>
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.province.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('properties')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{filteredProperties?.length || 0} {t('properties_found')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            </div>
          </CardContent>
        </Card>
      )}

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
        ) : filteredProperties && filteredProperties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Link key={property.id} to={`/properties/${property.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md h-full">
                  <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 relative">
                    {property.images?.[0] ? (
                      <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-12 w-12" /></div>
                    )}
                    <Badge className="absolute left-3 top-3 bg-black/60 text-white border-0">{property.category}</Badge>
                    {property.is_featured && <Badge className="absolute right-3 top-3 bg-amber-500 text-white border-0">{t('featured')}</Badge>}
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
            ))}
          </div>
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
