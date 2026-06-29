import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Home, MessageCircle, Key, Star, Shield, MapPin, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProperties } from '@/hooks/useProperties'
import { formatPrice } from '@/lib/utils'

const steps = [
  { icon: Search, titleKey: 'step_1_title', descKey: 'step_1_desc' },
  { icon: MessageCircle, titleKey: 'step_2_title', descKey: 'step_2_desc' },
  { icon: Key, titleKey: 'step_3_title', descKey: 'step_3_desc' },
]

const features = [
  { icon: Shield, title: 'Secure Platform', desc: 'Verified properties and secure transactions' },
  { icon: MapPin, title: 'Location Based', desc: 'Find properties in any province of Rwanda' },
  { icon: Star, title: 'Trusted Reviews', desc: 'Real reviews from real tenants' },
]

const stats = [
  { value: '5,000+', key: 'stat_properties' },
  { value: '10,000+', key: 'stat_tenants' },
  { value: '2,000+', key: 'stat_owners' },
  { value: '30+', key: 'stat_cities' },
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

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
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
            <span>Kigali</span> <span>Musanze</span> <span>Rubavu</span> <span>Huye</span> <span>Nyagatare</span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('how_it_works')}</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Three simple steps to find your perfect rental</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/50">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {properties && properties.length > 0 && (
        <section className="bg-gray-50 py-16 dark:bg-gray-900/50 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('featured_properties')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Hand-picked properties for you</p>
              </div>
              <Link to="/properties" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                {t('view_all')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 6).map((property) => (
                <Link key={property.id} to={`/properties/${property.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 relative">
                      {property.images?.[0] ? (
                        <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400"><Home className="h-12 w-12" /></div>
                      )}
                      <Badge className="absolute left-3 top-3">{property.category}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{property.title}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3 w-3" /> {property.district}, {property.province}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">{formatPrice(property.price)}/mo</span>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{property.bedrooms} bed</span>
                          <span>{property.bathrooms} bath</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border p-6 dark:border-gray-700">
                <feature.icon className="h-8 w-8 text-primary-600" />
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 text-center text-white lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.key}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-primary-200">{t(stat.key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">{t('testimonials_title')}</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {testimonials.map((tItem, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">&ldquo;{t(tItem.textKey)}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 border-t pt-4 dark:border-gray-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">{t(tItem.nameKey).charAt(0)}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t(tItem.nameKey)}</p>
                      <p className="text-xs text-gray-500">{t(tItem.roleKey)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Ready to Find Your Home?</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Join thousands of happy tenants and property owners in Rwanda.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/auth/register')}>{t('sign_up')}</Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/properties')}>{t('browse') || 'Browse Properties'}</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
