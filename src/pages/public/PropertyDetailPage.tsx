import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Bed, Bath, Square, Wifi, Shield, Car, TreePine, Waves, Zap, Droplets, Heart, MessageCircle, Calendar, Star, ChevronLeft, ChevronRight, Share2, CookingPot, Sun, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProperty } from '@/hooks/useProperties'
import { useAuth } from '@/hooks/useAuth'
import { propertyApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/email'
import { notifyBookingCreated } from '@/lib/notifications'
import toast from 'react-hot-toast'

const amenityIcons: Record<string, typeof Wifi> = {
  internet: Wifi, security: Shield, parking: Car, garden: TreePine, swimming_pool: Waves, electricity: Zap, water: Droplets, balcony: Sun,
}

export function PropertyDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { data: property, isLoading } = useProperty(id!)
  const [currentImage, setCurrentImage] = useState(0)
  const [bookingMessage, setBookingMessage] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [dateError, setDateError] = useState('')
  const whatsappNumber = property?.whatsapp_number

  useEffect(() => {
    if (property) {
      propertyApi.incrementViews(property.id)
    }
  }, [property])

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('property_not_found')}</h2>
        <Button className="mt-4" onClick={() => navigate('/properties')}>{t('back')}</Button>
      </div>
    )
  }

  const images = property.images || []
  const amenities = [
    { key: 'internet', value: property.internet },
    { key: 'security', value: property.security },
    { key: 'parking', value: property.parking },
    { key: 'garden', value: property.garden },
    { key: 'swimming_pool', value: property.swimming_pool },
    { key: 'electricity', value: property.electricity },
    { key: 'water', value: property.water },
    { key: 'balcony', value: property.balcony },
  ].filter((a) => a.value)

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    if (!bookingMessage.trim()) {
      toast.error(t('please_add_message'))
      return
    }
    if (!checkIn || !checkOut) {
      toast.error(t('please_select_dates'))
      return
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error(t('check_out_after_check_in'))
      return
    }
    setBookingLoading(true)
    setDateError('')
    try {
      const { data: overlapping } = await supabase
        .from('bookings')
        .select('id')
        .eq('property_id', property.id)
        .in('status', ['pending', 'approved'])
        .lte('check_in', checkOut)
        .gte('check_out', checkIn)
        .limit(1)
      if (overlapping && overlapping.length > 0) {
        toast.error(t('property_unavailable_dates'))
        setBookingLoading(false)
        return
      }
      const { data: newBooking, error } = await supabase.from('bookings').insert({
        property_id: property.id,
        tenant_id: user.id,
        owner_id: property.owner_id,
        status: 'pending',
        check_in: checkIn || null,
        check_out: checkOut || null,
        message: bookingMessage,
      } as never).select().single()
      if (error) throw error
      toast.success(t('booking_sent'))
      setBookingMessage('')
      setCheckIn('')
      setCheckOut('')
      if (newBooking) {
        sendBookingNotification((newBooking as { id: string }).id, 'created')
        const bookingId = (newBooking as { id: string }).id
        const sellerId = property?.owner_id || ''
        notifyBookingCreated(bookingId, user.id, sellerId, property?.title || t('property'), bookingMessage)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('booking_failed')
      toast.error(msg)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    setFavoriteLoading(true)
    try {
      if (isFavorited) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', property.id)
        setIsFavorited(false)
        toast.success(t('removed_from_favorites'))
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, property_id: property.id } as never)
        setIsFavorited(true)
        toast.success(t('added_to_favorites'))
      }
    } catch {
      toast.error(t('failed_update_favorites'))
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t('link_copied'))
  }

  const avgRating = property.reviews?.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
        <ChevronLeft className="h-4 w-4" /> {t('back')}
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
            {images.length > 0 ? (
              <div className="relative aspect-[16/9]">
                <img src={images[currentImage]?.url} alt={property.title} className="h-full w-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white cursor-pointer">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => setCurrentImage((i) => (i + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white cursor-pointer">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={`h-2 w-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
                <div className="absolute right-4 top-4 flex gap-2">
                  <button onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white cursor-pointer">
                    <Share2 className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                {images.length > 1 && (
                  <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                    {currentImage + 1}/{images.length}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center text-gray-400">
                <Square className="h-20 w-20" />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`shrink-0 h-16 w-24 overflow-hidden rounded-lg border-2 ${i === currentImage ? 'border-primary-500' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Property Info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{property.title}</h1>
                  {property.is_featured && <Badge variant="success">{t('featured')}</Badge>}
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /> {property.village}, {property.cell ? `${property.cell}, ` : ''}{property.sector}, {property.district}, {property.province}
                </p>
                {avgRating && (
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-1 text-sm text-gray-500">{avgRating} ({property.reviews?.length} {t('reviews')})</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{formatPrice(property.price)}<span className="text-sm font-normal text-gray-500">/{t('mo')}</span></p>
                {property.deposit && <p className="text-sm text-gray-500">{t('deposit')}: {formatPrice(property.deposit)}</p>}
                <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-400"><Eye className="h-3 w-3" /> {property.views_count} {t('views')}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-y py-4 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm"><Bed className="h-4 w-4 text-gray-400" /> {property.bedrooms} {t('bedrooms')}</div>
              <div className="flex items-center gap-2 text-sm"><Bath className="h-4 w-4 text-gray-400" /> {property.bathrooms} {t('bathrooms')}</div>
              {property.kitchen > 0 && <div className="flex items-center gap-2 text-sm"><CookingPot className="h-4 w-4 text-gray-400" /> {property.kitchen} {t('kitchen')}</div>}
              <Badge>{property.category}</Badge>
              <Badge variant="secondary">{property.property_type}</Badge>
              {property.furnished && <Badge variant="secondary">{t('furnished')}</Badge>}
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
                      <div key={amenity.key} className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        {Icon && <Icon className="h-4 w-4 text-primary-600" />}
                        {t(amenity.key)}
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
                    <div key={review.id} className="rounded-lg border border-gray-100 p-4 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                            {review.user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{review.user?.full_name || t('anonymous')}</span>
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

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-4 overflow-hidden border-0 ring-1 ring-gray-200 dark:ring-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calendar className="h-24 w-24 -mr-8 -mt-8" />
              </div>
              <h3 className="text-xl font-bold flex items-center gap-2 relative z-10"><Calendar className="h-5 w-5" /> {t('book_now')}</h3>
              <p className="text-primary-100 text-sm mt-1 relative z-10">{t('secure_your_spot') || 'Request to book this property'}</p>
            </div>
            <CardContent className="p-6 space-y-5 bg-white dark:bg-gray-900">
              {user && profile && (
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-primary-500"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1">{t('your_information') || 'Your Information'}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{profile.full_name}</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {profile.email && <p className="text-xs text-gray-500">{profile.email}</p>}
                    {profile.phone && <p className="text-xs text-gray-500">{profile.phone}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('check_in')}</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={e => { setCheckIn(e.target.value); setDateError('') }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('check_out')}</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={e => { setCheckOut(e.target.value); setDateError('') }}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
              {dateError && <p className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{dateError}</p>}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('message')}</label>
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder={t('tell_owner_about_you')}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all overflow-hidden resize-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="pt-2 space-y-3">
                <Button className="w-full h-12 text-sm font-bold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all rounded-xl" onClick={handleBooking} disabled={bookingLoading}>
                  <Calendar className="h-4 w-4 mr-2" /> {bookingLoading ? t('sending') : t('book_now')}
                </Button>
                <Button
                  variant={isFavorited ? 'default' : 'outline'}
                  className={`w-full h-12 text-sm font-bold rounded-xl transition-all ${isFavorited ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400' : ''}`}
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
                  {isFavorited ? t('saved_to_favorites') : t('save_favorite')}
                </Button>
              </div>
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
                    {property.owner.is_verified && (
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <Shield className="h-3 w-3" /> {t('verified_owner')}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={() => {
                  if (!user) { navigate('/auth/login'); return }
                  const params = new URLSearchParams({
                    to: property.owner_id,
                    name: property.owner?.full_name || t('owner'),
                    property: property.title,
                  })
                  navigate(`/dashboard/messages?${params.toString()}`)
                }}>
                  <MessageCircle className="h-4 w-4" /> {t('send_message')}
                </Button>
                {whatsappNumber && (
                  <Button
                    variant="outline"
                    className="mt-2 w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => {
                      const n = whatsappNumber.replace(/[^0-9]/g, '')
                      const p = property
                      const loc = [p.village, p.cell, p.sector, p.district, p.province].filter(Boolean).join(', ')
                      const desc = p.description ? p.description.substring(0, 200) + (p.description.length > 200 ? '...' : '') : ''
                      const msg = [
                        `*${p.title}*`,
                        `💰 *${t('price')}:* ${formatPrice(p.price)}${p.deposit ? '  |  💳 *' + t('deposit') + ':* ' + formatPrice(p.deposit) : ''}`,
                        `📍 *${t('location')}:* ${loc}`,
                        `🛏 *${t('bedrooms')}:* ${p.bedrooms}  |  🛁 *${t('bathrooms')}:* ${p.bathrooms}  |  🍳 *${t('kitchen')}:* ${p.kitchen}`,
                        desc ? `📝 *${t('description')}:* ${desc}` : '',
                        `🔗 ${t('view_property')}: https://rwanda-easyrent.vercel.app/properties/${p.id}`,
                      ].filter(Boolean).join('\n')
                      window.open(`https://wa.me/${n.startsWith('0') ? '250' + n.slice(1) : n}?text=${encodeURIComponent(msg)}`, '_blank')
                    }}
                  >
                    <MessageCircle className="h-4 w-4" /> {t('whatsapp')}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {(property.latitude && property.longitude) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('location')}</h3>
                <div className="mt-3 h-48 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                  <div className="text-center">
                    <MapPin className="mx-auto h-8 w-8 text-primary-600" />
                    <p className="mt-2 font-medium text-gray-700 dark:text-gray-300">{property.district}, {property.province}</p>
                    <p className="text-xs text-gray-400 mt-1">{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
