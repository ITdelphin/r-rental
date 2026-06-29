import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Home, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockFavorites = [
  { id: '1', title: 'Modern Apartment in Kicukiro', price: 'RWF 250,000', location: 'Kicukiro, Kigali', beds: 2, baths: 1 },
  { id: '2', title: 'Villa with Pool in Musanze', price: 'RWF 500,000', location: 'Musanze, Northern', beds: 4, baths: 3 },
]

export function TenantFavorites() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_favorites')}</h1>
      {mockFavorites.length === 0 ? (
        <div className="py-20 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold">No favorites yet</h3>
          <p className="mt-2 text-sm text-gray-500">Save properties you like to view them later.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mockFavorites.map((fav) => (
            <Card key={fav.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{fav.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3 w-3" /> {fav.location}</p>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                      <span>{fav.beds} bed</span><span>{fav.baths} bath</span>
                    </div>
                    <p className="mt-2 text-lg font-bold text-primary-600">{fav.price}/mo</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500"><Heart className="h-5 w-5 fill-current" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
