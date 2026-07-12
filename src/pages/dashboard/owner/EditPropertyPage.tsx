import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { LocationSelect } from '@/components/ui/LocationSelect'
import {
  ChevronLeft, Building2, Save, Upload, Check, X, AlertCircle, ImageIcon,
  MapPin, DollarSign, Home, Sparkles, Loader2, Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useProperty, useUpdateProperty } from '@/hooks/useProperties'
import toast from 'react-hot-toast'
import type { Property } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', 'image/jfif']

const propertyTypes = ['House', 'Apartment', 'Villa', 'Studio', 'Commercial', 'Cottage'] as const
const categories = ['Rent', 'Sale', 'Short-term'] as const

const amenityFields = [
  { key: 'parking', label: 'Parking' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'garden', label: 'Garden' },
  { key: 'swimming_pool', label: 'Swimming Pool' },
  { key: 'security', label: 'Security' },
  { key: 'internet', label: 'Internet' },
  { key: 'water', label: 'Water Supply' },
  { key: 'electricity', label: 'Electricity' },
  { key: 'furnished', label: 'Furnished' },
]

const editSchema = z.object({
  title: z.string().min(5, 'title_min_length').max(200, 'title_too_long'),
  description: z.string().max(2000, 'description_too_long').default(''),
  category: z.string(),
  property_type: z.string(),
  bedrooms: z.coerce.number().int().min(0).max(50).default(1),
  bathrooms: z.coerce.number().int().min(0).max(50).default(1),
  kitchen: z.coerce.number().int().min(0).max(20).default(1),
  price: z.coerce.number().positive('price_positive'),
  deposit: z.coerce.number().min(0).nullable().default(null),
  province: z.string().min(1, 'province_required'),
  district: z.string().min(1, 'district_required'),
  sector: z.string().default(''),
  cell: z.string().default(''),
  village: z.string().default(''),
  whatsapp_number: z.string().default(''),
  parking: z.boolean().default(false),
  balcony: z.boolean().default(false),
  garden: z.boolean().default(false),
  swimming_pool: z.boolean().default(false),
  security: z.boolean().default(true),
  internet: z.boolean().default(true),
  water: z.boolean().default(true),
  electricity: z.boolean().default(true),
  furnished: z.boolean().default(false),
  status: z.string().default('draft'),
})

type EditFormData = z.infer<typeof editSchema>

