import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Building2, Plus, Edit, Trash2, MapPin, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Property {
  id: string
  title: string
  status: string
  price: string
  location: string
  views: number
}

const mockProperties: Property[] = [
  { id: '1', title: 'Modern Apartment in Kicukiro', status: 'published', price: 'RWF 250,000', location: 'Kicukiro, Kigali', views: 245 },
  { id: '2', title: 'Villa with Pool in Musanze', status: 'pending_approval', price: 'RWF 500,000', location: 'Musanze, Northern', views: 89 },
  { id: '3', title: 'Studio in Kimihurura', status: 'draft', price: 'RWF 150,000', location: 'Kimihurura, Kigali', views: 0 },
]

const statusConfig: Record<string, { variant: 'default' | 'warning' | 'success' | 'danger' | 'secondary'; label: string }> = {
  published: { variant: 'success', label: 'Published' },
  pending_approval: { variant: 'warning', label: 'Pending' },
  draft: { variant: 'secondary', label: 'Draft' },
  rejected: { variant: 'danger', label: 'Rejected' },
  rented: { variant: 'default', label: 'Rented' },
  sold: { variant: 'default', label: 'Sold' },
}

export function OwnerProperties() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setProperties(mockProperties)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_properties')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_properties')}</p>
        </div>
        <Button><Plus className="h-4 w-4" /> {t('add_property')}</Button>
      </div>

      {loading ? (
        <ListSkeleton items={3} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('no_properties_listed')}
          description={t('no_properties_description')}
          actionLabel={t('add_property')}
          onAction={() => {}}
        />
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const config = statusConfig[prop.status] || statusConfig.draft
            return (
              <Card key={prop.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/50 shrink-0">
                        <Building2 className="h-6 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{prop.title}</h3>
                          <Badge variant={config.variant}>{t(config.label.toLowerCase())}</Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3 shrink-0" /> {prop.location}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-sm">
                          <span className="font-medium text-primary-600">{prop.price}/{t('mo')}</span>
                          <span className="text-gray-400">{prop.views} {t('views')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
