import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { LocationSelect } from '@/components/ui/LocationSelect'
import {
  ChevronLeft, Building2, Save, Upload, Check, X, AlertCircle, ImageIcon,
  MapPin, DollarSign, Home, Sparkles, Loader2, Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useCreateProperty } from '@/hooks/useProperties'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', 'image/jfif', 'image/vnd.microsoft.icon']

const propertyTypes = ['House', 'Apartment', 'Villa', 'Studio', 'Commercial', 'Cottage'] as const
const categories = ['Rent', 'Sale', 'Short-term'] as const

const amenityFields = [
  { key: 'parking', label: 'Parking', icon: 'Car' },
  { key: 'balcony', label: 'Balcony', icon: 'Sun' },
  { key: 'garden', label: 'Garden', icon: 'Leaf' },
  { key: 'swimming_pool', label: 'Swimming Pool', icon: 'Waves' },
  { key: 'security', label: 'Security', icon: 'Shield' },
  { key: 'internet', label: 'Internet', icon: 'Wifi' },
  { key: 'water', label: 'Water Supply', icon: 'Droplets' },
  { key: 'electricity', label: 'Electricity', icon: 'Zap' },
  { key: 'furnished', label: 'Furnished', icon: 'Sofa' },
]

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').default(''),
  category: z.string(),
  property_type: z.string(),
  bedrooms: z.coerce.number().int().min(0).max(50).default(1),
  bathrooms: z.coerce.number().int().min(0).max(50).default(1),
  kitchen: z.coerce.number().int().min(0).max(20).default(1),
  price: z.coerce.number().positive('Price must be greater than 0'),
  deposit: z.coerce.number().min(0).nullable().default(null),
  province: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  sector: z.string().default(''),
  cell: z.string().default(''),
  village: z.string().default(''),
  latitude: z.string().default(''),
  longitude: z.string().default(''),
  parking: z.boolean().default(false),
  balcony: z.boolean().default(false),
  garden: z.boolean().default(false),
  swimming_pool: z.boolean().default(false),
  security: z.boolean().default(true),
  internet: z.boolean().default(true),
  water: z.boolean().default(true),
  electricity: z.boolean().default(true),
  furnished: z.boolean().default(false),
})

type PropertyFormData = z.infer<typeof propertySchema>

const defaultValues: PropertyFormData = {
  title: '',
  description: '',
  category: 'Rent',
  property_type: 'Apartment',
  bedrooms: 1,
  bathrooms: 1,
  kitchen: 1,
  price: '' as unknown as number,
  deposit: null,
  province: 'Kigali',
  district: '',
  sector: '',
  cell: '',
  village: '',
  latitude: '',
  longitude: '',
  parking: false,
  balcony: false,
  garden: false,
  swimming_pool: false,
  security: true,
  internet: true,
  water: true,
  electricity: true,
  furnished: false,
}