function FormSection({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-primary-500">
      <CardHeader className="bg-gradient-to-r from-primary-50/50 to-white dark:from-primary-950/20 dark:to-gray-800">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary-500" />
            {title}
          </CardTitle>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}

export function EditPropertyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: property, isLoading: loadingProperty } = useProperty(id || '')
  const updateProperty = useUpdateProperty()
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [imageErrors, setImageErrors] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema) as never,
  })

  const formValues = watch()

  useEffect(() => {
    if (property && !initialized) {
      const isOwner = property.owner_id === user?.id
      const isAdmin = false
      if (!isOwner && !isAdmin) {
        toast.error(t('no_permission_to_edit'))
        navigate('/dashboard/properties')
        return
      }

      setExistingImages(
        (property.images || []).map((img: { id: string; url: string }) => ({
          id: img.id,
          url: img.url,
        }))
      )

      reset({
        title: property.title || '',
        description: property.description || '',
        category: (property.category as EditFormData['category']) || 'Rent',
        property_type: (property.property_type as EditFormData['property_type']) || 'Apartment',
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        kitchen: property.kitchen || 1,
        price: property.price || 0,
        deposit: property.deposit,
        province: property.province || 'Kigali',
        district: property.district || '',
        sector: property.sector || '',
        cell: property.cell || '',
        village: property.village || '',
        whatsapp_number: property.whatsapp_number || '',
        parking: property.parking || false,
        balcony: property.balcony || false,
        garden: property.garden || false,
        swimming_pool: property.swimming_pool || false,
        security: property.security ?? true,
        internet: property.internet ?? true,
        water: property.water ?? true,
        electricity: property.electricity ?? true,
        furnished: property.furnished || false,
        status: property.status || 'draft',
      })
      setInitialized(true)
    }
  }, [property, initialized, reset, user, navigate])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !user) return

    setImageErrors([])
    const validationErrors: string[] = []
    const validFiles: File[] = []

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name}: ${t('unsupported_format')}`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(`${file.name}: ${t('file_too_large')}`)
        continue
      }
      validFiles.push(file)
    }

    if (validationErrors.length > 0) setImageErrors(validationErrors)
    if (validFiles.length === 0) return

    setUploadingImages(true)
    const urls: string[] = []

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setUploadProgress(t('uploading_n_of_m', { current: i + 1, total: validFiles.length }))
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `properties/${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('property-images').upload(path, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(path)
        urls.push(publicUrl)
      }
      setUploadedImages(prev => [...prev, ...urls])
      toast.success(t('images_uploaded_successfully', { count: urls.length }))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('upload_failed'))
    } finally {
      setUploadingImages(false)
      setUploadProgress(null)
      e.target.value = ''
    }
  }, [user])

  const removeExistingImage = async (imageId: string) => {
    const confirmed = window.confirm(t('remove_this_image'))
    if (!confirmed) return
    try {
      const { error } = await supabase.from('property_images').delete().eq('id', imageId)
      if (error) throw error
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
      toast.success(t('image_removed'))
    } catch {
      toast.error(t('failed_to_remove_image'))
    }
  }

  const removeNewImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, j) => j !== index))
  }

  const onSubmit = async (formData: EditFormData) => {
    if (!id) return
    setSubmitting(true)
    try {
      const updates = {
        title: formData.title,
        description: formData.description || '',
        category: formData.category,
        property_type: formData.property_type,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        kitchen: formData.kitchen,
        price: formData.price,
        deposit: formData.deposit,
        province: formData.province,
        district: formData.district,
        sector: formData.sector || '',
        cell: formData.cell || '',
        village: formData.village || '',
        whatsapp_number: formData.whatsapp_number || null,
        parking: formData.parking,
        balcony: formData.balcony,
        garden: formData.garden,
        swimming_pool: formData.swimming_pool,
        security: formData.security,
        internet: formData.internet,
        water: formData.water,
        electricity: formData.electricity,
        furnished: formData.furnished,
        status: formData.status,
      }

      await updateProperty.mutateAsync({ id, data: updates as Partial<Property> })

      if (uploadedImages.length > 0) {
        const imageRows = uploadedImages.map((url, i) => ({
          property_id: id,
          url,
          is_floor_plan: false,
          sort_order: existingImages.length + i,
        }))
        const { error: imgError } = await supabase.from('property_images').insert(imageRows as never)
        if (imgError) {
          console.error('Failed to save image metadata:', imgError)
          toast.error(t('property_updated_image_issue'))
        }
      }

      toast.success(t('property_updated_successfully'))
      navigate('/dashboard/properties')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('failed_to_update_property'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty || uploadedImages.length > 0) {
      setShowCancelDialog(true)
    } else {
      navigate('/dashboard/properties')
    }
  }

  if (loadingProperty) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Building2 className="h-12 w-12 mb-3" />
        <p>{t('property_not_found')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/properties')}>
          {t('back_to_properties')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleCancel}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('edit_property')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{property.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('status')}</label>
            <Select
              {...register('status')}
              options={[
                { value: 'draft', label: t('draft') },
                { value: 'pending_approval', label: t('pending_approval') },
                { value: 'published', label: t('published') },
                { value: 'rejected', label: t('rejected') },
                { value: 'rented', label: t('rented') },
                { value: 'sold', label: t('sold') },
              ]}
            />
          </div>
        </div>

        <FormSection icon={Home} title={t('basic_information')} subtitle={t('edit_property_details')}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('property_title')} <span className="text-red-500">*</span>
              </label>
              <Input {...register('title')} error={errors.title?.message ? t(errors.title.message) : undefined} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('category')} *</label>
                <Select {...register('category')} options={categories.map(c => ({ value: c, label: t(c.replace(/[\s-]+/g, '_').toLowerCase()) }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('property_type')} *</label>
                <Select {...register('property_type')} options={propertyTypes.map(pt => ({ value: pt, label: t(pt.toLowerCase()) }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('bedrooms')}</label>
                <Input type="number" min={0} {...register('bedrooms', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('bathrooms')}</label>
                <Input type="number" min={0} {...register('bathrooms', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('kitchens')}</label>
                <Input type="number" min={0} {...register('kitchen', { valueAsNumber: true })} />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection icon={DollarSign} title={t('pricing')} subtitle={t('update_price_and_deposit')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('price_rwf_month')} *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">RWF</span>
                <input
                  type="number"
                  min={0}
                  {...register('price', { valueAsNumber: true })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              {errors.price?.message && <p className="mt-1 text-sm text-red-500">{t(errors.price.message)}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('deposit_rwf')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">RWF</span>
                <input
                  type="number"
                  min={0}
                  {...register('deposit', { valueAsNumber: true, setValueAs: (v) => v === '' || v === null ? null : Number(v) })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection icon={MapPin} title={t('location')} subtitle={t('update_location')}>
          <div className="space-y-4">
            <LocationSelect
              selectedProvince={formValues.province}
              selectedDistrict={formValues.district}
              selectedSector={formValues.sector}
              selectedCell={formValues.cell}
              selectedVillage={formValues.village}
              onChange={(field, value) => setValue(field as keyof EditFormData, value, { shouldValidate: true })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('whatsapp_number_optional')}</label>
              <Input {...register('whatsapp_number')} placeholder={t('whatsapp_placeholder')} />
            </div>
          </div>
        </FormSection>

        <FormSection icon={Sparkles} title={t('amenities_and_features')} subtitle={t('update_amenities')}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenityFields.map(({ key, label }) => {
              const isOn = formValues[key as keyof EditFormData] as boolean
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue(key as keyof EditFormData, !isOn, { shouldDirty: true })}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                    isOn
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs transition-colors ${
                    isOn ? 'bg-primary-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                  }`}>
                    {isOn ? <Check className="h-3 w-3" /> : null}
                  </span>
                  {t(key)}
                </button>
              )
            })}
          </div>
        </FormSection>

        <FormSection icon={ImageIcon} title={t('property_images')} subtitle={t('manage_images')}>
          <div className="space-y-4">
            {imageErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {t('image_issues')}:
                </div>
                <ul className="mt-1 space-y-1">
                  {imageErrors.map((err, i) => (
                    <li key={i} className="text-xs text-red-600 dark:text-red-400">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('current_images')}</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {existingImages.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500 transition-colors">
              {uploadingImages ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <p className="text-sm font-medium text-primary-600">{uploadProgress || t('uploading')}</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('click_to_add_more_images')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('accepted_image_formats')}</p>
                  </div>
                </>
              )}
              <input type="file" multiple               accept="image/png,image/jpeg,image/webp,image/jpg,image/jfif" className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
            </label>

            {uploadedImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('new_images', { count: uploadedImages.length })}</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4" /> {t('cancel')}
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-[180px]">
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t('saving')}</>
            ) : (
              <><Save className="h-4 w-4" /> {t('save_changes')}</>
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('discard_changes')}</DialogTitle>
            <DialogDescription>{t('unsaved_changes_are_you_sure')}</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t('unsaved_changes_lost')}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>{t('continue_editing')}</Button>
            <Button variant="destructive" onClick={() => { setShowCancelDialog(false); navigate('/dashboard/properties') }}>
              {t('discard_changes_confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
