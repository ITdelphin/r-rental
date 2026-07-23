import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ListSkeleton } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Heart, Home, MapPin, Trash2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import type { Favorite } from '@/types'
import toast from 'react-hot-toast'

export function TenantFavorites() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Favorite[]>([])

  const fetchFavorites = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, property:properties(id, title, price, district, province, bedrooms, bathrooms, images:property_images(url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setFavorites((data || []) as unknown as Favorite[])
    } catch {
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchFavorites()
  }, [fetchFavorites, user])

  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase.from('favorites').delete().eq('id', id)
      if (error) throw error
      toast.success(t('removed_from_favorites'))
      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch {
      toast.error(t('failed_to_remove_favorite'))
    }
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
          {favorites.map((fav) => {
            const prop = fav.property as unknown as { id: string; title: string; price: number; district: string; province: string; bedrooms: number; bathrooms: number; images?: { url: string }[] }
            if (!prop) return null
            return (
              <Card key={fav.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
                    {prop.images?.[0]?.url ? (
                      <img src={prop.images[0].url} alt={prop.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-10 w-10" /></div>
                    )}
                    <button
                      onClick={() => handleRemove(fav.id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow hover:bg-white dark:bg-gray-800/90 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{prop.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" /> {prop.district}, {prop.province}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{prop.bedrooms} {t('beds')}</span>
                        <span>{prop.bathrooms} {t('baths')}</span>
                      </div>
                      <p className="text-lg font-bold text-primary-600">{formatPrice(prop.price)}/{t('mo')}</p>
                    </div>
                    <Link to={`/properties/${prop.id}`} className="mt-3 block">
                      <Button variant="outline" size="sm" className="w-full">{t('view_property')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