function FormSection({ icon: Icon, title, subtitle, step, children }: {
  icon: React.ElementType
  title: string
  subtitle?: string
  step: number
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-primary-500">
      <CardHeader className="bg-gradient-to-r from-primary-50/50 to-white dark:from-primary-950/20 dark:to-gray-800">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
            <span className="text-sm font-bold">{step}</span>
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon className="h-5 w-5 text-primary-500" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}

export function AddPropertyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const createProperty = useCreateProperty()
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [imageErrors, setImageErrors] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as never,
    defaultValues,
  })

  const formValues = watch()
  const hasImages = uploadedImages.length > 0

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !user) return

    setImageErrors([])
    const validationErrors: string[] = []
    const validFiles: File[] = []

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name}: Unsupported format. Use PNG, JPG, or WEBP.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(`${file.name}: File too large (max 10MB).`)
        continue
      }
      validFiles.push(file)
    }

    if (validationErrors.length > 0) {
      setImageErrors(validationErrors)
    }

    if (validFiles.length === 0) return

    setUploadingImages(true)
    const urls: string[] = []

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`)
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `properties/${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('property-images').upload(path, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(path)
        urls.push(publicUrl)
      }
      setUploadedImages(prev => [...prev, ...urls])
      toast.success(`${urls.length} image(s) uploaded successfully`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploadingImages(false)
      setUploadProgress(null)
      e.target.value = ''
    }
  }, [user])

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, j) => j !== index))
  }

  const removeAllImages = () => {
    setUploadedImages([])
  }

  const onSubmit = async (formData: PropertyFormData) => {
    if (!user) return

    setSubmitting(true)
    try {
      const propertyData = {
        owner_id: user.id,
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
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        parking: formData.parking,
        balcony: formData.balcony,
        garden: formData.garden,
        swimming_pool: formData.swimming_pool,
        security: formData.security,
        internet: formData.internet,
        water: formData.water,
        electricity: formData.electricity,
        furnished: formData.furnished,
        status: 'pending_approval',
        is_featured: false,
        views_count: 0,
      }

      const created = await createProperty.mutateAsync(propertyData as Partial<import('@/types').Property>)

      if (uploadedImages.length > 0 && created?.id) {
        const imageRows = uploadedImages.map((url, i) => ({
          property_id: created.id,
          url,
          is_floor_plan: false,
          sort_order: i,
        }))
        const { error: imgError } = await supabase.from('property_images').insert(imageRows as never)
        if (imgError) {
          console.error('Failed to save image metadata:', imgError)
          toast.error('Property created but images may not display. Contact support.')
        }
      }

      toast.success('Property submitted for approval!')
      navigate('/dashboard/properties')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit property'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty || hasImages) {
      setShowCancelDialog(true)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCancel}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('add_property')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('list_your_property')}</p>
        </div>
        {hasImages && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <ImageIcon className="h-3.5 w-3.5" />
            {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <FormSection icon={Home} title="Basic Information" subtitle="Tell us about your property" step={1}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Property Title <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title')}
                error={errors.title?.message}
                placeholder="e.g. Modern 2BR Apartment in Kicukiro"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your property in detail - size, condition, surroundings, nearby amenities..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.description?.message && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select {...register('category')} options={categories.map(c => ({ value: c, label: c }))} />
                {errors.category?.message && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <Select {...register('property_type')} options={propertyTypes.map(pt => ({ value: pt, label: pt }))} />
                {errors.property_type?.message && <p className="mt-1 text-sm text-red-500">{errors.property_type.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
                <Input type="number" min={0} {...register('bedrooms', { valueAsNumber: true })} />
                {errors.bedrooms?.message && <p className="mt-1 text-sm text-red-500">{errors.bedrooms.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
                <Input type="number" min={0} {...register('bathrooms', { valueAsNumber: true })} />
                {errors.bathrooms?.message && <p className="mt-1 text-sm text-red-500">{errors.bathrooms.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Kitchens</label>
                <Input type="number" min={0} {...register('kitchen', { valueAsNumber: true })} />
                {errors.kitchen?.message && <p className="mt-1 text-sm text-red-500">{errors.kitchen.message}</p>}
              </div>
            </div>
          </div>
        </FormSection>

        {/* Section 2: Pricing */}
        <FormSection icon={DollarSign} title="Pricing" subtitle="Set your price and deposit" step={2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (RWF/month) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">RWF</span>
                <input
                  type="number"
                  min={0}
                  {...register('price', { valueAsNumber: true })}
                  placeholder="250000"
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              {errors.price?.message && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Deposit (RWF)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">RWF</span>
                <input
                  type="number"
                  min={0}
                  {...register('deposit', { valueAsNumber: true, setValueAs: (v) => v === '' || v === null ? null : Number(v) })}
                  placeholder="50000"
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              {errors.deposit?.message && <p className="mt-1 text-sm text-red-500">{errors.deposit.message}</p>}
            </div>
          </div>
        </FormSection>

        {/* Section 3: Location */}
        <FormSection icon={MapPin} title="Location" subtitle="Where is your property located?" step={3}>
          <div className="space-y-4">
            <LocationSelect
              selectedProvince={formValues.province}
              selectedDistrict={formValues.district}
              selectedSector={formValues.sector}
              selectedCell={formValues.cell}
              selectedVillage={formValues.village}
              onChange={(field, value) => setValue(field as keyof PropertyFormData, value, { shouldValidate: true })}
            />
            {errors.district?.message && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.district.message}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude (optional)</label>
                <Input {...register('latitude')} placeholder="e.g. -1.9541" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude (optional)</label>
                <Input {...register('longitude')} placeholder="e.g. 30.0588" />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Section 4: Amenities */}
        <FormSection icon={Sparkles} title="Amenities & Features" subtitle="What does your property offer?" step={4}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenityFields.map(({ key, label }) => {
              const isOn = formValues[key as keyof PropertyFormData] as boolean
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue(key as keyof PropertyFormData, !isOn, { shouldDirty: true })}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                    isOn
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs transition-colors ${
                    isOn ? 'bg-primary-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                  }`}>
                    {isOn ? <Check className="h-3 w-3" /> : null}
                  </span>
                  {label}
                </button>
              )
            })}
          </div>
        </FormSection>

        {/* Section 5: Images */}
        <FormSection icon={ImageIcon} title="Property Images" subtitle="Upload photos of your property" step={5}>
          <div className="space-y-4">
            {imageErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  Image upload issues:
                </div>
                <ul className="mt-1 space-y-1">
                  {imageErrors.map((err, i) => (
                    <li key={i} className="text-xs text-red-600 dark:text-red-400">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500 transition-colors">
              {uploadingImages ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {uploadProgress || 'Uploading...'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, JFIF up to 10MB each</p>
                  </div>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/jpg,image/jfif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImages}
              />
            </label>

            {hasImages && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} selected
                  </p>
                  <button
                    type="button"
                    onClick={removeAllImages}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove all
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <img src={url} alt={`Property ${i + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <span className="absolute bottom-1 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormSection>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Button type="button" variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex items-center gap-2 min-w-[180px]">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Submit for Review
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave this page?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Any entered data and uploaded images will be lost.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Continue Editing</Button>
            <Button variant="destructive" onClick={() => { setShowCancelDialog(false); navigate(-1) }}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
