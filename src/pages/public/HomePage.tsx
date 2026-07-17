import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Home, MessageCircle, Key, Heart, Star, Shield, MapPin, ChevronRight, Building, Users, Award, MapPinned } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProperties } from '@/hooks/useProperties'
import { formatPrice } from '@/lib/utils'
import { getSettings } from '@/lib/settings'

const steps = [
  { icon: Search, titleKey: 'step_1_title', descKey: 'step_1_desc' },
  { icon: MessageCircle, titleKey: 'step_2_title', descKey: 'step_2_desc' },
  { icon: Key, titleKey: 'step_3_title', descKey: 'step_3_desc' },
  { icon: Heart, titleKey: 'step_4_title', descKey: 'step_4_desc' },
]

const features = [
  { icon: Shield, titleKey: 'secure_platform', descKey: 'secure_platform_desc' },
  { icon: MapPin, titleKey: 'location_based', descKey: 'location_based_desc' },
  { icon: Star, titleKey: 'trusted_reviews', descKey: 'trusted_reviews_desc' },
]

const stats = [
  { icon: Building, value: '5,000+', key: 'stat_properties' },
  { icon: Users, value: '10,000+', key: 'stat_tenants' },
  { icon: Award, value: '2,000+', key: 'stat_owners' },
  { icon: MapPinned, value: '30+', key: 'stat_cities' },
]

const testimonials = [
  { textKey: 'testimonial_1', nameKey: 'testimonial_1_name', roleKey: 'testimonial_1_role' },
  { textKey: 'testimonial_2', nameKey: 'testimonial_2_name', roleKey: 'testimonial_2_role' },
  { textKey: 'testimonial_3', nameKey: 'testimonial_3_name', roleKey: 'testimonial_3_role' },
]

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: properties } = useProperties({ status: 'published', is_featured: true })
  const [heroBg, setHeroBg] = useState('/images/1.jpg')

  useEffect(() => {
    getSettings().then(s => {
      if (s.hero_background) setHeroBg(s.hero_background)
    })
  }, [])

  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('${heroBg}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-gray-950/50" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{t('hero_title')}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">{t('hero_subtitle')}</p>
          <div className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-full bg-white p-1 shadow-lg">
            <div className="flex flex-1 items-center gap-2 px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input type="text" placeholder={t('search_properties')} className="w-full border-0 bg-transparent py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400" />
            </div>
            <Button onClick={() => navigate('/properties')} className="rounded-full px-8">{t('search')}</Button>
          </div>
          <div className="mt-8 flex justify-center gap-4 text-sm text-primary-200">
            <span>{t('kigali')}</span> <span>{t('musanze')}</span> <span>{t('rubavu')}</span> <span>{t('huye')}</span> <span>{t('nyagatare')}</span>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">{t('how_it_works')}</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">{t('how_it_works')}</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('how_it_works_subtitle')}</p>
          </div>
          <div className="mt-16 grid gap-8 grid-cols-2">
            {steps.map((step, i) => (
              <div key={i} className="group relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/30 dark:group-hover:bg-primary-900/50">
                  <step.icon className="h-9 w-9" />
                </div>
                <div className="absolute left-1/2 top-10 -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-lg">
                  {i + 1}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {properties && properties.length > 0 && (
        <section className="bg-gray-50 py-20 dark:bg-gray-900/50 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <Badge variant="secondary" className="mb-4">{t('featured_listings')}</Badge>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">{t('featured_properties')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('featured_listings_subtitle')}</p>
              </div>
              <Link to="/properties" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                {t('view_all')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 6).map((property) => {
                const rating = property.reviews?.length
                  ? (property.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / property.reviews.length).toFixed(1)
                  : null
                return (
                <Link key={property.id} to={`/properties/${property.id}`} className="group block">
                  <Card className="overflow-hidden border-0 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 rounded-2xl">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      {property.images?.[0] ? (
                        <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-12 w-12" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <Badge className="absolute left-3 top-3 bg-white/90 text-gray-800 backdrop-blur-sm border-0 shadow-sm">
                        {property.category}
                      </Badge>
                      {property.is_featured && (
                        <Badge className="absolute right-3 top-3 bg-amber-500 text-white border-0 shadow-lg">
                          {t('featured')}
                        </Badge>
                      )}
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-xl font-bold text-white drop-shadow-lg">
                          {formatPrice(property.price)}
                          <span className="text-sm font-normal text-white/80">/{t('mo')}</span>
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors text-base leading-snug">
                        {property.title}
                      </h3>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" /> {property.district}, {property.province}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> {property.bedrooms} {t('beds')}</span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="flex items-center gap-1">{/* bath icon */} {property.bathrooms} {t('baths')}</span>
                        {rating && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="flex items-center gap-1 text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-current" /> {rating}
                            </span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                )}
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">{t('why_choose_us')}</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">{t('why_choose_us_title')}</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('why_choose_us_subtitle')}</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.titleKey} className="group rounded-2xl border border-gray-200 p-8 transition-all duration-300 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50 dark:border-gray-700 dark:hover:border-primary-800 dark:hover:shadow-primary-900/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/30 dark:group-hover:bg-primary-900/50">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">{t(feature.titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-600 py-20">
        <div className="absolute inset-0 bg-[url('/images/3.jfif')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-12 text-center text-white lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.key} className="group">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="mt-4 text-4xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-primary-200">{t(stat.key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">{t('testimonials_title')}</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">{t('testimonials_title')}</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('testimonials_subtitle')}</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {testimonials.map((tItem, i) => (
              <Card key={i} className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400 italic">&ldquo;{t(tItem.textKey)}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3 border-t pt-6 dark:border-gray-700">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-md">
                      {t(tItem.nameKey).charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t(tItem.nameKey)}</p>
                      <p className="text-xs text-gray-500">{t(tItem.roleKey)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 py-20">
        <div className="absolute inset-0 bg-[url('/images/4.jfif')] bg-cover bg-center opacity-5" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white hover:bg-white/20">{t('get_started')}</Badge>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('ready_to_find_home')}</h2>
          <p className="mt-4 text-lg text-gray-300">{t('ready_to_find_home_desc')}</p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl" onClick={() => navigate('/auth/register')}>
              {t('sign_up')}
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/properties')}>
              {t('browse_properties')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
