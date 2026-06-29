import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Bed, Bath, Square, Wifi, Shield, Car, TreePine, Waves, Zap, Droplets, Heart, MessageCircle, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useProperty } from '@/hooks/useProperties'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi, security: Shield, parking: Car, garden: TreePine, swimming_pool: Waves, electricity: Zap, water: Droplets,
}

export function PropertyDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: property, isLoading } = useProperty(id!)
  const [currentImage, setCurrentImage] = useState(0)
  const [bookingMessage, setBookingMessage] = useState('')

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="mt-6 space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Property not found</h2>
        <Button className="mt-4" onClick={() => navigate('/properties')}>{t('back')}</Button>
      </div>
    )
  }

  const images = property.images || []
  const amenities = [
    { key: 'wifi', label: 'Internet', value: property.internet },
    { key: 'security', label: 'Security', value: property.security },
    { key: 'parking', label: 'Parking', value: property.parking },
    { key: 'garden', label: 'Garden', value: property.garden },
    { key: 'swimming_pool', label: 'Swimming Pool', value: property.swimming_pool },
    { key: 'electricity', label: 'Electricity', value: property.electricity },
    { key: 'water', label: 'Water', value: property.water },
  ].filter((a) => a.value)

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    toast.success('Booking request sent!')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
        <ChevronLeft className="h-4 w-4" /> {t('back')}
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
            {images.length > 0 ? (
              <div className="relative aspect-[16/9]">
                <img src={images[currentImage]?.url} alt={property.title} className="h-full w-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white cursor-pointer"><ChevronLeft className="h-5 w-5" /></button>
                    <button onClick={() => setCurrentImage((i) => (i + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white cursor-pointer"><ChevronRight className="h-5 w-5" /></button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={`h-2 w-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center text-gray-400">
                <Square className="h-20 w-20" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{property.title}</h1>
                  {property.is_featured && <Badge variant="success">{t('featured')}</Badge>}
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /> {property.village}, {property.cell}, {property.sector}, {property.district}, {property.province}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{formatPrice(property.price)}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                {property.deposit && <p className="text-sm text-gray-500">{t('deposit')}: {formatPrice(property.deposit)}</p>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-y py-4 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm"><Bed className="h-4 w-4 text-gray-400" /> {property.bedrooms} {t('bedrooms')}</div>
              <div className="flex items-center gap-2 text-sm"><Bath className="h-4 w-4 text-gray-400" /> {property.bathrooms} {t('bathrooms')}</div>
              <Badge>{property.category}</Badge>
              <Badge variant="secondary">{property.property_type}</Badge>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('description')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{property.description}</p>
            </div>

            {amenities.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('amenities')}</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity.key]
                    return (
                      <div key={amenity.key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {Icon && <Icon className="h-4 w-4 text-primary-600" />}
                        {amenity.label}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {property.reviews && property.reviews.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('reviews')} ({property.reviews.length})</h2>
                <div className="mt-3 space-y-4">
                  {property.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b pb-4 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                            {review.user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{review.user?.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('book_now')}</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('message')}</label>
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Tell the owner about yourself and your interest..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <Button className="w-full" onClick={handleBooking}>
                <Calendar className="h-4 w-4" /> {t('book_now')}
              </Button>
              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4" /> {t('send_message')}
              </Button>
              <Button variant="ghost" className="w-full">
                <Heart className="h-4 w-4" /> {t('save_favorite')}
              </Button>
            </CardContent>
          </Card>

          {property.owner && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('owner')}</h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                    {property.owner.full_name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{property.owner.full_name}</p>
                    <p className="text-sm text-gray-500">{property.owner.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(property.latitude && property.longitude) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('location')}</h3>
                <div className="mt-3 h-48 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-500">
                  Map: {property.latitude}, {property.longitude}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
