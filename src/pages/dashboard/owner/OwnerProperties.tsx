import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Plus, Edit, Trash2, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const mockProperties = [
  { id: '1', title: 'Modern Apartment in Kicukiro', status: 'published', price: 'RWF 250,000', location: 'Kicukiro, Kigali', views: 245 },
  { id: '2', title: 'Villa with Pool in Musanze', status: 'pending_approval', price: 'RWF 500,000', location: 'Musanze, Northern', views: 89 },
  { id: '3', title: 'Studio in Kimihurura', status: 'draft', price: 'RWF 150,000', location: 'Kimihurura, Kigali', views: 0 },
]

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'danger' | 'secondary'> = {
  published: 'success', pending_approval: 'warning', draft: 'secondary', rejected: 'danger', rented: 'default', sold: 'default',
}

export function OwnerProperties() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_properties')}</h1>
        <Button><Plus className="h-4 w-4" /> {t('add_property')}</Button>
      </div>
      {mockProperties.length === 0 ? (
        <div className="py-20 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold">No properties listed</h3>
          <p className="mt-2 text-sm text-gray-500">Add your first property to start renting.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockProperties.map((prop) => (
            <Card key={prop.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><Building2 className="h-5 w-5" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{prop.title}</h3>
                      <Badge variant={statusColors[prop.status]}>{t(prop.status)}</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3 w-3" /> {prop.location}</p>
                    <p className="mt-1 text-sm font-medium text-primary-600">{prop.price}/mo</p>
                    <p className="text-xs text-gray-400">{prop.views} views</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
