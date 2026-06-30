import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Plus, Edit, Trash2, MapPin, Eye, Check, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useDeleteProperty, useUpdateProperty } from '@/hooks/useProperties'
import toast from 'react-hot-toast'

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

const mockPropertyDetail: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Modern Apartment in Kicukiro',
    description: 'Beautiful modern apartment with 2 bedrooms and 2 bathrooms, located in the heart of Kicukiro. Features include a fully equipped kitchen, a balcony, underground parking, and 24/7 security.',
    category: 'residential',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    kitchen: 1,
    parking: true,
    balcony: true,
    garden: false,
    swimming_pool: false,
    security: true,
    internet: true,
    water: true,
    electricity: true,
    furnished: false,
    price: 250000,
    deposit: 50000,
    province: 'Kigali',
    district: 'Kicukiro',
    sector: 'Kicukiro',
    cell: 'Kicukiro',
    village: 'Kicukiro City Center',
    latitude: -1.9541,
    longitude: 30.0588,
    status: 'published',
    is_featured: true,
    views_count: 245,
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
    owner: {
      id: 'user1',
      full_name: 'John Doe',
      email: 'john@email.com',
    },
    images: [
      { id: 'img1', property_id: '1', url: 'https://images.unsplash.com/photo-1522708323590-eec8bc1b0db7?q=80&w=2070&auto=format&fit=crop', is_floor_plan: false, sort_order: 0, created_at: '2024-11-15T10:00:00Z' },
      { id: 'img2', property_id: '1', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2070&auto=format&fit=crop', is_floor_plan: false, sort_order: 1, created_at: '2024-11-15T10:00:00Z' },
      { id: 'img3', property_id: '1', url: 'https://images.unsplash.com/photo-1560448204-e02a684c9823?q=80&w=2070&auto=format&fit=crop', is_floor_plan: false, sort_order: 2, created_at: '2024-11-15T10:00:00Z' },
    ],
    amenities: [],
    reviews: [
      { id: 'rev1', property_id: '1', user_id: 'user2', rating: 4, comment: 'Great location!', created_at: '2024-11-20T14:30:00Z', user: { full_name: 'Alice Smith' } },
      { id: 'rev2', property_id: '1', user_id: 'user3', rating: 5, comment: 'Excellent apartment!', created_at: '2024-11-18T09:15:00Z', user: { full_name: 'Bob Johnson' } },
    ],
  },
  '2': {
    id: '2',
    title: 'Villa with Pool in Musanze',
    description: 'Spacious luxury villa with private pool, garden, and stunning views of Musanze mountains. Perfect for families or groups seeking a vacation home experience.',
    category: 'luxury',
    property_type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    kitchen: 1,
    parking: true,
    balcony: true,
    garden: true,
    swimming_pool: true,
    security: true,
    internet: true,
    water: true,
    electricity: true,
    furnished: true,
    price: 500000,
    deposit: 100000,
    province: 'Northern',
    district: 'Musanze',
    sector: 'Musanze',
    cell: 'Musanze',
    village: 'Musanze Center',
    latitude: -1.6667,
    longitude: 29.6667,
    status: 'pending_approval',
    is_featured: false,
    views_count: 89,
    created_at: '2024-11-10T14:30:00Z',
    updated_at: '2024-11-10T14:30:00Z',
    owner: {
      id: 'user4',
      full_name: 'Sarah Williams',
      email: 'sarah@email.com',
    },
    images: [
      { id: 'img4', property_id: '2', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop', is_floor_plan: false, sort_order: 0, created_at: '2024-11-10T14:30:00Z' },
      { id: 'img5', property_id: '2', url: 'https://images.unsplash.com/photo-1600049512955-91b52a5d3d5c?q=80&w=2070&auto=format&fit=crop', is_floor_plan: false, sort_order: 1, created_at: '2024-11-10T14:30:00Z' },
    ],
    amenities: [],
    reviews: [
      { id: 'rev3', property_id: '2', user_id: 'user5', rating: 3, comment: 'Good property, but a bit expensive.', created_at: '2024-11-19T16:45:00Z', user: { full_name: 'Michael Brown' } },
    ],
  },
  '3': {
    id: '3',
    title: 'Studio in Kimihurura',
    description: 'Compact studio apartment in the vibrant Kimihurura area. Great for young professionals or students looking for an affordable and convenient place to stay.',
    category: 'residential',
    property_type: 'studio',
    bedrooms: 0,
    bathrooms: 1,
    kitchen: 1,
    parking: false,
    balcony: false,
    garden: false,
    swimming_pool: false,
    security: true,
    internet: true,
    water: true,
    electricity: true,
    furnished: true,
    price: 150000,
    deposit: 30000,
    province: 'Kigali',
    district: 'Kicukiro',
    sector: 'Kimihurura',
    cell: 'Kimihurura',
    village: 'Kimihurura',
    latitude: -1.9644,
    longitude: 30.0607,
    status: 'draft',
    is_featured: false,
    views_count: 0,
    created_at: '2024-11-05T08:15:00Z',
    updated_at: '2024-11-05T08:15:00Z',
    owner: {
      id: 'user6',
      full_name: 'Alice Mutesi',
      email: 'alice@email.com',
    },
    images: [
      { id: 'img6', property_id: '3', url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=2070&auto=format&fit=crop', is_floor_plan: false, sort_order: 0, created_at: '2024-11-05T08:15:00Z' },
      { id: 'img7', property_id: '3', url: 'https://images.unsplash.com/photo-1583608205778-0df3db32028a?q=80&w=2070&auto=format&fit=crop', is_floor_plan: false, sort_order: 1, created_at: '2024-11-05T08:15:00Z' },
    ],
    amenities: [],
    reviews: [],
  },
}

const statusConfig: Record<string, { variant: 'default' | 'warning' | 'success' | 'danger' | 'secondary'; label: string }> = {
  published: { variant: 'success', label: 'Published' },
  pending_approval: { variant: 'warning', label: 'Pending' },
  draft: { variant: 'secondary', label: 'Draft' },
  rejected: { variant: 'danger', label: 'Rejected' },
  rented: { variant: 'default', label: 'Rented' },
  sold: { variant: 'default', label: 'Sold' },
}

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'bungalow', label: 'Bungalow' },
]

