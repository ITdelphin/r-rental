import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Building2, Plus, Edit, Trash2, MapPin, Eye, ExternalLink, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type { Property, PropertyStatus } from '@/types'

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
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) fetchProperties()
  }, [user])

  const fetchProperties = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Admin/super_admin see all properties; owners see their own
      let query = supabase.from('properties').select('*, images:property_images(*), reviews(*)').order('created_at', { ascending: false })
      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        query = query.eq('owner_id', user.id)
      }
      const { data, error } = await query
      if (error) throw error
      setProperties((data || []) as unknown as Property[])
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (prop: Property) => {
    setEditingProperty(prop)
    setIsEditModalOpen(true)
  }

  const handleDelete = (prop: Property) => {
    setPropertyToDelete(prop)
    setIsDeleteModalOpen(true)
  }

  const handleSaveEdit = async (updates: Partial<Property>) => {
    if (!editingProperty) return
    setSaving(true)
    try {
      const { error } = await supabase.from('properties').update(updates as never).eq('id', editingProperty.id)
      if (error) throw error
      toast.success(t('property_updated_successfully'))
      setIsEditModalOpen(false)
      setEditingProperty(null)
      fetchProperties()
    } catch {
      toast.error(t('failed_to_update_property'))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyToDelete.id)
      if (error) throw error
      toast.success(t('property_deleted_successfully'))
      setIsDeleteModalOpen(false)
      setPropertyToDelete(null)
      fetchProperties()
    } catch {
      toast.error(t('failed_to_delete_property'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('my_properties')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_your_properties')}</p>
        </div>
        <Button onClick={() => navigate('/dashboard/properties/add')}>
          <Plus className="h-4 w-4" /> {t('add_property')}
        </Button>
      </div>

      {loading ? (
        <ListSkeleton items={3} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('no_properties_listed')}
          description={t('no_properties_description')}
          actionLabel={t('add_property')}
          onAction={() => navigate('/dashboard/properties/add')}
        />
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const config = statusConfig[prop.status] || statusConfig.draft
            const image = prop.images?.[0]?.url
            return (
              <Card key={prop.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        {image ? (
                          <img src={image} alt={prop.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{prop.title}</h3>
                          <Badge variant={config.variant}>{t(config.label.toLowerCase())}</Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3 shrink-0" /> {prop.district}, {prop.province}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-sm">
                          <span className="font-medium text-primary-600">RWF {prop.price.toLocaleString()}/{t('mo')}</span>
                          <span className="text-gray-400 flex items-center gap-1"><Eye className="h-3 w-3" /> {prop.views_count}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/properties/${prop.id}/edit`)} title="Edit full details">
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/properties/${prop.id}`)} title="View on site">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(prop)} title="Quick edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(prop)} title="Delete">
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

      {/* Edit Modal */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingProperty(null) }}
          onSave={handleSaveEdit}
          saving={saving}
        />
      )}

      {/* Delete Modal */}
      {propertyToDelete && (
        <Dialog open={isDeleteModalOpen} onOpenChange={open => !open && setIsDeleteModalOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('delete_property')}</DialogTitle>
              <DialogDescription>{t('delete_property_warning')}</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{propertyToDelete.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{propertyToDelete.district}, {propertyToDelete.province}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>{t('cancel')}</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? t('deleting') : t('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function EditPropertyModal({ property, isOpen, onClose, onSave, saving }: {
  property: Property
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<Property>) => void
  saving: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    title: property.title || '',
    price: String(property.price || ''),
    status: property.status || 'draft',
    description: property.description || '',
    is_featured: property.is_featured || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: form.title,
      price: parseInt(form.price),
      status: form.status as PropertyStatus,
      description: form.description,
      is_featured: form.is_featured,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('edit_property')}</DialogTitle>
          <DialogDescription>{t('edit_property_description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('title')}</label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('price')}, RWF</label>
              <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</label>
            <Select
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value as PropertyStatus }))}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'pending_approval', label: 'Pending Approval' },
                { value: 'published', label: 'Published' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'rented', label: 'Rented' },
                { value: 'sold', label: 'Sold' },
              ]}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('featured_property')}</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" disabled={saving}>{saving ? t('saving') : t('save_changes')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
