import { useTranslation } from 'react-i18next'
import { useCompareStore } from '@/store/compareStore'
import { formatPrice } from '@/lib/utils'
import { X, BarChart3, Bed, Bath, Maximize, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './button'
import type { Property } from '@/types'

export function CompareBar() {
  const { t } = useTranslation()
  const { items, removeItem, clearItems } = useCompareStore()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {items.length} {items.length === 1 ? t('property') : t('properties')} {t('selected')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {items.length >= 2 && (
              <Link to={`/compare?ids=${items.map((p: Property) => p.id).join(',')}`}>
                <Button size="sm">{t('compare_now')}</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={clearItems}>
              {t('clear_all')}
            </Button>
          </div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {items.map((property: Property) => (
            <div
              key={property.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <img
                src={property.images?.[0]?.url || '/images/placeholder.svg'}
                alt={property.title}
                className="h-10 w-10 rounded object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[120px]">
                  {property.title}
                </p>
                <p className="text-xs text-primary-600">{formatPrice(property.price)}</p>
              </div>
              <button
                onClick={() => removeItem(property.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ComparePage() {
  const { t } = useTranslation()
  const { items, removeItem } = useCompareStore()

  if (items.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('compare_properties')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('select_at_least_two_properties')}
        </p>
      </div>
    )
  }

  const amenities = Array.from(
    new Set(items.flatMap((p: Property) => p.amenities?.map((a) => a.name) || []))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('compare_properties')}
        </h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-48 bg-gray-50 dark:bg-gray-800 p-3 text-left text-sm font-medium text-gray-500" />
              {items.map((property: Property) => (
                <th key={property.id} className="min-w-[200px] p-3">
                  <div className="relative">
                    <button
                      onClick={() => removeItem(property.id)}
                      className="absolute -right-1 -top-1 rounded-full bg-gray-100 p-1 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <Link to={`/properties/${property.id}`}>
                      <img
                        src={property.images?.[0]?.url || '/images/placeholder.svg'}
                        alt={property.title}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {property.title}
                      </h3>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-500 dark:bg-gray-800">
                {t('price')} ({t('rwf')}/{t('month')})
              </td>
              {items.map((p: Property) => (
                <td key={p.id} className="p-3 text-center text-sm font-semibold text-primary-600">
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-500 dark:bg-gray-800">
                <div className="flex items-center gap-1"><Bed className="h-4 w-4" /> {t('bedrooms')}</div>
              </td>
              {items.map((p: Property) => (
                <td key={p.id} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                  {p.bedrooms}
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-500 dark:bg-gray-800">
                <div className="flex items-center gap-1"><Bath className="h-4 w-4" /> {t('bathrooms')}</div>
              </td>
              {items.map((p: Property) => (
                <td key={p.id} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                  {p.bathrooms}
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-500 dark:bg-gray-800">
                <div className="flex items-center gap-1"><Maximize className="h-4 w-4" /> {t('bedrooms')}</div>
              </td>
              {items.map((p: Property) => (
                <td key={p.id} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                  {p.bedrooms || '-'}
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-500 dark:bg-gray-800">
                <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {t('location')}</div>
              </td>
              {items.map((p: Property) => (
                <td key={p.id} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                  {p.district}, {p.province}
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-500 dark:bg-gray-800">
                <div className="flex items-center gap-1"><Star className="h-4 w-4" /> {t('rating')}</div>
              </td>
              {items.map((p: Property) => (
                <td key={p.id} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                  {p.reviews?.length ? (p.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / p.reviews.length).toFixed(1) : '-'}
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-500 dark:bg-gray-800">
                {t('type')}
              </td>
              {items.map((p: Property) => (
                <td key={p.id} className="p-3 text-center text-sm capitalize text-gray-900 dark:text-gray-100">
                  {p.property_type || p.category}
                </td>
              ))}
            </tr>
            {amenities.slice(0, 8).map((amenity: string) => (
              <tr key={amenity} className="border-t border-gray-200 dark:border-gray-700">
                <td className="sticky left-0 z-10 bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800">
                  {amenity}
                </td>
                {items.map((p: Property) => (
                  <td key={p.id} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">
                    {p.amenities?.some((a) => a.name === amenity) ? '✓' : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