const categories = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'luxury', label: 'Luxury' },
]

export function OwnerProperties() {
  const { t } = useTranslation()
  const deleteMutation = useDeleteProperty()
  const updateMutation = useUpdateProperty()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProperties(Object.values(mockPropertyDetail))
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSuccess = () => {
    setProperties(Object.values(mockPropertyDetail))
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setEditingProperty(null)
    setPropertyToDelete(null)
  }

  const handleDeleteSuccess = () => {
    setProperties(prev => prev.filter(p => p.id !== propertyToDelete?.id))
    const updatedMockPropertyDetail = { ...mockPropertyDetail }
    delete updatedMockPropertyDetail[propertyToDelete?.id || '']
    Object.assign(mockPropertyDetail, updatedMockPropertyDetail)
    setIsDeleteModalOpen(false)
    setPropertyToDelete(null)
  }

  const handleEditSuccess = () => {
    setProperties(Object.values(mockPropertyDetail))
    setIsEditModalOpen(false)
    setEditingProperty(null)
  }

  return (
    <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_properties')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_properties')}</p>
      </div>
      <Button onClick={() => {
        const emptyProperty = {
          id: 'new',
          title: '',
          description: '',
          category: 'residential',
          property_type: 'apartment',
          bedrooms: 0,
          bathrooms: 0,
          kitchen: 1,
          parking: false,
          balcony: false,
          garden: false,
          swimming_pool: false,
          security: true,
          internet: true,
          water: true,
          electricity: true,
          furnished: false,
          price: 0,
          deposit: 0,
          province: 'Kigali',
          district: 'Kicukiro',
          sector: 'Kicukiro',
          cell: 'Kicukiro',
          village: 'Kicukiro',
          latitude: null,
          longitude: null,
          status: 'draft',
          is_featured: false,
          views_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner: properties[0]?.owner || null,
          images: [],
          amenities: [],
          reviews: [],
        }
        setEditingProperty(emptyProperty)
        setIsEditModalOpen(true)
      }}>
        <Plus className="h-4 w-4" /> {t('add_property')}</Button>
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
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => {
          const propertyDetail = mockPropertyDetail[prop.id]
          if (propertyDetail) {
            setEditingProperty(propertyDetail)
            setIsEditModalOpen(true)
          }
        }}
      ><Edit className="h-4 w-4" /></Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => {
          const propertyDetail = mockPropertyDetail[prop.id]
          if (propertyDetail) {
            setPropertyToDelete(propertyDetail)
            setIsDeleteModalOpen(true)
          }
        }}
      ><Trash2 className="h-4 w-4" /></Button>
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

