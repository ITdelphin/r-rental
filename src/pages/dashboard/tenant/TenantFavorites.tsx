import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ListSkeleton } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Heart, Home, MapPin, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Favorite {
  id: string
  title: string
  price: string
  location: string
  beds: number
  baths: number
}

const mockFavorites: Favorite[] = [
  { id: '1', title: 'Modern Apartment in Kicukiro', price: 'RWF 250,000', location: 'Kicukiro, Kigali', beds: 2, baths: 1 },
  { id: '2', title: 'Villa with Pool in Musanze', price: 'RWF 500,000', location: 'Musanze, Northern', beds: 4, baths: 3 },
]

export function TenantFavorites() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Favorite[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFavorites(mockFavorites)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_favorites')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('saved_properties_description')}</p>
        </div>
      </div>

      {loading ? (
        <ListSkeleton items={2} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('no_favorites_yet')}
          description={t('no_favorites_description')}
          actionLabel={t('browse_properties')}
          onAction={() => window.location.href = '/properties'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((fav) => (
            <Card key={fav.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{fav.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" /> {fav.location}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                      <span>{fav.beds} {t('beds')}</span>
                      <span>{fav.baths} {t('baths')}</span>
                    </div>
                    <p className="mt-2 text-lg font-bold text-primary-600">{fav.price}/{t('mo')}</p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => handleRemove(fav.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