function PropertyDetailModal({ property, onClose }: { property: any; onClose: () => void }) {
  const { t } = useTranslation()
  const images = property.images || []
  const [currentImage, setCurrentImage] = useState(0)

  return (
    <Dialog open={!!property} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{property.title}</DialogTitle>
          <DialogDescription>
            {property.location} • {property.price} RWF/mo • {property.views_count} {t('views')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <img src={images[currentImage]?.url} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <Building2 className="h-12 w-12" />
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`h-2 w-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('bedrooms')}</p>
              <p className="text-gray-500">{property.bedrooms}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('bathrooms')}</p>
              <p className="text-gray-500">{property.bathrooms}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('kitchens')}</p>
              <p className="text-gray-500">{property.kitchen}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{t('status')}</p>
              <Badge variant={property.status === 'published' ? 'success' : property.status === 'pending_approval' ? 'warning' : 'secondary'} className="capitalize">{property.status.replace('_', ' ')}</Badge>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('description')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{property.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditPropertyModal({ property, isOpen, onClose, onSuccess }: { property: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    title: property?.title || '',
    price: property?.price?.toString() || '',
    status: property?.status || 'draft',
    location: `${property?.village}, ${property?.sector}, ${property?.district}, ${property?.province}`,
    views: property?.views_count || 0,
    description: property?.description || '',
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    is_featured: property?.is_featured || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({
        id: property.id,
        data: {
          title: formData.title,
          price: parseInt(formData.price),
          status: formData.status as PropertyStatus,
          is_featured: formData.is_featured,
          views_count: formData.views,
        },
      })
      toast.success(t('property_updated_successfully'))
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(t('failed_to_update_property'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('edit_property')}</DialogTitle>
          <DialogDescription>{t('edit_property_description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('title')}</label>
              <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('price')}, RWF</label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('views')}</label>
              <Input type="number" value={formData.views} onChange={(e) => setFormData(prev => ({ ...prev, views: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="featured" checked={formData.is_featured} onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))} />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('featured_property')}</label>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
            <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2">
              {updateMutation.isPending ? t('saving') : t('save_changes')}
              {updateMutation.isPending ? <X className="h-4 w-4 animate-spin" /> : null}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeletePropertyModal({ property, isOpen, onClose, onSuccess }: { property: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslation()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(property.id)
      toast.success(t('property_deleted_successfully'))
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(t('failed_to_delete_property'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('delete_property')}</DialogTitle>
          <DialogDescription>
            {t('delete_property_warning')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{property.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{property.location}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>{t('cancel')}</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="flex items-center gap-2">
            {deleteMutation.isPending ? t('deleting') : t('delete')}
            {deleteMutation.isPending ? <X className="h-4 w-4 animate-spin" /> : null}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
